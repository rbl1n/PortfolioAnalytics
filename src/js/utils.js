// utils.js — Shared utility functions
// Currency conversion, formatting, annualized return calculations

// --- Currency Conversion ---
// Hardcoded rates (approximate). Labeled 約當值 in UI.
const EXCHANGE_RATES = {
    USD: 32,
    CNY: 4.5,
    NTD: 1,
};

export function toNTD(value, currency) {
    const rate = EXCHANGE_RATES[currency] || 1;
    return value * rate;
}

// --- Number Formatting ---

export function formatNumber(value, decimals = 0) {
    if (value == null || isNaN(value)) return '--';
    return value.toLocaleString('zh-TW', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatPercent(value, decimals = 2) {
    if (value == null || isNaN(value)) return 'N/A';
    return (value * 100).toFixed(decimals) + '%';
}

// --- Annualized Return Calculation ---

/**
 * Calculate annualized return.
 * Formula: (1 + totalReturn) ^ (12 / months) - 1
 *
 * @param {number} costBasis - Total invested amount
 * @param {number} currentValue - Current market value
 * @param {number} cumulativeDividend - Total dividends received
 * @param {number} months - Holding period in months
 * @param {boolean} includeDividend - Whether to include dividends
 * @returns {number|null} Annualized return as decimal (0.05 = 5%), or null
 */
export function annualizedReturn(costBasis, currentValue, cumulativeDividend, months, includeDividend = true) {
    if (costBasis <= 0 || months <= 0) return null;

    const endValue = includeDividend
        ? currentValue + cumulativeDividend
        : currentValue;

    const totalReturn = (endValue - costBasis) / costBasis;
    const years = months / 12;

    // Avoid Math.pow of negative base with fractional exponent
    if (1 + totalReturn <= 0) return null;

    return Math.pow(1 + totalReturn, 1 / years) - 1;
}

/**
 * Derive cost basis from data.json fields.
 * profit_loss (含息損益) = currentValue + cumulativeDividend - costBasis
 * Therefore: costBasis = currentValue + cumulativeDividend - profitLoss
 */
export function deriveCostBasis(currentValue, profitLoss, cumulativeDividend = 0) {
    return currentValue + cumulativeDividend - profitLoss;
}

/**
 * Calculate monthly dividend from cumulative dividend differences.
 * @param {number|null} currentCumDiv - Current month cumulative dividend
 * @param {number|null} prevCumDiv - Previous month cumulative dividend
 * @returns {number} Monthly dividend amount
 */
export function monthlyDividend(currentCumDiv, prevCumDiv) {
    if (currentCumDiv == null) return 0;
    if (prevCumDiv == null) return currentCumDiv; // First month: use cumulative as-is
    return Math.max(0, currentCumDiv - prevCumDiv);
}

// --- Month Label Formatting ---

const MONTH_MAP = {
    '0228': '2月', '0331': '3月', '0430': '4月',
    '0531': '5月', '0630': '6月', '0731': '7月',
    '0831': '8月', '0930': '9月', '1031': '10月',
    '1130': '11月', '1231': '12月',
};

export function formatMonth(monthCode) {
    return MONTH_MAP[monthCode] || monthCode;
}

export function getMonthLabels(months) {
    return months.map(formatMonth);
}

// --- Color Constants ---

export const COLORS = {
    up: '#e74c3c',        // Red for up (Taiwan convention)
    down: '#2ecc71',      // Green for down (Taiwan convention)
    flat: '#7f8c8d',      // Gray for flat
    chartPalette: [
        '#3498db', '#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6',
        '#34495e', '#16a085', '#e67e22', '#7f8c8d', '#d35400',
    ],
};

// --- Trend Helpers ---

export function trendIcon(trend) {
    if (trend === 'up') return '▲';
    if (trend === 'down') return '▼';
    return '—';
}

export function trendClass(trend) {
    if (trend === 'up') return 'trend-up';
    if (trend === 'down') return 'trend-down';
    return 'trend-flat';
}

/**
 * Get the number of months a fund has been held,
 * based on how many months of history data exist.
 */
export function getHoldingMonths(history, months) {
    let count = 0;
    for (const m of months) {
        if (history[m] && history[m].current_value > 0) count++;
    }
    return count;
}
