// watchlist.js — Tab 1: Watchlist with Tag filters, table, presets
// Placeholder: will be fully implemented in Phase 2

import { AppState, applyFilters, addWatchlistPreset, deleteWatchlistPreset, applyWatchlistPreset } from './state.js';
import { formatNumber, formatPercent, annualizedReturn, deriveCostBasis, getHoldingMonths, trendIcon, trendClass, toNTD, COLORS } from './utils.js';
import { navigateToChart } from './main.js';

let sortColumn = null;
let sortAscending = true;

export function initWatchlist() {
    // Tag filter click handlers will be set up in renderWatchlist
}

export function renderWatchlist() {
    renderTagFilters();
    renderPresetSelector();
    renderTable();
}

// --- Tag Filters ---

function renderTagFilters() {
    const container = document.getElementById('tag-filters');
    if (!container) return;

    const dimensions = getDimensions();

    container.innerHTML = dimensions.map(dim => `
        <div class="tag-group">
            <span class="tag-label">${dim.label}</span>
            <div class="tag-buttons">
                ${dim.values.map(v => `
                    <button class="tag ${AppState.filters[dim.key] === v.value ? 'active' : ''}"
                            data-dimension="${dim.key}" data-value="${v.value}">
                        ${v.label}
                    </button>
                `).join('')}
            </div>
        </div>
    `).join('');

    // Bind click events
    container.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const dim = tag.dataset.dimension;
            const val = tag.dataset.value;
            AppState.filters[dim] = val;
            AppState.activeWatchlistIndex = -1; // Deselect preset
            applyFilters();
            renderWatchlist();
        });
    });
}

function getDimensions() {
    const data = AppState.rawData;
    if (!data) return [];

    const banks = [...new Set(Object.values(data.funds).map(f => f.bank))].sort();
    const currencies = [...new Set(Object.values(data.funds).map(f => f.currency))].sort();
    const divTypes = [...new Set(Object.values(data.funds).map(f => {
        return f.dividend_type === 'None' ? '無' : f.dividend_type;
    }))].sort();
    const investTypes = [...new Set(Object.values(data.funds).map(f => f.type))].sort();

    return [
        {
            key: 'bank', label: '銀行',
            values: [{ value: 'all', label: '全部' }, ...banks.map(b => ({ value: b, label: b }))],
        },
        {
            key: 'currency', label: '幣別',
            values: [{ value: 'all', label: '全部' }, ...currencies.map(c => ({ value: c, label: c }))],
        },
        {
            key: 'dividendType', label: '配息',
            values: [{ value: 'all', label: '全部' }, ...divTypes.map(d => ({ value: d, label: d === '月' ? '月配息' : '無配息' }))],
        },
        {
            key: 'type', label: '型態',
            values: [{ value: 'all', label: '全部' }, ...investTypes.map(t => ({ value: t, label: t }))],
        },
    ];
}

// --- Preset Selector ---

function renderPresetSelector() {
    const container = document.getElementById('preset-selector');
    if (!container) return;

    const { watchlists, activeWatchlistIndex } = AppState;

    container.innerHTML = `
        <div class="preset-controls">
            <select id="preset-select">
                <option value="-1" ${activeWatchlistIndex === -1 ? 'selected' : ''}>-- 自訂篩選 --</option>
                ${watchlists.map((w, i) => `
                    <option value="${i}" ${activeWatchlistIndex === i ? 'selected' : ''}>${w.name}</option>
                `).join('')}
            </select>
            <button id="save-preset-btn" class="outline">儲存清單</button>
            ${activeWatchlistIndex >= 0 ? `<button id="delete-preset-btn" class="outline secondary">刪除</button>` : ''}
        </div>
    `;

    // Events
    container.querySelector('#preset-select')?.addEventListener('change', (e) => {
        const idx = parseInt(e.target.value);
        if (idx >= 0) {
            applyWatchlistPreset(idx);
            renderWatchlist();
        } else {
            AppState.activeWatchlistIndex = -1;
        }
    });

    container.querySelector('#save-preset-btn')?.addEventListener('click', () => {
        const name = prompt('請輸入清單名稱：');
        if (name && name.trim()) {
            addWatchlistPreset(name.trim());
            AppState.activeWatchlistIndex = AppState.watchlists.length - 1;
            renderPresetSelector();
        }
    });

    container.querySelector('#delete-preset-btn')?.addEventListener('click', () => {
        if (confirm('確定要刪除這個清單嗎？')) {
            deleteWatchlistPreset(activeWatchlistIndex);
            renderWatchlist();
        }
    });
}

// --- Table ---

function renderTable() {
    const container = document.getElementById('watchlist-table');
    if (!container) return;

    const { filteredFunds, rawData } = AppState;
    const months = rawData.months;
    const latestMonth = months[months.length - 1];

    // Build rows data
    let rows = Object.values(filteredFunds).map(fund => {
        const history = rawData.history[fund.cert];
        const latest = history?.[latestMonth];
        if (!latest) return null;

        const holdingMonths = getHoldingMonths(history, months);
        const costBasis = deriveCostBasis(latest.current_value, latest.profit_loss, latest.cumulative_dividend);

        const actualAnnual = annualizedReturn(
            costBasis, latest.current_value, latest.cumulative_dividend, holdingMonths, true
        );
        const fundPerfAnnual = annualizedReturn(
            costBasis, latest.current_value, latest.cumulative_dividend, holdingMonths, false
        );

        return {
            cert: fund.cert,
            name: fund.name,
            bank: fund.bank,
            currency: fund.currency,
            currentValue: latest.current_value,
            actualAnnual,
            fundPerfAnnual,
            trend: latest.trend,
        };
    }).filter(Boolean);

    // Sort
    if (sortColumn) {
        rows.sort((a, b) => {
            let va = a[sortColumn];
            let vb = b[sortColumn];
            if (va == null) va = -Infinity;
            if (vb == null) vb = -Infinity;
            if (typeof va === 'string') {
                return sortAscending ? va.localeCompare(vb) : vb.localeCompare(va);
            }
            return sortAscending ? va - vb : vb - va;
        });
    }

    const sortIndicator = (col) => {
        if (sortColumn !== col) return '';
        return sortAscending ? ' ↑' : ' ↓';
    };

    container.innerHTML = `
        <table role="grid">
            <thead>
                <tr>
                    <th data-sort="name" class="sortable">基金名稱${sortIndicator('name')}</th>
                    <th data-sort="bank" class="sortable">銀行${sortIndicator('bank')}</th>
                    <th data-sort="currentValue" class="sortable">現值${sortIndicator('currentValue')}</th>
                    <th data-sort="actualAnnual" class="sortable">實際年化${sortIndicator('actualAnnual')}</th>
                    <th data-sort="fundPerfAnnual" class="sortable">基金年化${sortIndicator('fundPerfAnnual')}</th>
                    <th>趨勢</th>
                </tr>
            </thead>
            <tbody>
                ${rows.length === 0 ? `<tr><td colspan="6">沒有符合條件的基金</td></tr>` : ''}
                ${rows.map(r => `
                    <tr class="fund-row" data-cert="${r.cert}" style="cursor:pointer">
                        <td><strong>${r.name}</strong></td>
                        <td>${r.bank}</td>
                        <td>${formatNumber(r.currentValue)} ${r.currency}</td>
                        <td class="${r.actualAnnual != null && r.actualAnnual >= 0 ? 'trend-up' : 'trend-down'}">
                            ${formatPercent(r.actualAnnual)}
                        </td>
                        <td class="${r.fundPerfAnnual != null && r.fundPerfAnnual >= 0 ? 'trend-up' : 'trend-down'}">
                            ${formatPercent(r.fundPerfAnnual)}
                        </td>
                        <td class="${trendClass(r.trend)}">${trendIcon(r.trend)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Sort click handlers
    container.querySelectorAll('.sortable').forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (sortColumn === col) {
                sortAscending = !sortAscending;
            } else {
                sortColumn = col;
                sortAscending = true;
            }
            renderTable();
        });
    });

    // Row click → navigate to chart
    container.querySelectorAll('.fund-row').forEach(row => {
        row.addEventListener('click', () => {
            navigateToChart(row.dataset.cert);
        });
    });
}
