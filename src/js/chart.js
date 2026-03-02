// chart.js — Tab 2: Trend analysis with line chart
// Supports: single fund with dual lines (incl/excl div), multi-line comparison,
//           per-fund dividend toggle, aggregate mode, crosshair, fuzzy search

import { AppState } from './state.js';
import { formatNumber, formatPercent, formatMonth, getMonthLabels, annualizedReturn, deriveCostBasis, getHoldingMonths, trendIcon, trendClass, toNTD, COLORS } from './utils.js';

let chartInstance = null;

// Track per-fund dividend settings
// { cert: { includeDividend: true/false } }
let fundDivSettings = {};

// Y-axis display mode: 'absolute' (raw values) or 'percent' (first month = 0%)
let yAxisMode = 'absolute';

export function initChart() {
    // All event binding is handled in renderChart via delegation
}

export function renderChart() {
    syncDivSettings();
    renderFundSelector();
    renderSummaryCard();
    renderDivToggleRow();
    renderComparisonSelector();
    bindYAxisToggle();
    renderLineChart();
}

// --- Y-axis toggle ---

function bindYAxisToggle() {
    document.querySelectorAll('.yaxis-toggle').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === yAxisMode);
        btn.onclick = () => {
            yAxisMode = btn.dataset.mode;
            document.querySelectorAll('.yaxis-toggle').forEach(b => b.classList.toggle('active', b.dataset.mode === yAxisMode));
            renderLineChart();
        };
    });
}

// --- Sync dividend settings for currently selected certs ---

function syncDivSettings() {
    const certs = AppState.chartConfig.selectedCerts;
    certs.forEach(cert => {
        if (!(cert in fundDivSettings)) {
            const fund = AppState.rawData.funds[cert];
            const hasDividend = fund && fund.dividend_type !== 'None' && fund.dividend_type !== '無';
            fundDivSettings[cert] = {
                includeDividend: hasDividend, // default: inclusive if has dividend
                hasDividend,
            };
        }
    });
    // Clean up removed certs
    Object.keys(fundDivSettings).forEach(cert => {
        if (!certs.includes(cert)) delete fundDivSettings[cert];
    });
}

// --- Fund Selector (Primary) ---

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

    // Re-bind change event (since we don't use persistent listeners)
    selector.onchange = (e) => {
        AppState.selectedCert = e.target.value;
        // Replace first cert in comparison
        if (AppState.chartConfig.selectedCerts.length > 0) {
            AppState.chartConfig.selectedCerts[0] = e.target.value;
        } else {
            AppState.chartConfig.selectedCerts = [e.target.value];
        }
        renderChart();
    };
}

// --- Summary Card ---

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

// --- Per-Fund Dividend Toggle Row (#3, #5, #6) ---

function renderDivToggleRow() {
    const container = document.getElementById('div-toggle-row');
    if (!container) return;

    const certs = AppState.chartConfig.selectedCerts;
    if (certs.length === 0) {
        container.innerHTML = '';
        return;
    }

    const items = certs.map(cert => {
        const fund = AppState.rawData.funds[cert];
        const setting = fundDivSettings[cert];
        if (!fund || !setting) return '';

        const shortName = fund.name.length > 12 ? fund.name.substring(0, 12) + '…' : fund.name;

        if (!setting.hasDividend) {
            // No dividend — show disabled state, always use profit_loss_ex_div
            return `
                <div class="div-toggle-item">
                    <span class="div-toggle-name">${shortName}</span>
                    <span class="div-toggle-disabled">無配息</span>
                </div>
            `;
        }

        return `
            <div class="div-toggle-item">
                <span class="div-toggle-name">${shortName}</span>
                <div class="toggle-group-sm">
                    <button class="toggle-sm ${setting.includeDividend ? 'active' : ''}"
                            data-cert="${cert}" data-mode="inclusive">含息</button>
                    <button class="toggle-sm ${!setting.includeDividend ? 'active' : ''}"
                            data-cert="${cert}" data-mode="exclusive">不含息</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = `<div class="div-toggle-list">${items.join('')}</div>`;

    // Bind toggle events
    container.querySelectorAll('.toggle-sm').forEach(btn => {
        btn.addEventListener('click', () => {
            const cert = btn.dataset.cert;
            const mode = btn.dataset.mode;
            fundDivSettings[cert].includeDividend = (mode === 'inclusive');
            renderDivToggleRow();
            renderLineChart();
        });
    });
}

// --- Comparison Selector with Fuzzy Search (#4) ---

function renderComparisonSelector() {
    const container = document.getElementById('comparison-controls');
    if (!container) return;

    const selected = AppState.chartConfig.selectedCerts;

    container.innerHTML = `
        <div class="comparison-row">
            <div class="fuzzy-search-wrapper">
                <input type="search" id="comparison-search" placeholder="搜尋基金名稱..."
                       autocomplete="off" aria-label="搜尋基金">
                <div id="comparison-dropdown" class="fuzzy-dropdown" hidden></div>
            </div>
            <button id="add-comparison-btn" class="outline" disabled>
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
        return `<span class="chip" data-cert="${cert}">${f ? f.name : cert} <span class="chip-remove" data-cert="${cert}">✕</span></span>`;
    }).join('')}
            </div>
        ` : ''}
    `;

    // --- Fuzzy search logic ---
    const searchInput = document.getElementById('comparison-search');
    const dropdown = document.getElementById('comparison-dropdown');
    const addBtn = document.getElementById('add-comparison-btn');
    let pendingCert = null;

    if (searchInput && dropdown) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            if (query.length === 0) {
                dropdown.hidden = true;
                addBtn.disabled = true;
                pendingCert = null;
                return;
            }

            const allFunds = Object.values(AppState.rawData.funds);
            const matches = allFunds
                .filter(f => !selected.includes(f.cert))
                .filter(f => {
                    return f.name.toLowerCase().includes(query)
                        || f.bank.toLowerCase().includes(query)
                        || f.cert.toLowerCase().includes(query)
                        || f.currency.toLowerCase().includes(query);
                })
                .slice(0, 8); // Max 8 results

            if (matches.length === 0) {
                dropdown.innerHTML = '<div class="fuzzy-item fuzzy-empty">找不到符合的基金</div>';
                dropdown.hidden = false;
                addBtn.disabled = true;
                pendingCert = null;
                return;
            }

            dropdown.innerHTML = matches.map(f => `
                <div class="fuzzy-item" data-cert="${f.cert}">
                    [${f.bank}] ${f.name} <small>(${f.currency})</small>
                </div>
            `).join('');
            dropdown.hidden = false;

            // Click on dropdown item
            dropdown.querySelectorAll('.fuzzy-item[data-cert]').forEach(item => {
                item.addEventListener('click', () => {
                    pendingCert = item.dataset.cert;
                    const fund = AppState.rawData.funds[pendingCert];
                    searchInput.value = fund ? fund.name : pendingCert;
                    dropdown.hidden = true;
                    addBtn.disabled = false;
                });
            });
        });

        // Hide dropdown on blur (delayed to allow click)
        searchInput.addEventListener('blur', () => {
            setTimeout(() => { dropdown.hidden = true; }, 200);
        });
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length > 0) {
                searchInput.dispatchEvent(new Event('input'));
            }
        });
    }

    // Add button
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (!pendingCert || selected.includes(pendingCert)) return;
            if (selected.length >= 5) {
                alert('最多同時比較 5 檔基金');
                return;
            }
            AppState.chartConfig.selectedCerts.push(pendingCert);
            pendingCert = null;
            renderChart();
        });
    }

    // Aggregate toggle
    document.getElementById('aggregate-toggle')?.addEventListener('click', () => {
        AppState.chartConfig.aggregateMode = !AppState.chartConfig.aggregateMode;
        renderChart();
    });

    // Clear comparison
    document.getElementById('clear-comparison-btn')?.addEventListener('click', () => {
        if (AppState.selectedCert) {
            AppState.chartConfig.selectedCerts = [AppState.selectedCert];
        }
        AppState.chartConfig.aggregateMode = false;
        renderChart();
    });

    // Chip remove buttons
    container.querySelectorAll('.chip-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cert = btn.dataset.cert;
            AppState.chartConfig.selectedCerts = AppState.chartConfig.selectedCerts.filter(c => c !== cert);
            if (AppState.chartConfig.selectedCerts.length === 0 && AppState.selectedCert) {
                AppState.chartConfig.selectedCerts = [AppState.selectedCert];
            }
            renderChart();
        });
    });
}

// --- Helpers for percent normalization ---

/**
 * Convert raw data series to percent change from first non-null value.
 * First valid point = 0%, subsequent = ((val - base) / |base|) * 100
 */
function toPercentSeries(rawData) {
    let base = null;
    return rawData.map(val => {
        if (val == null) return null;
        if (base === null) {
            base = val;
            return 0; // first point = 0%
        }
        if (base === 0) return 0;
        return ((val - base) / Math.abs(base)) * 100;
    });
}

// --- Line Chart ---

function renderLineChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const { rawData, chartConfig } = AppState;
    const months = rawData.months;
    const labels = getMonthLabels(months);
    const selectedCerts = chartConfig.selectedCerts;
    const isPercent = yAxisMode === 'percent';

    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    if (selectedCerts.length === 0) return;

    let datasets;

    if (chartConfig.aggregateMode && selectedCerts.length > 1) {
        // Aggregate mode: sum values using each fund's dividend setting
        const rawSeries = months.map(m => {
            let sum = 0;
            selectedCerts.forEach(cert => {
                const h = rawData.history[cert]?.[m];
                if (h) {
                    const setting = fundDivSettings[cert];
                    const useInclusive = setting?.hasDividend && setting?.includeDividend;
                    const val = useInclusive ? h.profit_loss : h.profit_loss_ex_div;
                    const fund = rawData.funds[cert];
                    sum += toNTD(val, fund.currency);
                }
            });
            return Math.round(sum);
        });

        const data = isPercent ? toPercentSeries(rawSeries) : rawSeries;

        datasets = [{
            label: isPercent ? '加總走勢 (%)' : '加總走勢 (約當NTD)',
            data,
            borderColor: COLORS.chartPalette[0],
            backgroundColor: `${COLORS.chartPalette[0]}20`,
            borderWidth: 3,
            fill: true,
            tension: 0.1,
        }];
    } else {
        // Individual lines — for funds with dividends, show both lines
        datasets = [];
        let colorIdx = 0;

        selectedCerts.forEach(cert => {
            const fund = rawData.funds[cert];
            const history = rawData.history[cert];
            const setting = fundDivSettings[cert];
            if (!fund || !history) return;

            const color = COLORS.chartPalette[colorIdx % COLORS.chartPalette.length];

            const buildDataset = (label, rawSeries, opts = {}) => {
                const data = isPercent ? toPercentSeries(rawSeries) : rawSeries;
                return {
                    label: isPercent ? `${label} (%)` : label,
                    data,
                    borderColor: color,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointRadius: 4,
                    tension: 0.1,
                    ...opts,
                };
            };

            if (setting?.hasDividend) {
                if (setting.includeDividend) {
                    // Inclusive line (solid)
                    datasets.push(buildDataset(
                        `${fund.name} 含息`,
                        months.map(m => history[m]?.profit_loss ?? null)
                    ));
                    // Exclusive line (dashed)
                    datasets.push(buildDataset(
                        `${fund.name} 不含息`,
                        months.map(m => history[m]?.profit_loss_ex_div ?? null),
                        { borderWidth: 1.5, borderDash: [6, 3], pointRadius: 2 }
                    ));
                } else {
                    datasets.push(buildDataset(
                        `${fund.name} 不含息`,
                        months.map(m => history[m]?.profit_loss_ex_div ?? null)
                    ));
                }
            } else {
                datasets.push(buildDataset(
                    fund.name,
                    months.map(m => history[m]?.profit_loss_ex_div ?? null)
                ));
            }

            colorIdx++;
        });
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function (context) {
                            const val = context.parsed.y;
                            if (isPercent) {
                                return `${context.dataset.label}: ${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
                            }
                            return `${context.dataset.label}: ${formatNumber(val)}`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    display: datasets.length > 1,
                },
            },
            scales: {
                y: {
                    beginAtZero: isPercent,
                    ticks: {
                        callback: function (value) {
                            if (isPercent) return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
                            return formatNumber(value);
                        }
                    }
                },
            },
        },
    });

    AppState.charts.trend = chartInstance;
}
