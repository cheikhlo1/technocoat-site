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
  const receptionRows = rows.filter((r) => String(r.typeMouvement || '').includes('Réception'));
  const isToday = (d) => d === new Date().toISOString().slice(0, 10);
  const counters = {
    prevues: receptionRows.filter((r) => isToday(r.dateMouvement)).length,
    controle: receptionRows.filter((r) => r.statut === 'À contrôler').length,
    bloquees: receptionRows.filter((r) => r.statut === 'Bloquée').length,
    validees: receptionRows.filter((r) => r.statut === 'Réceptionnée').length
  };

  return `
    <article class="card">
      <h4>Réception</h4>
      <div class="table-grid logistic-kpi-grid">
        <article class="card kpi"><h4>Réceptions prévues aujourd’hui</h4><p class="kpi-count">${counters.prevues}</p></article>
        <article class="card kpi"><h4>Réceptions en attente de contrôle</h4><p class="kpi-count">${counters.controle}</p></article>
        <article class="card kpi"><h4>Réceptions bloquées</h4><p class="kpi-count">${counters.bloquees}</p></article>
        <article class="card kpi"><h4>Réceptions validées</h4><p class="kpi-count">${counters.validees}</p></article>
      </div>
      <h5>Réceptions à traiter</h5>
      <div class="table-wrapper"><table><thead><tr><th>Date prévue</th><th>Fournisseur / Client</th><th>BL / Commande</th><th>Référence</th><th>Quantité</th><th>État colis</th><th>Statut</th><th>Actions</th></tr></thead><tbody>
      ${receptionRows.map((r) => `<tr><td>${safe(r.dateMouvement)}</td><td>${safe(r.clientNom || '')}</td><td>${safe(r.numeroBL || r.numeroCommande || '')}</td><td>${safe(r.referencePiece || '')}</td><td>${safe(r.quantiteAttendue ?? r.quantite ?? '')}</td><td>${safe(r.etatColis || 'À vérifier')}</td><td><span class="status-pill">${safe(r.statut || 'En attente')}</span></td><td><button class="btn secondary" type="button" data-rec="received" data-id="${r.id}">Réceptionner</button> <button class="btn secondary" type="button" data-rec="control" data-id="${r.id}">Contrôle requis</button> <button class="btn secondary" type="button" data-rec="block" data-id="${r.id}">Bloquer</button> <button class="btn secondary" type="button" data-rec="reserve" data-id="${r.id}">Réserve</button></td></tr>`).join('')}
      </tbody></table></div>
      <article class="card">
        <h5>Points de vigilance réception</h5>
        <ul>
          <li>Vérifier la correspondance entre BL, commande et pièces reçues.</li>
          <li>Contrôler l’état des colis.</li>
          <li>Signaler les écarts de quantité.</li>
          <li>Isoler les pièces non conformes ou douteuses.</li>
          <li>Transmettre les anomalies à Qualité / Méthodes si nécessaire.</li>
        </ul>
      </article>
      <article class="card">
        <h5>Commentaire réception</h5>
        <textarea id="reception-note" rows="4" placeholder="colis abîmé, quantité manquante, référence douteuse, attente décision qualité, autre observation terrain"></textarea>
      </article>
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
      <p>Flux logistiques entrants et sortants</p>
    </section>
    <section class="card">
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
  container.querySelectorAll('[data-rec]').forEach((btn) => btn.addEventListener('click', () => {
    const id = Number(btn.dataset.id);
    const status = { received: 'Réceptionnée', control: 'À contrôler', block: 'Bloquée', reserve: 'Réserve émise' }[btn.dataset.rec] || 'En attente';
    try {
      updateRecord('logistique', id, { statut: status });
    } catch (error) {
      console.error('Logistique: erreur action réception', error);
    }
    renderPage(container, 'reception');
  }));
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
