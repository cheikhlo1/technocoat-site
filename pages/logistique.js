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
  const shipments = rows.filter((r) => String(r.typeMouvement || '').includes('Expédition') || String(r.typeMouvement || '').includes('Mise à disposition produits finis'));
  const kpi = {
    prevues: shipments.filter((r) => (r.dateLivraisonDemandee || r.dateMouvement) === new Date().toISOString().slice(0, 10)).length,
    pretes: shipments.filter((r) => ['Préparée', 'Prête expédition'].includes(r.statut)).length,
    realisees: shipments.filter((r) => r.statut === 'Expédiée').length,
    retard: shipments.filter((r) => r.statut === 'Retardée').length,
    bl: shipments.filter((r) => !r.numeroBL).length,
    ramassage: shipments.filter((r) => (r.statutRamassage || 'À faire') === 'À faire').length
  };
  return `
    <article class="card">
      <h4>Expédition</h4>
      <p>Préparation des BL, chargement, envoi client et suivi expédition.</p>
      <div class="table-grid logistic-kpi-grid">
        <article class="card kpi"><h4>Expéditions prévues aujourd’hui</h4><p class="kpi-count">${kpi.prevues}</p></article>
        <article class="card kpi"><h4>Affaires prêtes à expédier</h4><p class="kpi-count">${kpi.pretes}</p></article>
        <article class="card kpi"><h4>Expéditions réalisées</h4><p class="kpi-count">${kpi.realisees}</p></article>
        <article class="card kpi"><h4>Expéditions en retard</h4><p class="kpi-count">${kpi.retard}</p></article>
        <article class="card kpi"><h4>BL à préparer</h4><p class="kpi-count">${kpi.bl}</p></article>
        <article class="card kpi"><h4>Demandes de ramassage à prévoir</h4><p class="kpi-count">${kpi.ramassage}</p></article>
      </div>
      <div class="table-wrapper"><table><thead><tr><th>Date expédition prévue</th><th>Client</th><th>N° OF</th><th>Référence</th><th>Désignation</th><th>Qté prête</th><th>Statut production</th><th>Statut expédition</th><th>BL</th><th>Transporteur</th><th>Besoins expédition</th><th>Actions</th></tr></thead><tbody>
      ${shipments.map((r) => `<tr><td>${safe(r.dateLivraisonDemandee || r.dateMouvement || '')}</td><td>${safe(r.clientNom || '')}</td><td>${safe(r.numeroOF || '—')}</td><td>${safe(r.referencePiece || '')}</td><td>${safe(r.designationPiece || '')}</td><td>${safe(r.quantiteAttendue ?? r.quantite ?? '')}</td><td>${safe(r.statutProduction || 'En cours')}</td><td><span class="status-pill">${safe(r.statut || 'En attente')}</span></td><td>${safe(r.numeroBL || 'À préparer')}</td><td>${safe(r.transporteur || '')}</td><td>${safe(r.typeConditionnement || 'Standard')} / Colis: ${safe(r.nombreColis || 1)}</td><td><button class="btn secondary" type="button" data-ship=\"bl\" data-id="${r.id}">BL préparé</button> <button class="btn secondary" type="button" data-ship=\"ask\" data-id="${r.id}">Ramassage demandé</button> <button class="btn secondary" type="button" data-ship=\"ok\" data-id="${r.id}">Ramassage confirmé</button> <button class="btn secondary" type="button" data-ship=\"sent\" data-id="${r.id}">Expédié</button> <button class="btn secondary" type="button" data-ship=\"block\" data-id="${r.id}">Bloqué</button></td></tr>`).join('')}
      </tbody></table></div>
    </article>`;
}

function renderPackaging(rows, state) {
  const { packSelectedId = null, packKpi = null, showPackObs = false } = state;
  const lots = rows.filter((r) => String(r.typeMouvement || '').includes('Expédition') || String(r.typeMouvement || '').includes('Mise à disposition produits finis'));
  const stats = {
    aConditionner: lots.filter((l) => (l.statutConditionnement || 'À conditionner') === 'À conditionner').length,
    enPreparation: lots.filter((l) => ['En cours', 'En attente emballage'].includes(l.statutConditionnement || '')).length,
    pretes: lots.filter((l) => (l.statutConditionnement || '') === 'Palette prête').length,
    anomalies: lots.filter((l) => (l.statutConditionnement || '') === 'Bloqué').length,
    bloques: lots.filter((l) => (l.statutConditionnement || '') === 'Bloqué').length
  };
  const filteredLots = packKpi ? lots.filter((l) => ({
    aConditionner: (l.statutConditionnement || 'À conditionner') === 'À conditionner',
    enPreparation: ['En cours', 'En attente emballage'].includes(l.statutConditionnement || ''),
    pretes: (l.statutConditionnement || '') === 'Palette prête',
    bloques: (l.statutConditionnement || '') === 'Bloqué',
    anomalies: (l.statutConditionnement || '') === 'Bloqué'
  }[packKpi])) : lots;
  const selectedLot = lots.find((l) => l.id === packSelectedId) || filteredLots[0] || {};
  const qtyCond = Number(selectedLot.quantiteConditionnee || 0);
  const qtyAtt = Number(selectedLot.quantiteAttendue ?? selectedLot.quantite ?? 0);
  const qtyRest = Math.max(0, qtyAtt - qtyCond);
  const emptyMessage = {
    enPreparation: 'Aucune palette en préparation.',
    pretes: 'Aucune palette prête à expédier.',
    anomalies: 'Aucune anomalie conditionnement.',
    bloques: 'Aucune anomalie conditionnement.',
    aConditionner: 'Aucune donnée disponible pour le moment.'
  }[packKpi] || 'Aucune donnée disponible pour le moment.';
  const cardsHtml = filteredLots.length ? filteredLots.map((l) => {
    const pieces = [
      `<div><strong>${safe(l.numeroOF || 'OF non renseigné')}</strong></div>`,
      l.clientNom ? `<span>Client ${safe(l.clientNom)}</span>` : '',
      l.referencePiece ? `<span>Réf. ${safe(l.referencePiece)}</span>` : '',
      `<span>Quantité ${safe(l.quantiteAttendue ?? l.quantite ?? 0)}</span>`,
      `<span>Conditionnement ${safe(l.typeConditionnement || 'Standard')}</span>`,
      `<span>Support ${safe(l.numeroPalette || 'Support à définir')}</span>`,
      `<span class="status-pill">${safe(l.statutConditionnement || 'À conditionner')}</span>`
    ].filter(Boolean).join('');
    return `<button type="button" class="card prep-task-card ${packSelectedId === l.id ? 'active' : ''}" data-pack-select="${l.id}">${pieces}</button>`;
  }).join('') : `<article class="card"><h5>${safe({
    aConditionner: 'Lots à conditionner',
    enPreparation: 'Palettes en préparation',
    pretes: 'Palettes prêtes à expédier',
    anomalies: 'Anomalies conditionnement'
  }[packKpi] || 'Conditionnement')}</h5><p>${safe(emptyMessage)}</p></article>`;
  return `
    <article class="card">
      <h4>Conditionnement & palettes</h4>
      <div class="table-grid logistic-kpi-grid">
        <button class="card kpi kpi-btn ${packKpi === 'aConditionner' ? 'active-tab' : ''}" type="button" data-pack-kpi="aConditionner"><h4>Lots à conditionner</h4><p class="kpi-count">${stats.aConditionner}</p></button>
        <button class="card kpi kpi-btn ${packKpi === 'enPreparation' ? 'active-tab' : ''}" type="button" data-pack-kpi="enPreparation"><h4>Palettes en préparation</h4><p class="kpi-count">${stats.enPreparation}</p></button>
        <button class="card kpi kpi-btn ${packKpi === 'pretes' ? 'active-tab' : ''}" type="button" data-pack-kpi="pretes"><h4>Palettes prêtes à expédier</h4><p class="kpi-count">${stats.pretes}</p></button>
        <button class="card kpi kpi-btn ${packKpi === 'anomalies' ? 'active-tab' : ''}" type="button" data-pack-kpi="anomalies"><h4>Anomalies conditionnement</h4><p class="kpi-count">${stats.anomalies}</p></button>
      </div>
      ${packKpi ? '<div class="controls"><button class="btn secondary" type="button" id="pack-reset-kpi">Retour vue normale</button></div>' : ''}
      <h5>${safe({
        aConditionner: 'Lots à conditionner',
        enPreparation: 'Palettes en préparation',
        pretes: 'Palettes prêtes à expédier',
        anomalies: 'Anomalies conditionnement'
      }[packKpi] || 'Lots à conditionner')}</h5>
      <div class="prep-task-row">
        ${cardsHtml}
      </div>
      ${filteredLots.length ? `<article class="card">
        <h5>Détail conditionnement</h5>
        <div class="prep-detail-grid">
          <article class="card"><h6>Identification</h6><p><strong>N° OF :</strong> ${safe(selectedLot.numeroOF || '—')}</p><p><strong>Client :</strong> ${safe(selectedLot.clientNom || '')}</p><p><strong>Commande :</strong> ${safe(selectedLot.numeroCommande || '')}</p><p><strong>Référence :</strong> ${safe(selectedLot.referencePiece || '')}</p><p><strong>Désignation :</strong> ${safe(selectedLot.designationPiece || '')}</p></article>
          <article class="card"><h6>Quantités</h6><p><strong>Quantité à conditionner :</strong> ${qtyAtt}</p><p><strong>Quantité conditionnée :</strong> ${qtyCond}</p><p><strong>Quantité restante :</strong> ${qtyRest}</p><p><strong>Non-conformité :</strong> ${safe(selectedLot.nonConformite || 'Aucune')}</p></article>
          <article class="card"><h6>Conditionnement</h6><p><strong>Type :</strong> ${safe(selectedLot.typeConditionnement || 'Carton standard')}</p><p><strong>Nombre de colis :</strong> ${safe(selectedLot.nombreColis || 1)}</p><p><strong>Support / palette :</strong> ${safe(selectedLot.supportPalette || selectedLot.numeroPalette || 'Support A')}</p><p><strong>N° palette :</strong> ${safe(selectedLot.numeroPalette || 'PAL-000')}</p><p><strong>Poids estimé :</strong> ${safe(selectedLot.poidsEstime || '120 kg')}</p><p><strong>Protection :</strong> ${safe(selectedLot.protection || 'Papier, mousse, film')}</p></article>
          <article class="card"><h6>Flux</h6><p><strong>Localisation :</strong> ${safe(selectedLot.localisationActuelle || 'Zone conditionnement')}</p><p><strong>Destination :</strong> Expédition</p><p><strong>Statut conditionnement :</strong> ${safe(selectedLot.statutConditionnement || 'À conditionner')}</p><p><strong>Statut palette :</strong> ${safe(selectedLot.statutPalette || 'En préparation')}</p><p><strong>Date expédition prévue :</strong> ${safe(selectedLot.dateLivraisonDemandee || selectedLot.dateMouvement || '')}</p></article>
          <article class="card"><h6>Besoins / consommables</h6><p>Carton, Film, Étiquette, Protection mousse, Intercalaire, Palette, Cerclage si nécessaire.</p></article>
        </div>
      </article>` : ''}
      <article class="card">
        <h5>Consignes de conditionnement</h5>
        <ul>
          <li>Vérifier la conformité des pièces avant emballage.</li>
          <li>Respecter le type de carton ou support prévu.</li>
          <li>Utiliser les protections demandées : papier, mousse, film, intercalaire.</li>
          <li>Identifier correctement la palette ou le colis.</li>
          <li>Isoler les pièces douteuses ou abîmées.</li>
          <li>Signaler les écarts avant expédition.</li>
        </ul>
      </article>
      ${filteredLots.length ? `<article class="card">
        <h5>Déclaration conditionnement</h5>
        <form id="pack-declare" class="record-form">
          <input type="hidden" name="id" value="${safe(selectedLot.id || '')}" />
          <label class="form-field">Quantité conditionnée<input type="number" name="quantiteConditionnee" value="${safe(selectedLot.quantiteConditionnee || 0)}" /></label>
          <label class="form-field">Nombre de colis<input type="number" name="nombreColis" value="${safe(selectedLot.nombreColis || 1)}" /></label>
          <label class="form-field">N° palette<input name="numeroPalette" value="${safe(selectedLot.numeroPalette || '')}" /></label>
          <label class="form-field">Poids estimé<input name="poidsEstime" value="${safe(selectedLot.poidsEstime || '')}" /></label>
          <label class="form-field">Statut final<select name="statutConditionnement"><option>À conditionner</option><option>En cours</option><option>En attente emballage</option><option>Palette prête</option><option>Bloqué</option></select></label>
          <div><button class="btn" type="submit">Enregistrer</button></div>
        </form>
      </article>
      <div class="controls"><button class="btn secondary" type="button" data-pack="start" data-id="${safe(selectedLot.id || '')}">Démarrer</button> <button class="btn secondary" type="button" data-pack="ready" data-id="${safe(selectedLot.id || '')}">Marquer prêt</button> <button class="btn secondary" type="button" data-pack="issue" data-id="${safe(selectedLot.id || '')}">Signaler anomalie</button> <button class="btn secondary" type="button" data-pack="block" data-id="${safe(selectedLot.id || '')}">Bloquer</button></div>
      ${(showPackObs || ['Bloqué', 'En attente emballage'].includes(selectedLot.statutConditionnement || '')) ? `<article class="card"><h5>Observation conditionnement</h5><form id="pack-observation" class="record-form"><input type="hidden" name="id" value="${safe(selectedLot.id || '')}" /><label class="form-field">Type<select name="typeObservation"><option>Anomalie</option><option>Retard</option></select></label><label class="form-field">Importance<select name="importance"><option>Moyenne</option><option>Élevée</option></select></label><label class="form-field full-row">Commentaire<textarea name="commentaire" rows="3" placeholder="carton non adapté, manque protection, pièce abîmée, palette incomplète, attente décision qualité, autre observation terrain"></textarea></label><div><button class="btn" type="submit">Enregistrer observation</button></div></form></article>` : ''}` : ''}
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
    ${section === 'packaging' ? renderPackaging(rows, state) : ''}
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
    const action = btn.dataset.ship;
    try {
      const patch = {};
      if (action === 'sent') patch.statut = 'Expédiée';
      if (action === 'block') patch.statut = 'Bloquée';
      if (action === 'bl') patch.numeroBL = `BL-${new Date().toISOString().slice(0, 10)}`;
      if (action === 'ask') patch.statutRamassage = 'Demandée';
      if (action === 'ok') patch.statutRamassage = 'Confirmée';
      updateRecord('logistique', id, patch);
      if (action === 'block') {
        addRecord('observations', { dateObservation: new Date().toISOString().slice(0, 10), activite: 'Logistique', typeObservation: 'Anomalie', importance: 'Élevée', commentaire: 'Blocage expédition', statutTraitement: 'Ouvert', actionPrevue: 'Analyser le blocage', responsableTraitement: 'Responsable logistique' });
      }
    } catch (error) {
      console.error('Logistique: erreur action expédition', error);
    }
    renderPage(container, 'shipping', state);
  }));
  container.querySelectorAll('[data-pack]').forEach((btn) => btn.addEventListener('click', () => {
    const id = Number(btn.dataset.id);
    const action = btn.dataset.pack;
    const status = { start: 'En cours', ready: 'Palette prête', issue: 'En attente emballage', block: 'Bloqué' }[action] || 'À conditionner';
    try {
      updateRecord('logistique', id, { statutConditionnement: status });
      if (action === 'issue' || action === 'block') {
        addRecord('observations', { dateObservation: new Date().toISOString().slice(0, 10), activite: 'Logistique', typeObservation: 'Anomalie', importance: action === 'block' ? 'Élevée' : 'Moyenne', commentaire: 'Anomalie conditionnement', statutTraitement: 'Ouvert', actionPrevue: 'Analyser le conditionnement', responsableTraitement: 'Responsable logistique' });
      }
    } catch (error) {
      console.error('Logistique: erreur action conditionnement', error);
    }
    renderPage(container, 'packaging', { ...state, packSelectedId: id, showPackObs: action === 'issue' || action === 'block' });
  }));
  container.querySelectorAll('[data-pack-kpi]').forEach((btn) => btn.addEventListener('click', () => renderPage(container, 'packaging', { ...state, packKpi: state.packKpi === btn.dataset.packKpi ? null : btn.dataset.packKpi, packSelectedId: null })));
  container.querySelector('#pack-reset-kpi')?.addEventListener('click', () => renderPage(container, 'packaging', { ...state, packKpi: null }));
  container.querySelectorAll('[data-pack-select]').forEach((btn) => btn.addEventListener('click', () => renderPage(container, 'packaging', { ...state, packSelectedId: Number(btn.dataset.packSelect) })));
  container.querySelector('#pack-declare')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (!d.id) return;
    updateRecord('logistique', Number(d.id), { quantiteConditionnee: Number(d.quantiteConditionnee || 0), nombreColis: Number(d.nombreColis || 1), numeroPalette: d.numeroPalette, poidsEstime: d.poidsEstime, statutConditionnement: d.statutConditionnement });
    renderPage(container, 'packaging', { ...state, packSelectedId: Number(d.id) });
  });
  container.querySelector('#pack-observation')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    addRecord('observations', { dateObservation: new Date().toISOString().slice(0, 10), activite: 'Logistique', typeObservation: d.typeObservation, importance: d.importance, commentaire: d.commentaire, statutTraitement: 'Ouvert', actionPrevue: 'Analyser le conditionnement', responsableTraitement: 'Responsable logistique' });
    renderPage(container, 'packaging', { ...state, showPackObs: false });
  });
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
