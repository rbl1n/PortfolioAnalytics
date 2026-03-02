// main.js — Application entry point
// Handles init, Tab switching, and orchestrates module loading.

import { AppState, applyFilters, loadWatchlists } from './state.js';
import { initWatchlist, renderWatchlist } from './watchlist.js';
import { initChart, renderChart } from './chart.js';
import { initFundInfo, renderFundInfo } from './fund-info.js';
import { initAnalysis, renderAnalysis } from './analysis.js';

// --- Tab Switching ---

const TAB_IDS = ['watchlist', 'chart', 'fund-info', 'analysis'];

function switchTab(tabId) {
    if (!TAB_IDS.includes(tabId)) return;

    AppState.activeTab = tabId;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
        btn.setAttribute('aria-selected', btn.dataset.tab === tabId);
    });

    // Update tab panels
    TAB_IDS.forEach(id => {
        const panel = document.getElementById(`panel-${id}`);
        if (panel) {
            panel.hidden = (id !== tabId);
        }
    });

    // Render active tab content
    renderActiveTab();
}

function renderActiveTab() {
    switch (AppState.activeTab) {
        case 'watchlist':
            renderWatchlist();
            break;
        case 'chart':
            renderChart();
            break;
        case 'fund-info':
            renderFundInfo();
            break;
        case 'analysis':
            renderAnalysis();
            break;
    }
}

// --- Global Navigation (called from other modules) ---

export function navigateToChart(cert) {
    AppState.selectedCert = cert;
    AppState.chartConfig.selectedCerts = [cert];
    switchTab('chart');
}

export function navigateToTab(tabId) {
    switchTab(tabId);
}

// --- Initialization ---

async function init() {
    try {
        // Determine data path based on environment
        const isDemo = window.location.hostname.includes('github.io')
            || new URLSearchParams(window.location.search).has('demo');

        const dataPath = isDemo
            ? '../data/demo/demo-data.json'
            : '../data/processed/data.json';

        // Load data
        const response = await fetch(dataPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${dataPath}`);
        AppState.rawData = await response.json();

        // Show demo banner if using mock data
        if (isDemo) {
            const banner = document.createElement('div');
            banner.className = 'demo-banner';
            banner.textContent = '🔶 DEMO 模式 — 顯示的是模擬資料，非真實數據';
            document.querySelector('main')?.prepend(banner);
        }

        // Load saved watchlists from localStorage
        loadWatchlists();

        // Apply initial filters (show all)
        applyFilters();

        // Set initial selected cert (first fund)
        const fundKeys = Object.keys(AppState.rawData.funds);
        if (fundKeys.length > 0) {
            AppState.selectedCert = fundKeys[0];
            AppState.chartConfig.selectedCerts = [fundKeys[0]];
        }

        // Initialize tab modules
        initWatchlist();
        initChart();
        initFundInfo();
        initAnalysis();

        // Setup tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                switchTab(btn.dataset.tab);
            });
        });

        // Render default tab
        switchTab('watchlist');

    } catch (error) {
        console.error('Error loading data:', error);
        document.querySelector('main').innerHTML =
            '<article><h2>無法載入資料</h2><p>請確認 data.json 是否存在。</p></article>';
    }
}

document.addEventListener('DOMContentLoaded', init);
