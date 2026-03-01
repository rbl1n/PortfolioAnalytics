// chart.js — Tab 2: Trend analysis with line chart
// Supports: single fund, multi-line comparison, aggregate mode, crosshair

import { AppState } from './state.js';
import { formatNumber, formatPercent, formatMonth, getMonthLabels, annualizedReturn, deriveCostBasis, getHoldingMonths, trendIcon, trendClass, toNTD, COLORS } from './utils.js';

let chartInstance = null;

export function initChart() {
    // Fund selector change handler
    const selector = document.getElementById('chart-fund-select');
    if (selector) {
        selector.addEventListener('change', (e) => {
            AppState.selectedCert = e.target.value;
            AppState.chartConfig.selectedCerts = [e.target.value];
            renderChart();
        });
    }

    // Dividend toggle
    document.querySelectorAll('.chart-div-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-div-toggle').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.chartConfig.includeDividend = btn.dataset.mode === 'inclusive';
            renderChart();
        });
    });

    // Aggregate toggle
    const aggBtn = document.getElementById('aggregate-toggle');
    if (aggBtn) {
        aggBtn.addEventListener('click', () => {
            AppState.chartConfig.aggregateMode = !AppState.chartConfig.aggregateMode;
            aggBtn.classList.toggle('active', AppState.chartConfig.aggregateMode);
            renderChart();
        });
    }

    // Comparison add
    const addBtn = document.getElementById('add-comparison-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const select = document.getElementById('comparison-fund-select');
            if (!select) return;
            const cert = select.value;
            if (cert && !AppState.chartConfig.selectedCerts.includes(cert)) {
                if (AppState.chartConfig.selectedCerts.length >= 5) {
                    alert('最多同時比較 5 檔基金');
                    return;
                }
                AppState.chartConfig.selectedCerts.push(cert);
                renderChart();
            }
        });
    }

    // Clear comparison
    const clearBtn = document.getElementById('clear-comparison-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (AppState.selectedCert) {
                AppState.chartConfig.selectedCerts = [AppState.selectedCert];
            } else {
                AppState.chartConfig.selectedCerts = [];
            }
            AppState.chartConfig.aggregateMode = false;
            const aggToggle = document.getElementById('aggregate-toggle');
            if (aggToggle) aggToggle.classList.remove('active');
            renderChart();
        });
    }
}

export function renderChart() {
    renderFundSelector();
    renderSummaryCard();
    renderComparisonSelector();
    renderLineChart();
}

function renderFundSelector() {
    const selector = document.getElementById('chart-fund-select');
    if (!selector) return;

    const funds = Object.values(AppState.filteredFunds).sort((a, b) => {
        if (a.bank !== b.bank) return a.bank.localeCompare(b.bank);
        return a.name.localeCompare(b.name);
    });

    selector.innerHTML = funds.map(f =>
        `<option value="${f.cert}" ${f.cert === AppState.selectedCert ? 'selected' : ''}>[${f.bank}] ${f.name} (${f.currency})</option>`
    ).join('');
}

function renderSummaryCard() {
    const card = document.getElementById('chart-summary-card');
    if (!card || !AppState.selectedCert) {
        if (card) card.innerHTML = '<p>請從部位總覽選擇一檔基金</p>';
        return;
    }

    const fund = AppState.rawData.funds[AppState.selectedCert];
    const history = AppState.rawData.history[AppState.selectedCert];
    const months = AppState.rawData.months;
    const latestMonth = months[months.length - 1];
    const latest = history?.[latestMonth];

    if (!fund || !latest) {
        card.innerHTML = '<p>無資料</p>';
        return;
    }

    const holdingMonths = getHoldingMonths(history, months);
    const costBasis = deriveCostBasis(latest.current_value, latest.profit_loss, latest.cumulative_dividend);
    const actualAnnual = annualizedReturn(costBasis, latest.current_value, latest.cumulative_dividend, holdingMonths, true);

    card.innerHTML = `
        <div class="summary-grid">
            <div class="summary-item">
                <span class="summary-label">基金</span>
                <span class="summary-value">${fund.name}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">現值</span>
                <span class="summary-value">${formatNumber(latest.current_value)} ${fund.currency}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">實際年化</span>
                <span class="summary-value ${actualAnnual != null && actualAnnual >= 0 ? 'trend-up' : 'trend-down'}">${formatPercent(actualAnnual)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">累計配息</span>
                <span class="summary-value">${formatNumber(latest.cumulative_dividend)} ${fund.currency}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">趨勢</span>
                <span class="summary-value ${trendClass(latest.trend)}">${trendIcon(latest.trend)}</span>
            </div>
        </div>
    `;
}

function renderComparisonSelector() {
    const container = document.getElementById('comparison-controls');
    if (!container) return;

    const funds = Object.values(AppState.rawData.funds).sort((a, b) => a.name.localeCompare(b.name));
    const selected = AppState.chartConfig.selectedCerts;

    container.innerHTML = `
        <div class="comparison-row">
            <select id="comparison-fund-select">
                ${funds.filter(f => !selected.includes(f.cert)).map(f =>
        `<option value="${f.cert}">${f.name} (${f.currency})</option>`
    ).join('')}
            </select>
            <button id="add-comparison-btn" class="outline" ${selected.length >= 5 ? 'disabled' : ''}>
                + 比較 (${selected.length}/5)
            </button>
            ${selected.length > 1 ? `
                <button id="aggregate-toggle" class="outline ${AppState.chartConfig.aggregateMode ? 'active' : ''}">加總</button>
                <button id="clear-comparison-btn" class="outline secondary">清除</button>
            ` : ''}
        </div>
        ${selected.length > 1 ? `
            <div class="comparison-chips">
                ${selected.map(cert => {
        const f = AppState.rawData.funds[cert];
        return `<span class="chip">${f ? f.name : cert}</span>`;
    }).join('')}
            </div>
        ` : ''}
    `;

    // Re-bind events after re-render
    document.getElementById('add-comparison-btn')?.addEventListener('click', () => {
        const select = document.getElementById('comparison-fund-select');
        if (!select) return;
        const cert = select.value;
        if (cert && !AppState.chartConfig.selectedCerts.includes(cert)) {
            if (AppState.chartConfig.selectedCerts.length >= 5) {
                alert('最多同時比較 5 檔基金');
                return;
            }
            AppState.chartConfig.selectedCerts.push(cert);
            renderChart();
        }
    });

    document.getElementById('aggregate-toggle')?.addEventListener('click', () => {
        AppState.chartConfig.aggregateMode = !AppState.chartConfig.aggregateMode;
        renderChart();
    });

    document.getElementById('clear-comparison-btn')?.addEventListener('click', () => {
        if (AppState.selectedCert) {
            AppState.chartConfig.selectedCerts = [AppState.selectedCert];
        }
        AppState.chartConfig.aggregateMode = false;
        renderChart();
    });
}

function renderLineChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const { rawData, chartConfig } = AppState;
    const months = rawData.months;
    const labels = getMonthLabels(months);
    const includeDividend = chartConfig.includeDividend;
    const selectedCerts = chartConfig.selectedCerts;

    // Destroy previous chart
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    if (selectedCerts.length === 0) return;

    let datasets;

    if (chartConfig.aggregateMode && selectedCerts.length > 1) {
        // Aggregate mode: sum values
        const aggregateData = months.map(m => {
            let sum = 0;
            selectedCerts.forEach(cert => {
                const h = rawData.history[cert]?.[m];
                if (h) {
                    const val = includeDividend ? h.profit_loss : h.profit_loss_ex_div;
                    const fund = rawData.funds[cert];
                    sum += toNTD(val, fund.currency);
                }
            });
            return Math.round(sum);
        });

        datasets = [{
            label: '加總走勢 (約當NTD)',
            data: aggregateData,
            borderColor: COLORS.chartPalette[0],
            backgroundColor: `${COLORS.chartPalette[0]}20`,
            borderWidth: 3,
            fill: true,
            tension: 0.1,
        }];
    } else {
        // Individual lines
        datasets = selectedCerts.map((cert, idx) => {
            const fund = rawData.funds[cert];
            const history = rawData.history[cert];
            const data = months.map(m => {
                const h = history?.[m];
                if (!h) return null;
                return includeDividend ? h.profit_loss : h.profit_loss_ex_div;
            });

            return {
                label: `${fund.name} (${fund.currency})`,
                data,
                borderColor: COLORS.chartPalette[idx % COLORS.chartPalette.length],
                backgroundColor: 'transparent',
                borderWidth: idx === 0 ? 3 : 2,
                pointRadius: idx === 0 ? 5 : 3,
                tension: 0.1,
            };
        });
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',       // Crosshair: show all datasets at same x
                intersect: false,
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function (context) {
                            const val = context.parsed.y;
                            return `${context.dataset.label}: ${formatNumber(val)}`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    display: selectedCerts.length > 1 || chartConfig.aggregateMode,
                },
            },
            scales: {
                y: { beginAtZero: false },
            },
        },
    });

    AppState.charts.trend = chartInstance;
}
