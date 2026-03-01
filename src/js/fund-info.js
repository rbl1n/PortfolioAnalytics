// fund-info.js — Tab 3: Fund Info Shell (placeholder)

import { AppState } from './state.js';

export function initFundInfo() {
    // No initialization needed for shell
}

export function renderFundInfo() {
    const container = document.getElementById('panel-fund-info');
    if (!container) return;

    const fundName = AppState.selectedCert
        ? AppState.rawData.funds[AppState.selectedCert]?.name || ''
        : '';

    container.innerHTML = `
        <article>
            <header>
                <h2>基金資料</h2>
            </header>
            ${fundName ? `<p><strong>選取基金：</strong>${fundName}</p>` : ''}
            <p class="empty-state">基金靜態資料功能建置中，敬請期待 🚧</p>
        </article>
    `;
}
