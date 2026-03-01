// analysis.js — Tab 4: Position Analysis
// Distribution pies, monthly dividend income, P/L ranking, bank cash flow

import { AppState } from './state.js';
import { formatNumber, formatMonth, getMonthLabels, monthlyDividend, toNTD, COLORS } from './utils.js';

let distributionChart = null;
let dividendChart = null;
let plRankingChart = null;
let cashFlowChart = null;
let totalAssetChart = null;

let distMode = 'bank'; // 'bank' | 'currency' | 'dividendType'

export function initAnalysis() {
    // Distribution toggle buttons
    document.querySelectorAll('.dist-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.dist-toggle').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            distMode = btn.dataset.mode;
            renderDistribution();
        });
    });
}

export function renderAnalysis() {
    renderTotalAsset();
    renderDistribution();
    renderDividendIncome();
    renderPLRanking();
    renderCashFlow();
}

// --- Total Asset Trend ---

function renderTotalAsset() {
    const canvas = document.getElementById('totalAssetChart2');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const { rawData, filteredFunds } = AppState;
    const months = rawData.months;
    const labels = getMonthLabels(months);

    const dataPoints = months.map(m => {
        let total = 0;
        Object.values(filteredFunds).forEach(fund => {
            const h = rawData.history[fund.cert]?.[m];
            if (h && h.current_value) {
                total += toNTD(h.current_value, fund.currency);
            }
        });
        return Math.round(total);
    });

    if (totalAssetChart) totalAssetChart.destroy();

    totalAssetChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: '總資產約當值 (NTD)',
                data: dataPoints,
                borderColor: '#2c3e50',
                backgroundColor: 'rgba(44, 62, 80, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: false } },
        },
    });
}

// --- Distribution Pie Chart ---

function renderDistribution() {
    const canvas = document.getElementById('distributionChart2');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const { rawData, filteredFunds } = AppState;
    const latestMonth = rawData.months[rawData.months.length - 1];

    const distData = {};
    Object.values(filteredFunds).forEach(fund => {
        const h = rawData.history[fund.cert]?.[latestMonth];
        if (!h || !h.current_value) return;

        const val = toNTD(h.current_value, fund.currency);
        let key;
        switch (distMode) {
            case 'currency': key = fund.currency; break;
            case 'dividendType': key = fund.dividend_type === 'None' ? '無' : fund.dividend_type; break;
            default: key = fund.bank; break;
        }
        distData[key] = (distData[key] || 0) + val;
    });

    const sortedEntries = Object.entries(distData).sort((a, b) => b[1] - a[1]);

    if (distributionChart) distributionChart.destroy();

    distributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: sortedEntries.map(e => e[0]),
            datasets: [{
                data: sortedEntries.map(e => Math.round(e[1])),
                backgroundColor: COLORS.chartPalette.slice(0, sortedEntries.length),
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
                            const pct = ((ctx.parsed / total) * 100).toFixed(1);
                            return `${ctx.label}: ${formatNumber(ctx.parsed)} NTD (${pct}%)`;
                        }
                    }
                }
            },
        },
    });
}

// --- Monthly Dividend Income ---

function renderDividendIncome() {
    const canvas = document.getElementById('dividendIncomeChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const { rawData, filteredFunds } = AppState;
    const months = rawData.months;
    const labels = getMonthLabels(months);

    const monthlyTotals = months.map((m, idx) => {
        let total = 0;
        Object.values(filteredFunds).forEach(fund => {
            if (fund.dividend_type === '無' || fund.dividend_type === 'None') return;
            const h = rawData.history[fund.cert];
            const currentCumDiv = h?.[m]?.cumulative_dividend ?? 0;
            const prevCumDiv = idx > 0 ? (h?.[months[idx - 1]]?.cumulative_dividend ?? 0) : 0;
            const monthly = monthlyDividend(currentCumDiv, idx > 0 ? prevCumDiv : null);
            total += toNTD(monthly, fund.currency);
        });
        return Math.round(total);
    });

    if (dividendChart) dividendChart.destroy();

    dividendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: '月配息收入 (約當NTD)',
                data: monthlyTotals,
                backgroundColor: '#3498db',
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: { y: { beginAtZero: true } },
        },
    });
}

// --- P/L Ranking ---

function renderPLRanking() {
    const canvas = document.getElementById('plRankingChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const { rawData, filteredFunds } = AppState;
    const latestMonth = rawData.months[rawData.months.length - 1];

    const items = Object.values(filteredFunds).map(fund => {
        const h = rawData.history[fund.cert]?.[latestMonth];
        return {
            name: fund.name,
            pl: h ? h.profit_loss : 0,
            currency: fund.currency,
        };
    }).sort((a, b) => b.pl - a.pl);

    if (plRankingChart) plRankingChart.destroy();

    plRankingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: items.map(i => i.name.length > 10 ? i.name.substring(0, 10) + '…' : i.name),
            datasets: [{
                label: '含息損益 (原幣)',
                data: items.map(i => Math.round(i.pl)),
                backgroundColor: items.map(i => i.pl >= 0 ? COLORS.up : COLORS.down),
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Horizontal bars
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${formatNumber(ctx.parsed.x)} ${items[ctx.dataIndex].currency}`
                    }
                }
            },
            scales: {
                x: { beginAtZero: true },
            },
        },
    });
}

// --- Bank Cash Flow (Stacked Bar) ---

function renderCashFlow() {
    const canvas = document.getElementById('cashFlowChart2');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const { rawData, filteredFunds } = AppState;
    const months = rawData.months;
    const labels = getMonthLabels(months);

    const banks = [...new Set(Object.values(filteredFunds).map(f => f.bank))].sort();

    const datasets = banks.map((bank, idx) => {
        const data = months.map(m => {
            let sum = 0;
            Object.values(filteredFunds)
                .filter(f => f.bank === bank)
                .forEach(f => {
                    const h = rawData.history[f.cert]?.[m];
                    if (h && h.cumulative_dividend) {
                        sum += toNTD(h.cumulative_dividend, f.currency);
                    }
                });
            return Math.round(sum);
        });
        return {
            label: bank,
            data,
            backgroundColor: COLORS.chartPalette[idx % COLORS.chartPalette.length],
        };
    });

    if (cashFlowChart) cashFlowChart.destroy();

    cashFlowChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true },
            },
        },
    });
}
