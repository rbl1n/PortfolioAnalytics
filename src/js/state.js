// state.js — Centralized application state (singleton)
// All tabs read/write through this object for cross-tab coherence.

export const AppState = {
    // Raw data from data.json
    rawData: null,

    // Current active tab: 'watchlist' | 'chart' | 'fund-info' | 'analysis'
    activeTab: 'watchlist',

    // Symbol Context — the core cross-tab link
    // When a fund is selected in any tab, all tabs use this as default context
    selectedCert: null,

    // Multi-dimension filters (Tag-based)
    filters: {
        bank: 'all',
        currency: 'all',
        dividendType: 'all',
        type: 'all',       // 單筆 / 月扣
    },

    // Filtered funds cache (recomputed when filters change)
    filteredFunds: {},

    // Watchlist presets (persisted to localStorage)
    watchlists: [],
    activeWatchlistIndex: -1,  // -1 = no preset active

    // Chart tab config
    chartConfig: {
        selectedCerts: [],    // Certs for multi-line comparison
        includeDividend: true,
        aggregateMode: false,
    },

    // Chart instances (for cleanup)
    charts: {},
};

// --- Filter Logic ---

export function applyFilters() {
    const { rawData, filters } = AppState;
    if (!rawData) return;

    AppState.filteredFunds = {};

    Object.values(rawData.funds).forEach(fund => {
        let pass = true;
        if (filters.bank !== 'all' && fund.bank !== filters.bank) pass = false;
        if (filters.currency !== 'all' && fund.currency !== filters.currency) pass = false;
        if (filters.dividendType !== 'all') {
            // Normalize: treat 'None' as '無'
            const divType = fund.dividend_type === 'None' ? '無' : fund.dividend_type;
            if (divType !== filters.dividendType) pass = false;
        }
        if (filters.type !== 'all' && fund.type !== filters.type) pass = false;

        if (pass) {
            AppState.filteredFunds[fund.cert] = fund;
        }
    });
}

// --- Watchlist Preset Persistence ---

const STORAGE_KEY = 'portfolio_watchlists';

export function loadWatchlists() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        AppState.watchlists = stored ? JSON.parse(stored) : [];
    } catch {
        AppState.watchlists = [];
    }
}

export function saveWatchlists() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.watchlists));
}

export function addWatchlistPreset(name) {
    AppState.watchlists.push({
        name,
        filters: { ...AppState.filters },
    });
    saveWatchlists();
}

export function deleteWatchlistPreset(index) {
    AppState.watchlists.splice(index, 1);
    if (AppState.activeWatchlistIndex >= AppState.watchlists.length) {
        AppState.activeWatchlistIndex = -1;
    }
    saveWatchlists();
}

export function applyWatchlistPreset(index) {
    if (index < 0 || index >= AppState.watchlists.length) return;
    const preset = AppState.watchlists[index];
    AppState.filters = { ...preset.filters };
    AppState.activeWatchlistIndex = index;
    applyFilters();
}
