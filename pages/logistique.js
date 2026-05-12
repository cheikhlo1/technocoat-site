import { addRecord, getTable, updateRecord } from '../data/databaseService.js';

const safe = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function readRows() {
  try {
    const logistique = getTable('logistique') || [];
    return Array.isArray(logistique) ? logistique : [];
  } catch (error) {
    console.error('Logistique: erreur lecture données', error);
    return [];
  }
}

function renderReception(rows) {
  return `
    <article class="card">
      <h4>Réception des pièces</h4>
      <p>Section Réception opérationnelle simplifiée.</p>
      <div class="table-wrapper"><table><thead><tr><th>Date</th><th>Type</th><th>Statut</th><th>BL</th></tr></thead><tbody>
      ${rows.filter((r) => String(r.typeMouvement || '').includes('Réception')).map((r) => `<tr><td>${safe(r.dateMouvement)}</td><td>${safe(r.typeMouvement)}</td><td>${safe(r.statut)}</td><td>${safe(r.numeroBL || '')}</td></tr>`).join('')}
      </tbody></table></div>
    </article>`;
}

function renderShipping(rows) {
  return `
    <article class="card">
      <h4>Expédition</h4>
      <p>Section Expédition simplifiée.</p>
      <div class="table-wrapper"><table><thead><tr><th>Date prévue</th><th>Référence</th><th>Statut</th><th>Transporteur</th><th>Actions</th></tr></thead><tbody>
      ${rows.filter((r) => String(r.typeMouvement || '').includes('Expédition') || String(r.typeMouvement || '').includes('Mise à disposition produits finis')).map((r) => `<tr><td>${safe(r.dateMouvement || '')}</td><td>${safe(r.referencePiece || '')}</td><td><span class="status-pill">${safe(r.statut || 'En attente')}</span></td><td>${safe(r.transporteur || '')}</td><td><button class="btn secondary" type="button" data-ship="sent" data-id="${r.id}">Expédié</button> <button class="btn secondary" type="button" data-ship="block" data-id="${r.id}">Bloqué</button></td></tr>`).join('')}
      </tbody></table></div>
    </article>`;
}

function renderPage(container, section = 'reception') {
  const rows = readRows();
  container.innerHTML = `
    <section class="card">
      <h3>Logistique</h3>
      <p>Réception, conditionnement, mise en palette et expédition des pièces</p>
    </section>
    <section class="table-grid">
      <button type="button" class="card kpi ${section === 'reception' ? 'active-tab' : ''}" data-section="reception"><h4>Réception</h4></button>
      <button type="button" class="card kpi ${section === 'shipping' ? 'active-tab' : ''}" data-section="shipping"><h4>Expédition</h4></button>
      <button type="button" class="card kpi ${section === 'packaging' ? 'active-tab' : ''}" data-section="packaging"><h4>Conditionnement & palettes</h4></button>
    </section>
    ${section === 'reception' ? renderReception(rows) : ''}
    ${section === 'shipping' ? renderShipping(rows) : ''}
    ${section === 'packaging' ? '<article class="card"><h4>Conditionnement & palettes</h4><p>En attente de développement.</p></article>' : ''}
  `;

  container.querySelectorAll('[data-section]').forEach((btn) => btn.addEventListener('click', () => renderPage(container, btn.dataset.section)));
  container.querySelectorAll('[data-ship]').forEach((btn) => btn.addEventListener('click', () => {
    const id = Number(btn.dataset.id);
    const status = btn.dataset.ship === 'sent' ? 'Expédiée' : 'Bloquée';
    try {
      updateRecord('logistique', id, { statut: status });
      if (status === 'Bloquée') {
        addRecord('observations', { dateObservation: new Date().toISOString().slice(0, 10), activite: 'Logistique', typeObservation: 'Anomalie', importance: 'Élevée', commentaire: 'Blocage expédition', statutTraitement: 'Ouvert', actionPrevue: 'Analyser le blocage', responsableTraitement: 'Responsable logistique' });
      }
    } catch (error) {
      console.error('Logistique: erreur action expédition', error);
    }
    renderPage(container, 'shipping');
  }));
}

export function renderLogistiquePage(container) {
  renderPage(container, 'reception');
}
