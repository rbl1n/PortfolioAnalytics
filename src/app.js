// Global state
let rawData = null;
let filteredFunds = {};
let currentFilters = {
    bank: 'all',
    currency: 'all',
    dividend_type: 'all'
};
let selectedFundCert = null;
let fundReturnType = 'inclusive'; // inclusive or exclusive
let distributionMode = 'bank'; // bank or currency

// Chart instances
let totalAssetChart = null;
let cashFlowChart = null;
let distributionChart = null;
let fundDetailChart = null;

// Colors
const COLORS = [
    '#3498db', '#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6',
    '#34495e', '#16a085', '#e67e22', '#7f8c8d', '#d35400'
];

document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        const response = await fetch('../data/processed/data.json');
        rawData = await response.json();

        setupFilters();
        setupEventListeners();
        applyFilters();

    } catch (error) {
        console.error("Error loading data:", error);
        document.querySelector('main').innerHTML = `<h2>無法載入資料，請確認 data.json 是否存在。</h2>`;
    }
}

function setupFilters() {
    const banks = new Set();

    Object.values(rawData.funds).forEach(f => {
        banks.add(f.bank);
    });

    // Populate Bank select
    const bankSelect = document.getElementById('bank-filter');
    Array.from(banks).sort().forEach(b => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        bankSelect.appendChild(opt);
    });

    // Populate Fund select
    updateFundSelector();
}

function updateFundSelector() {
    const fundSelect = document.getElementById('fund-filter');
    fundSelect.innerHTML = '';

    // Sort funds by bank then name
    const sortedFunds = Object.values(filteredFunds).sort((a, b) => {
        if (a.bank !== b.bank) return a.bank.localeCompare(b.bank);
        return a.name.localeCompare(b.name);
    });

    sortedFunds.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.cert;
        opt.textContent = `[${f.bank}] ${f.name} (${f.currency})`;
        fundSelect.appendChild(opt);
    });

    if (sortedFunds.length > 0) {
        selectedFundCert = sortedFunds[0].cert;
        renderFundDetail();
    } else {
        selectedFundCert = null;
        if (fundDetailChart) fundDetailChart.destroy();
        document.getElementById('fund-current-value').textContent = '--';
        document.getElementById('fund-dividend').textContent = '--';
        document.getElementById('fund-trend-indicator').textContent = '';
    }
}

function setupEventListeners() {
    // Filters
    document.getElementById('bank-filter').addEventListener('change', (e) => {
        currentFilters.bank = e.target.value;
        applyFilters();
    });
    document.getElementById('currency-filter').addEventListener('change', (e) => {
        currentFilters.currency = e.target.value;
        applyFilters();
    });
    document.getElementById('dividend-filter').addEventListener('change', (e) => {
        currentFilters.dividend_type = e.target.value;
        applyFilters();
    });

    // Fund selector
    document.getElementById('fund-filter').addEventListener('change', (e) => {
        selectedFundCert = e.target.value;
        renderFundDetail();
    });

    // Toggles
    document.querySelectorAll('.toggle-btn[data-target]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.toggle-btn[data-target]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            distributionMode = e.target.dataset.target;
            renderDistributionChart();
        });
    });

    document.querySelectorAll('.return-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.return-toggle').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            fundReturnType = e.target.dataset.mode;
            renderFundDetail();
        });
    });
}

function applyFilters() {
    filteredFunds = {};

    Object.values(rawData.funds).forEach(f => {
        let pass = true;
        if (currentFilters.bank !== 'all' && f.bank !== currentFilters.bank) pass = false;
        if (currentFilters.currency !== 'all' && f.currency !== currentFilters.currency) pass = false;
        if (currentFilters.dividend_type !== 'all' && f.dividend_type !== currentFilters.dividend_type) pass = false;

        if (pass) {
            filteredFunds[f.cert] = f;
        }
    });

    updateFundSelector();
    renderOverviewCharts();
}

function renderOverviewCharts() {
    renderTotalAssetChart();
    renderCashFlowChart();
    renderDistributionChart();
}

function renderTotalAssetChart() {
    const ctx = document.getElementById('totalAssetChart').getContext('2d');
    const months = rawData.months;
    const dataPoints = [];

    // In MVP, we just sum up the existing NTD values if they exist, or rough mock total
    // Note: Python script extracted fund info. We need to aggregate across filtered funds.
    // For simplicity, we just aggregate current_value. In reality, currency conversion needed.
    // Since we don't have exchange rates in the JSON yet, we group by currency lines.

    months.forEach(m => {
        let ntdTotal = 0;
        Object.keys(filteredFunds).forEach(cert => {
            const hist = rawData.history[cert][m];
            if (hist && hist.current_value) {
                // Dummy conversion for illustration: USD*32, CNY*4.5
                let val = hist.current_value;
                if (filteredFunds[cert].currency === 'USD') val *= 32;
                if (filteredFunds[cert].currency === 'CNY') val *= 4.5;
                ntdTotal += val;
            }
        });
        dataPoints.push(Math.round(ntdTotal));
    });

    if (totalAssetChart) totalAssetChart.destroy();

    totalAssetChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: '總資產約當值 (NTD)',
                data: dataPoints,
                borderColor: '#2c3e50',
                backgroundColor: 'rgba(44, 62, 80, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}

function renderCashFlowChart() {
    const ctx = document.getElementById('cashFlowChart').getContext('2d');
    const months = rawData.months;

    // Group dividends by bank over months
    const datasets = [];
    const banks = new Set(Object.values(filteredFunds).map(f => f.bank));

    let colorIdx = 0;
    banks.forEach(bank => {
        const data = [];
        months.forEach(m => {
            let divSum = 0;
            Object.values(filteredFunds).filter(f => f.bank === bank).forEach(f => {
                const hist = rawData.history[f.cert][m];
                if (hist && hist.cumulative_dividend) {
                    let val = hist.cumulative_dividend;
                    // Dummy conversion
                    if (f.currency === 'USD') val *= 32;
                    if (f.currency === 'CNY') val *= 4.5;
                    divSum += val;
                }
            });
            data.push(Math.round(divSum));
        });

        datasets.push({
            label: bank,
            data: data,
            backgroundColor: COLORS[colorIdx % COLORS.length]
        });
        colorIdx++;
    });

    if (cashFlowChart) cashFlowChart.destroy();

    cashFlowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            }
        }
    });
}

function renderDistributionChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');

    // Use the latest month
    const latestMonth = rawData.months[rawData.months.length - 1];

    const distData = {};

    Object.values(filteredFunds).forEach(f => {
        const hist = rawData.history[f.cert][latestMonth];
        if (hist && hist.current_value) {
            let val = hist.current_value;
            // Dummy conversion
            if (f.currency === 'USD') val *= 32;
            if (f.currency === 'CNY') val *= 4.5;

            const key = (distributionMode === 'bank') ? f.bank : f.currency;
            distData[key] = (distData[key] || 0) + val;
        }
    });

    const labels = Object.keys(distData);
    const data = Object.values(distData);

    if (distributionChart) distributionChart.destroy();

    distributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: COLORS.slice(0, labels.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => { sum += data; });
                        let percentage = (value * 100 / sum).toFixed(1) + "%";
                        return percentage;
                    },
                    color: '#fff',
                }
            }
        }
    });
}

function renderFundDetail() {
    if (!selectedFundCert) return;

    const fund = rawData.funds[selectedFundCert];
    const history = rawData.history[selectedFundCert];
    const months = rawData.months;

    // Update Info Card (latest month)
    const latestMonth = months[months.length - 1];
    const latestData = history[latestMonth];

    if (latestData) {
        document.getElementById('fund-current-value').textContent =
            `${latestData.current_value.toLocaleString()} ${fund.currency}`;

        document.getElementById('fund-dividend').textContent =
            `${latestData.cumulative_dividend.toLocaleString()} ${fund.currency}`;

        const trendEl = document.getElementById('fund-trend-indicator');
        trendEl.className = 'trend-icon'; // reset
        if (latestData.trend === 'up') {
            trendEl.textContent = '▲';
            trendEl.classList.add('trend-up');
        } else if (latestData.trend === 'down') {
            trendEl.textContent = '▼';
            trendEl.classList.add('trend-down');
        } else {
            trendEl.textContent = '-';
            trendEl.classList.add('trend-flat');
        }
    }

    // Chart
    const ctx = document.getElementById('fundDetailChart').getContext('2d');
    const dataPoints = [];

    months.forEach(m => {
        const h = history[m];
        if (h) {
            // Include or exclude dividends
            if (fundReturnType === 'inclusive') {
                dataPoints.push(h.profit_loss);
            } else {
                dataPoints.push(h.profit_loss_ex_div);
            }
        } else {
            dataPoints.push(null);
        }
    });

    if (fundDetailChart) fundDetailChart.destroy();

    const label = fundReturnType === 'inclusive' ? '含息損益 (原幣)' : '不含息損益 (原幣)';

    fundDetailChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: label,
                data: dataPoints,
                borderColor: '#e67e22',
                backgroundColor: 'rgba(230, 126, 34, 0.1)',
                borderWidth: 3,
                pointRadius: 5,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false } // Can be negative
            }
        }
    });
}
