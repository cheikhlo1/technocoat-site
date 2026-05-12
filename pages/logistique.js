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

function renderReception(rows, state) {
  const { receptionKpi = null, receptionDetail = null, receptionEdit = null, receptionRefs = 1 } = state;
  const receptionRows = rows.filter((r) => String(r.typeMouvement || '').includes('Réception'));
  const isToday = (d) => d === new Date().toISOString().slice(0, 10);
  const counters = {
    prevues: receptionRows.filter((r) => isToday(r.dateMouvement)).length,
    controle: receptionRows.filter((r) => r.statut === 'À contrôler').length,
    bloquees: receptionRows.filter((r) => r.statut === 'Bloquée').length,
    validees: receptionRows.filter((r) => r.statut === 'Réceptionnée').length
  };

  const filteredRows = receptionKpi ? receptionRows.filter((r) => ({
    prevues: isToday(r.dateMouvement),
    controle: r.statut === 'À contrôler',
    bloquees: r.statut === 'Bloquée',
    validees: r.statut === 'Réceptionnée'
  }[receptionKpi])) : receptionRows;

  return `
    <article class="card">
      <h4>Réception</h4>
      <div class="table-grid logistic-kpi-grid">
        <button type="button" class="card kpi kpi-btn ${receptionKpi === 'prevues' ? 'active-tab' : ''}" data-rk="prevues"><h4>Réceptions prévues aujourd’hui</h4><p class="kpi-count">${counters.prevues}</p></button>
        <button type="button" class="card kpi kpi-btn ${receptionKpi === 'controle' ? 'active-tab' : ''}" data-rk="controle"><h4>Réceptions en attente de contrôle</h4><p class="kpi-count">${counters.controle}</p></button>
        <button type="button" class="card kpi kpi-btn ${receptionKpi === 'bloquees' ? 'active-tab' : ''}" data-rk="bloquees"><h4>Réceptions bloquées</h4><p class="kpi-count">${counters.bloquees}</p></button>
        <button type="button" class="card kpi kpi-btn ${receptionKpi === 'validees' ? 'active-tab' : ''}" data-rk="validees"><h4>Réceptions validées</h4><p class="kpi-count">${counters.validees}</p></button>
      </div>
      ${receptionKpi || receptionDetail ? '<div class="controls"><button class="btn secondary" type="button" id="back-rec">Retour à la vue Réception</button></div>' : ''}
      <h5>Réceptions à traiter</h5>
      <div class="table-wrapper"><table><thead><tr><th>Date prévue</th><th>Fournisseur / Client</th><th>BL / Commande</th><th>Référence</th><th>Quantité</th><th>État colis</th><th>Statut</th><th>Actions</th></tr></thead><tbody>
      ${(receptionDetail ? receptionRows.filter((r) => r.id === receptionDetail) : filteredRows).map((r) => `<tr><td>${safe(r.dateMouvement)}</td><td>${safe(r.clientNom || '')}</td><td>${safe(r.numeroBL || r.numeroCommande || '')}</td><td>${safe(r.referencePiece || '')}</td><td>${safe(r.quantiteAttendue ?? r.quantite ?? '')}</td><td>${safe(r.etatColis || 'À vérifier')}</td><td><span class="status-pill">${safe(r.statut || 'En attente')}</span></td><td><button class="btn secondary" type="button" data-rec="received" data-id="${r.id}">Réceptionner</button> <button class="btn secondary" type="button" data-rec="control" data-id="${r.id}">Contrôle requis</button> <button class="btn secondary" type="button" data-rec="block" data-id="${r.id}">Bloquer</button> <button class="btn secondary" type="button" data-rec="reserve" data-id="${r.id}">Réserve</button> <button class="btn secondary" type="button" data-rec-detail="${r.id}">Détail</button></td></tr>`).join('')}
      </tbody></table></div>
      ${receptionEdit ? recEditForm(receptionRows.find((r) => r.id === receptionEdit)) : ''}
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
      ${recForm(receptionRefs)}
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

function renderPage(container, section = 'reception', state = {}) {
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
    ${section === 'reception' ? renderReception(rows, state) : ''}
    ${section === 'shipping' ? renderShipping(rows) : ''}
    ${section === 'packaging' ? '<article class="card"><h4>Conditionnement & palettes</h4><p>En attente de développement.</p></article>' : ''}
  `;

  container.querySelectorAll('[data-section]').forEach((btn) => btn.addEventListener('click', () => renderPage(container, btn.dataset.section, {})));
  container.querySelectorAll('[data-rk]').forEach((btn) => btn.addEventListener('click', () => renderPage(container, 'reception', { ...state, receptionKpi: state.receptionKpi === btn.dataset.rk ? null : btn.dataset.rk, receptionDetail: null })));
  container.querySelector('#back-rec')?.addEventListener('click', () => renderPage(container, 'reception', {}));
  container.querySelectorAll('[data-rec-detail]').forEach((btn) => btn.addEventListener('click', () => renderPage(container, 'reception', { ...state, receptionDetail: Number(btn.dataset.recDetail), receptionKpi: null })));
  container.querySelector('#rec-edit-cancel')?.addEventListener('click', () => renderPage(container, 'reception', {}));
  container.querySelectorAll('[data-rec]').forEach((btn) => btn.addEventListener('click', () => {
    const id = Number(btn.dataset.id);
    const status = { received: 'Réceptionnée', control: 'À contrôler', block: 'Bloquée', reserve: 'Réserve émise' }[btn.dataset.rec] || 'En attente';
    try {
      updateRecord('logistique', id, { statut: status });
    } catch (error) {
      console.error('Logistique: erreur action réception', error);
    }
    renderPage(container, 'reception', state);
  }));
  container.querySelectorAll('[data-rec-edit]').forEach((btn) => btn.addEventListener('click', () => renderPage(container, 'reception', { ...state, receptionEdit: Number(btn.dataset.recEdit), receptionDetail: Number(btn.dataset.recEdit) })));
  container.querySelector('#add-ref')?.addEventListener('click', () => renderPage(container, 'reception', { ...state, receptionRefs: (state.receptionRefs || 1) + 1 }));
  container.querySelector('#rec-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    const refs = Object.keys(d).filter((k) => k.startsWith('ref_')).map((k) => k.split('_')[1]).map((i) => ({ referencePiece: d[`ref_${i}`], designationPiece: d[`des_${i}`], quantiteAttendue: Number(d[`qa_${i}`] || 0), quantiteRecue: Number(d[`qr_${i}`] || 0), etat: d[`etat_${i}`] }));
    refs.forEach((r) => addRecord('logistique', { dateMouvement: d.dateReception, typeMouvement: 'Réception pièces brutes', numeroOF: d.numeroOF, numeroCommande: d.numeroCommande, clientNom: d.client, referencePiece: r.referencePiece, designationPiece: r.designationPiece, quantiteAttendue: r.quantiteAttendue, quantiteRecue: r.quantiteRecue, statut: r.etat === 'Conforme' ? 'Réceptionnée' : 'Anomalie réception', numeroBL: d.numeroBL, transporteur: d.transporteur, commentaire: d.commentaire }));
    renderPage(container, 'reception', {});
  });
  container.querySelector('#rec-edit-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    updateRecord('logistique', Number(d.id), { numeroOF: d.numeroOF, quantiteAttendue: Number(d.quantiteAttendue || 0), quantiteRecue: Number(d.quantiteRecue || 0), statut: d.statut, transporteur: d.transporteur });
    renderPage(container, 'reception', {});
  });
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
    renderPage(container, 'shipping', state);
  }));
}

export function renderLogistiquePage(container) {
  renderPage(container, 'reception', {});
}

function recForm(refCount = 1) {
  const refs = Array.from({ length: refCount }, (_, i) => `<div class="reference-row"><label class="form-field">Référence pièce<input name="ref_${i}" /></label><label class="form-field">Désignation pièce<input name="des_${i}" /></label><label class="form-field">Quantité attendue<input type="number" name="qa_${i}" value="0"/></label><label class="form-field">Quantité reçue<input type="number" name="qr_${i}" value="0"/></label><label class="form-field">État à réception<select name="etat_${i}"><option>Conforme</option><option>Abîmé</option><option>Incomplet</option><option>À vérifier</option></select></label></div>`).join('');
  return `<h5>Enregistrer une réception</h5><form id="rec-form"><div class="record-form"><label class="form-field">Date réception<input type="date" name="dateReception" value="${new Date().toISOString().slice(0, 10)}"/></label><label class="form-field">Client<input name="client"/></label><label class="form-field">N° commande<input name="numeroCommande"/></label><label class="form-field">N° OF<input name="numeroOF"/></label><label class="form-field">Transporteur<input name="transporteur"/></label><label class="form-field">N° BL<input name="numeroBL"/></label><label class="form-field full-row">Commentaire<input name="commentaire"/></label></div>${refs}<div class="controls"><button class="btn secondary" type="button" id="add-ref">+ Ajouter une référence</button><button class="btn" type="submit">Enregistrer</button></div></form>`;
}

function recEditForm(r) {
  if (!r) return '';
  return `<form id="rec-edit-form" class="record-form"><input type="hidden" name="id" value="${r.id}" /><label class="form-field">N° OF<input name="numeroOF" value="${safe(r.numeroOF || '')}"/></label><label class="form-field">Qté attendue<input type="number" name="quantiteAttendue" value="${safe(r.quantiteAttendue || 0)}"/></label><label class="form-field">Qté reçue<input type="number" name="quantiteRecue" value="${safe(r.quantiteRecue || 0)}"/></label><label class="form-field">Statut<input name="statut" value="${safe(r.statut || '')}"/></label><label class="form-field">Transporteur<input name="transporteur" value="${safe(r.transporteur || '')}"/></label><div class="controls"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" id="rec-edit-cancel" type="button">Annuler</button></div></form>`;
}
