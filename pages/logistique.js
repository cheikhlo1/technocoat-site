import { addRecord, exportTableToCSV, getTable, updateRecord } from '../data/databaseService.js';

const RECEPTION_TYPES = ['Réception prévue', 'Réception pièces brutes', 'Réception matière'];
const SHIPPING_TYPES = ['Expédition client', 'Mise à disposition produits finis'];

const safe = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const today = () => new Date().toISOString().slice(0, 10);

function buildRows() {
  const clients = new Map(getTable('clients').map((x) => [x.id, x]));
  const affaires = new Map(getTable('affaires').map((x) => [x.id, x]));
  const commandes = new Map(getTable('commandes').map((x) => [x.id, x]));
  const refs = new Map(getTable('referencesPieces').map((x) => [x.id, x]));
  return getTable('logistique').map((r) => {
    const a = affaires.get(r.affaireId) || {};
    const c = commandes.get(a.commandeId) || {};
    const cl = clients.get(r.clientId || a.clientId) || {};
    const rf = refs.get(r.referenceId) || {};
    return {
      ...r,
      clientNom: r.clientNom || cl.nom || 'Client non défini',
      numeroCommande: r.numeroCommande || c.numeroCommande || '—',
      numeroOF: r.numeroOF || a.numeroOF || '',
      referencePiece: r.referencePiece || rf.referencePiece || '—',
      designationPiece: r.designationPiece || rf.designationPiece || '—',
      dateLivraisonDemandee: r.dateLivraisonDemandee || a.dateLivraisonDemandee || '',
      statutProduction: r.statutProduction || a.statutGlobal || 'En cours',
      quantiteAttendue: Number(r.quantiteAttendue ?? r.quantite ?? 0),
      quantiteRecue: Number(r.quantiteRecue ?? 0),
      quantiteExpediee: Number(r.quantiteExpediee ?? 0),
      statut: r.statut || 'En attente',
      typeConditionnement: r.typeConditionnement || '',
      nombreColis: Number(r.nombreColis || 0),
      besoinPalette: r.besoinPalette || 'Non',
      consommables: r.consommables || 'Film, carton, étiquette',
      transporteur: r.transporteur || '—',
      numeroBL: r.numeroBL || '',
      statutRamassage: r.statutRamassage || 'À faire',
      historiqueActions: r.historiqueActions || []
    };
  });
}

function receptionKpis(rows) {
  return {
    prevues: rows.filter((r) => r.dateMouvement === today() && r.typeMouvement === 'Réception prévue').length,
    enreg: rows.filter((r) => r.typeMouvement === 'Réception pièces brutes').length,
    attente: rows.filter((r) => r.statut === 'En attente' || r.typeMouvement === 'Réception prévue').length,
    anom: rows.filter((r) => ['Anomalie réception', 'À vérifier', 'Incomplet'].includes(r.statut)).length,
    qAtt: rows.reduce((s, r) => s + r.quantiteAttendue, 0),
    qRec: rows.reduce((s, r) => s + r.quantiteRecue, 0)
  };
}

function shippingKpis(rows) {
  return {
    prevues: rows.filter((r) => r.dateLivraisonDemandee === today()).length,
    pretes: rows.filter((r) => ['Préparée', 'Prête expédition'].includes(r.statut)).length,
    realisees: rows.filter((r) => r.statut === 'Expédiée').length,
    retard: rows.filter((r) => r.statut === 'Retardée').length,
    bl: rows.filter((r) => !r.numeroBL).length,
    ramassage: rows.filter((r) => r.statutRamassage === 'À faire').length
  };
}

function render(container, state = {}) {
  const { section = 'reception', receptionKpi = null, receptionDetail = null, receptionEdit = null, receptionRefs = 1, shipDetail = null, shipEdit = null, shipObserve = null, shipKpi = null, hidePickupAlert = false } = state;
  const all = buildRows();
  const receptions = all.filter((r) => RECEPTION_TYPES.includes(r.typeMouvement));
  const shipments = all.filter((r) => SHIPPING_TYPES.includes(r.typeMouvement));
  const rk = receptionKpis(receptions);
  const sk = shippingKpis(shipments);

  const recFiltered = receptionKpi ? receptions.filter((r) => ({ prevues: r.dateMouvement === today() && r.typeMouvement === 'Réception prévue', enreg: r.typeMouvement === 'Réception pièces brutes', attente: r.statut === 'En attente' || r.typeMouvement === 'Réception prévue', anom: ['Anomalie réception', 'À vérifier', 'Incomplet'].includes(r.statut), qAtt: r.quantiteAttendue > 0, qRec: r.quantiteRecue > 0 }[receptionKpi])) : receptions;

  const shipFiltered = shipKpi ? shipments.filter((s) => ({
    prevues: s.dateLivraisonDemandee === today(),
    pretes: ['Préparée', 'Prête expédition'].includes(s.statut) || ['Terminée', 'Prête'].includes(s.statutProduction),
    realisees: s.statut === 'Expédiée',
    retard: s.statut === 'Retardée' || (s.dateLivraisonDemandee && s.dateLivraisonDemandee < today() && s.statut !== 'Expédiée'),
    bl: !s.numeroBL || s.numeroBL === 'À préparer',
    ramassage: s.statutRamassage === 'À faire'
  }[shipKpi])) : shipments;
  const shipKpiLabel = { prevues: 'Expéditions prévues aujourd’hui', pretes: 'Affaires prêtes à expédier', realisees: 'Expéditions réalisées', retard: 'Expéditions en retard', bl: 'BL à préparer', ramassage: 'Demandes de ramassage à prévoir' }[shipKpi] || '';

  container.innerHTML = `
  <section class="table-grid">
    <button class="card kpi ${section === 'reception' ? 'active-tab' : ''}" data-section="reception" type="button"><h4>Réception</h4><p>Arrivées, conformité et mise à disposition atelier.</p></button>
    <button class="card kpi ${section === 'shipping' ? 'active-tab' : ''}" data-section="shipping" type="button"><h4>Expédition</h4><p>BL, chargement, envoi client et suivi.</p></button>
    <article class="card kpi"><h4>Conditionnement & palettes</h4><p>En attente de développement.</p></article>
  </section>

  ${section === 'reception' ? `<section class="card"><h4>Réception des pièces et marchandises</h4><p>Enregistrement des arrivées, contrôle de conformité et mise à disposition atelier.</p>
  <div class="table-grid logistic-kpi-grid">
  <button class="card kpi kpi-btn ${receptionKpi === 'prevues' ? 'active-tab' : ''}" data-rk="prevues" type="button"><h4>Réceptions prévues aujourd’hui</h4><p class="kpi-count">${rk.prevues}</p></button>
  <button class="card kpi kpi-btn ${receptionKpi === 'enreg' ? 'active-tab' : ''}" data-rk="enreg" type="button"><h4>Réceptions enregistrées</h4><p class="kpi-count">${rk.enreg}</p></button>
  <button class="card kpi kpi-btn ${receptionKpi === 'attente' ? 'active-tab' : ''}" data-rk="attente" type="button"><h4>Réceptions en attente</h4><p class="kpi-count">${rk.attente}</p></button>
  <button class="card kpi kpi-btn ${receptionKpi === 'anom' ? 'active-tab' : ''}" data-rk="anom" type="button"><h4>Réceptions avec anomalie</h4><p class="kpi-count">${rk.anom}</p></button>
  <button class="card kpi kpi-btn ${receptionKpi === 'qAtt' ? 'active-tab' : ''}" data-rk="qAtt" type="button"><h4>Quantité attendue</h4><p class="kpi-count">${rk.qAtt}</p></button>
  <button class="card kpi kpi-btn ${receptionKpi === 'qRec' ? 'active-tab' : ''}" data-rk="qRec" type="button"><h4>Quantité reçue</h4><p class="kpi-count">${rk.qRec}</p></button></div>

  ${receptionKpi || receptionDetail ? `<article class="card"><div class="controls"><button class="btn secondary" id="back-rec" type="button">Retour à la vue Réception</button></div>
  <div class="table-wrapper"><table><thead><tr><th>Date</th><th>Client</th><th>N° commande</th><th>N° OF</th><th>Référence</th><th>Désignation</th><th>Qté attendue</th><th>Qté reçue</th><th>Statut</th><th>Transporteur</th><th>Action</th></tr></thead><tbody>${(receptionDetail ? receptions.filter((r)=>r.id===receptionDetail) : recFiltered).map((r)=>`<tr><td>${safe(r.dateMouvement)}</td><td>${safe(r.clientNom)}</td><td>${safe(r.numeroCommande)}</td><td>${safe(r.numeroOF||'—')}</td><td>${safe(r.referencePiece)}</td><td>${safe(r.designationPiece)}</td><td>${r.quantiteAttendue}</td><td>${r.quantiteRecue}</td><td><span class="status-pill">${safe(r.statut)}</span></td><td>${safe(r.transporteur)}</td><td><button class="btn secondary" data-rec-edit="${r.id}" type="button">Modifier</button></td></tr>`).join('')}</tbody></table></div>${receptionEdit ? recEditForm(receptions.find((r)=>r.id===receptionEdit)) : ''}</article>` : `<div class="logistic-reception-layout"><div class="table-wrapper"><table><thead><tr><th>Date</th><th>Client</th><th>N° commande</th><th>N° OF</th><th>Référence</th><th>Désignation</th><th>Qté attendue</th><th>Statut</th><th>Transporteur</th><th>Action</th></tr></thead><tbody>${receptions.map((r)=>`<tr><td>${safe(r.dateMouvement)}</td><td>${safe(r.clientNom)}</td><td>${safe(r.numeroCommande)}</td><td>${safe(r.numeroOF||'—')}</td><td>${safe(r.referencePiece)}</td><td>${safe(r.designationPiece)}</td><td>${r.quantiteAttendue}</td><td><span class="status-pill">${safe(r.statut)}</span></td><td>${safe(r.transporteur)}</td><td><button class="btn secondary" data-rec-detail="${r.id}" type="button">Détail</button></td></tr>`).join('')}</tbody></table></div><article class="card reception-form-card">${recForm(receptionRefs)}</article></div>`}
  </section>` : ''}

  ${section === 'shipping' ? `<section class="card"><h4>Expédition</h4><p>Préparation des BL, chargement, envoi client et suivi expédition.</p>
  <div class="table-grid logistic-kpi-grid"><button class="card kpi kpi-btn ${shipKpi==='prevues'?'active-tab':''}" data-sk="prevues" type="button"><h4>Expéditions prévues aujourd’hui</h4><p class="kpi-count">${sk.prevues}</p></button><button class="card kpi kpi-btn ${shipKpi==='pretes'?'active-tab':''}" data-sk="pretes" type="button"><h4>Affaires prêtes à expédier</h4><p class="kpi-count">${sk.pretes}</p></button><button class="card kpi kpi-btn ${shipKpi==='realisees'?'active-tab':''}" data-sk="realisees" type="button"><h4>Expéditions réalisées</h4><p class="kpi-count">${sk.realisees}</p></button><button class="card kpi kpi-btn ${shipKpi==='retard'?'active-tab':''}" data-sk="retard" type="button"><h4>Expéditions en retard</h4><p class="kpi-count">${sk.retard}</p></button><button class="card kpi kpi-btn ${shipKpi==='bl'?'active-tab':''}" data-sk="bl" type="button"><h4>BL à préparer</h4><p class="kpi-count">${sk.bl}</p></button><button class="card kpi kpi-btn ${shipKpi==='ramassage'?'active-tab':''}" data-sk="ramassage" type="button"><h4>Demandes de ramassage à prévoir</h4><p class="kpi-count">${sk.ramassage}</p></button></div>
  ${hidePickupAlert ? '' : `<article class="card"><h4>Demandes de ramassage à prévoir</h4><div class="controls"><button class="btn secondary" id="show-pickup-detail" type="button">Voir les demandes</button><button class="btn secondary" id="hide-pickup-alert" type="button">Marquer comme traité</button></div><div class="table-wrapper"><table><thead><tr><th>Client</th><th>N° OF</th><th>Référence</th><th>Date expédition prévue</th><th>Transporteur</th><th>Statut ramassage</th></tr></thead><tbody>${shipments.filter((r)=>r.statutRamassage==='À faire').map((r)=>`<tr><td>${safe(r.clientNom)}</td><td>${safe(r.numeroOF||'—')}</td><td>${safe(r.referencePiece)}</td><td>${safe(r.dateLivraisonDemandee)}</td><td>${safe(r.transporteur)}</td><td>${safe(r.statutRamassage)}</td></tr>`).join('')}</tbody></table></div></article>`}
  ${shipDetail ? shipDetailView(shipments.find((s)=>s.id===shipDetail), shipEdit, shipObserve) : shipKpi ? `<article class="card"><div class="controls"><button class="btn secondary" id="back-ship-kpi" type="button">Retour à la vue Expédition</button></div><h4>${shipKpiLabel}</h4><p>${shipFiltered.length} élément(s)</p><div class="table-wrapper"><table><thead><tr><th>Date expédition prévue</th><th>Client</th><th>N° commande</th><th>N° OF</th><th>Référence</th><th>Désignation</th><th>Qté prête</th><th>Statut production</th><th>Statut expédition</th><th>BL</th><th>Transporteur</th><th>Statut ramassage</th><th>Action</th></tr></thead><tbody>${shipFiltered.map((s)=>`<tr><td>${safe(s.dateLivraisonDemandee)}</td><td>${safe(s.clientNom)}</td><td>${safe(s.numeroCommande)}</td><td>${safe(s.numeroOF||'—')}</td><td>${safe(s.referencePiece)}</td><td>${safe(s.designationPiece)}</td><td>${s.quantiteAttendue}</td><td>${safe(s.statutProduction)}</td><td><span class="status-pill">${safe(s.statut)}</span></td><td>${safe(s.numeroBL||'À préparer')}</td><td>${safe(s.transporteur)}</td><td>${safe(s.statutRamassage)}</td><td>
  <button class="btn secondary" data-ship-action="bl" data-id="${s.id}" type="button">BL préparé</button><button class="btn secondary" data-ship-action="ask" data-id="${s.id}" type="button">Ramassage demandé</button><button class="btn secondary" data-ship-action="ok" data-id="${s.id}" type="button">Ramassage confirmé</button><button class="btn secondary" data-ship-action="sent" data-id="${s.id}" type="button">Expédié</button><button class="btn secondary" data-ship-action="block" data-id="${s.id}" type="button">Bloqué</button><button class="btn secondary" data-ship-detail="${s.id}" type="button">Détail</button></td></tr>`).join('')}</tbody></table></div></article>` : `<div class="table-wrapper"><table><thead><tr><th>Date expédition prévue</th><th>Client</th><th>N° OF</th><th>Référence</th><th>Désignation</th><th>Qté prête</th><th>Statut production</th><th>Statut expédition</th><th>BL</th><th>Transporteur</th><th>Besoins expédition</th><th>Actions</th></tr></thead><tbody>${shipments.map((s)=>`<tr><td>${safe(s.dateLivraisonDemandee)}</td><td>${safe(s.clientNom)}</td><td>${safe(s.numeroOF||'—')}</td><td>${safe(s.referencePiece)}</td><td>${safe(s.designationPiece)}</td><td>${s.quantiteAttendue}</td><td>${safe(s.statutProduction)}</td><td><span class="status-pill">${safe(s.statut)}</span></td><td>${safe(s.numeroBL||'À préparer')}</td><td>${safe(s.transporteur)}</td><td>${safe(s.typeConditionnement||'Conditionnement standard')} / Colis: ${s.nombreColis || 1} / Palette: ${safe(s.besoinPalette)} / ${safe(s.consommables)}</td><td>
  <button class="btn secondary" data-ship-action="bl" data-id="${s.id}" type="button">BL préparé</button>
  <button class="btn secondary" data-ship-action="ask" data-id="${s.id}" type="button">Ramassage demandé</button>
  <button class="btn secondary" data-ship-action="ok" data-id="${s.id}" type="button">Ramassage confirmé</button>
  <button class="btn secondary" data-ship-action="sent" data-id="${s.id}" type="button">Expédié</button>
  <button class="btn secondary" data-ship-action="block" data-id="${s.id}" type="button">Bloqué</button>
  <button class="btn secondary" data-ship-detail="${s.id}" type="button">Détail</button></td></tr>`).join('')}</tbody></table></div>`}
  </section>` : ''}
  `;

  container.querySelectorAll('[data-section]').forEach((b) => b.addEventListener('click', () => render(container, { section: b.dataset.section })));
  container.querySelectorAll('[data-rk]').forEach((b) => b.addEventListener('click', () => render(container, { ...state, section: 'reception', receptionKpi: receptionKpi === b.dataset.rk ? null : b.dataset.rk, receptionDetail: null, receptionEdit: null })));
  container.querySelector('#back-rec')?.addEventListener('click', () => render(container, { section: 'reception' }));
  container.querySelectorAll('[data-rec-detail]').forEach((b) => b.addEventListener('click', () => { const id = Number(b.dataset.recDetail); render(container, { ...state, section: 'reception', receptionDetail: receptionDetail === id ? null : id, receptionKpi: null }); }));
  container.querySelectorAll('[data-rec-edit]').forEach((b) => b.addEventListener('click', () => render(container, { ...state, section: 'reception', receptionEdit: Number(b.dataset.recEdit), receptionDetail: Number(b.dataset.recEdit) })));
  container.querySelector('#rec-edit-cancel')?.addEventListener('click', () => render(container, { section: 'reception' }));

  container.querySelector('#add-ref')?.addEventListener('click', () => render(container, { ...state, section: 'reception', receptionRefs: receptionRefs + 1 }));
  container.querySelector('#rec-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    const refs = Object.keys(d).filter((k) => k.startsWith('ref_')).map((k) => k.split('_')[1]).map((i) => ({
      referencePiece: d[`ref_${i}`], designationPiece: d[`des_${i}`], quantiteAttendue: Number(d[`qa_${i}`] || 0), quantiteRecue: Number(d[`qr_${i}`] || 0), etat: d[`etat_${i}`]
    }));
    refs.forEach((r) => {
      const statut = d.numeroOF ? (r.etat === 'Conforme' ? 'Réception terminée' : 'Anomalie réception') : 'OF à créer / à rattacher';
      addRecord('logistique', { dateMouvement: d.dateReception, heureMouvement: d.heureReception, typeMouvement: 'Réception pièces brutes', clientNom: d.client, numeroCommande: d.numeroCommande, numeroOF: d.numeroOF, referencePiece: r.referencePiece, designationPiece: r.designationPiece, quantiteAttendue: r.quantiteAttendue, quantiteRecue: r.quantiteRecue, statut, transporteur: d.transporteur, numeroBL: d.numeroBL, emplacementDepose: d.emplacementDepose, commentaire: d.commentaire });
      if (r.etat !== 'Conforme') addRecord('observations', { dateObservation: d.dateReception, activite: 'Logistique', typeObservation: 'Anomalie', importance: r.etat === 'Abîmé' ? 'Critique' : 'Moyenne', commentaire: d.commentaire || `Réception ${r.referencePiece}`, statutTraitement: 'Ouvert', actionPrevue: 'Traiter la non conformité', responsableTraitement: 'Responsable logistique' });
    });
    render(container, { section: 'reception' });
  });

  container.querySelector('#rec-edit-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    updateRecord('logistique', Number(d.id), { numeroOF: d.numeroOF, quantiteAttendue: Number(d.quantiteAttendue || 0), quantiteRecue: Number(d.quantiteRecue || 0), statut: d.statut, transporteur: d.transporteur });
    render(container, { section: 'reception' });
  });

  container.querySelectorAll('[data-sk]').forEach((b) => b.addEventListener('click', () => render(container, { ...state, section: 'shipping', shipKpi: shipKpi === b.dataset.sk ? null : b.dataset.sk, shipDetail: null, shipEdit: false })));
  container.querySelector('#back-ship-kpi')?.addEventListener('click', () => render(container, { ...state, section: 'shipping', shipKpi: null }));
  container.querySelector('#show-pickup-detail')?.addEventListener('click', () => render(container, { ...state, section: 'shipping', shipKpi: 'ramassage' }));
  container.querySelector('#hide-pickup-alert')?.addEventListener('click', () => { localStorage.setItem('technocoat_hide_pickup_alert', '1'); render(container, { ...state, section: 'shipping', hidePickupAlert: true }); });
  container.querySelectorAll('[data-ship-detail]').forEach((b) => b.addEventListener('click', () => { const id = Number(b.dataset.shipDetail); render(container, { ...state, section: 'shipping', shipDetail: shipDetail === id ? null : id, shipEdit: false, shipObserve: false, shipKpi })); }));
  container.querySelector('#ship-back')?.addEventListener('click', () => render(container, { section: 'shipping' }));
  container.querySelector('#ship-edit')?.addEventListener('click', () => render(container, { ...state, section: 'shipping', shipEdit: true }));
  container.querySelector('#ship-edit-cancel')?.addEventListener('click', () => render(container, { ...state, section: 'shipping', shipEdit: false }));
  container.querySelector('#ship-observe')?.addEventListener('click', () => render(container, { ...state, section: 'shipping', shipObserve: !shipObserve }));

  container.querySelectorAll('[data-ship-action]').forEach((b) => b.addEventListener('click', () => {
    const id = Number(b.dataset.id); const row = shipments.find((s) => s.id === id); if (!row) return;
    const action = b.dataset.shipAction;
    const patch = { historiqueActions: [...(row.historiqueActions || []), `${today()} ${action}`] };
    if (action === 'bl') patch.numeroBL = row.numeroBL || `BL-${today()}`;
    if (action === 'ask') patch.statutRamassage = 'Demandée';
    if (action === 'ok') patch.statutRamassage = 'Confirmée';
    if (action === 'sent') patch.statut = 'Expédiée';
    if (action === 'block') patch.statut = 'Bloquée';
    updateRecord('logistique', id, patch);
    if (action === 'block') addRecord('observations', { dateObservation: today(), activite: 'Logistique', typeObservation: 'Anomalie', importance: 'Élevée', commentaire: `Blocage expédition ${row.numeroOF || ''}`, statutTraitement: 'Ouvert', actionPrevue: 'Déblocage expédition', responsableTraitement: 'Responsable logistique' });
    render(container, { ...state, section: 'shipping', shipKpi });
  }));

  container.querySelector('#ship-observation-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    addRecord('observations', { dateObservation: today(), activite: 'Logistique', typeObservation: d.typeObservation, importance: d.importance, commentaire: d.commentaire, statutTraitement: 'Ouvert', actionPrevue: 'Analyse logistique', responsableTraitement: 'Responsable logistique' });
    render(container, { ...state, section: 'shipping', shipObserve: false });
  });

  container.querySelector('#export-ship')?.addEventListener('click', () => exportTableToCSV(`export_livraisons_${today()}`, shipments));
}

function recForm(refCount) {
  const refs = Array.from({ length: refCount }, (_, i) => `<div class="reference-row"><label class="form-field">Référence pièce<input name="ref_${i}" /></label><label class="form-field">Désignation pièce<input name="des_${i}" /></label><label class="form-field">Quantité attendue<input type="number" name="qa_${i}" value="0"/></label><label class="form-field">Quantité reçue<input type="number" name="qr_${i}" value="0"/></label><label class="form-field">État à réception<select name="etat_${i}"><option>Conforme</option><option>Abîmé</option><option>Incomplet</option><option>À vérifier</option></select></label></div>`).join('');
  return `<h4>Enregistrer une réception</h4><form id="rec-form"><div class="record-form"><label class="form-field">Date réception<input type="date" name="dateReception" value="${today()}"/></label><label class="form-field">Heure réception<input type="time" name="heureReception" value="08:00"/></label><label class="form-field">Client<input name="client"/></label><label class="form-field">N° commande<input name="numeroCommande"/></label><label class="form-field">N° OF<input name="numeroOF"/></label><label class="form-field">Transporteur<input name="transporteur"/></label><label class="form-field">N° BL<input name="numeroBL"/></label><label class="form-field">Emplacement de dépose<input name="emplacementDepose"/></label><label class="form-field full-row">Commentaire<input name="commentaire"/></label></div><div>${refs}</div><div class="controls"><button class="btn secondary" type="button" id="add-ref">+ Ajouter une référence</button><button class="btn" type="submit">Enregistrer</button></div></form>`;
}

function recEditForm(r) {
  if (!r) return '';
  return `<form id="rec-edit-form" class="record-form"><input type="hidden" name="id" value="${r.id}"/><label class="form-field">N° OF<input name="numeroOF" value="${safe(r.numeroOF)}"/></label><label class="form-field">Qté attendue<input type="number" name="quantiteAttendue" value="${r.quantiteAttendue}"/></label><label class="form-field">Qté reçue<input type="number" name="quantiteRecue" value="${r.quantiteRecue}"/></label><label class="form-field">Statut<input name="statut" value="${safe(r.statut)}"/></label><label class="form-field">Transporteur<input name="transporteur" value="${safe(r.transporteur)}"/></label><div class="controls"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="rec-edit-cancel">Annuler</button></div></form>`;
}

function shipDetailView(s, edit, observe) {
  if (!s) return '';
  return `<article class="card"><div class="controls"><button id="ship-back" class="btn secondary" type="button">Retour</button><button id="ship-edit" class="btn secondary" type="button">Modifier</button><button id="ship-observe" class="btn secondary" type="button">Ajouter observation</button></div><h4>Détail expédition</h4><p><strong>Client:</strong> ${safe(s.clientNom)} | <strong>Commande:</strong> ${safe(s.numeroCommande)} | <strong>N° OF:</strong> ${safe(s.numeroOF||'—')}</p><p><strong>Référence:</strong> ${safe(s.referencePiece)} - ${safe(s.designationPiece)} | <strong>Quantité:</strong> ${s.quantiteAttendue}</p><p><strong>Statut production:</strong> ${safe(s.statutProduction)} | <strong>Statut expédition:</strong> ${safe(s.statut)} | <strong>BL:</strong> ${safe(s.numeroBL||'À préparer')} | <strong>Transporteur:</strong> ${safe(s.transporteur)}</p><p><strong>Ramassage:</strong> ${safe(s.statutRamassage)} | <strong>Conditionnement:</strong> ${safe(s.typeConditionnement||'Standard')} | <strong>Consommables:</strong> ${safe(s.consommables)}</p><p><strong>Historique:</strong> ${(s.historiqueActions||[]).slice(-3).join(' / ') || 'Aucune action'}</p>${edit ? `<form id="ship-edit-form" class="record-form"><label class="form-field">Statut<input name="statut" value="${safe(s.statut)}"/></label><label class="form-field">Transporteur<input name="transporteur" value="${safe(s.transporteur)}"/></label><label class="form-field">N° BL<input name="numeroBL" value="${safe(s.numeroBL)}"/></label><label class="form-field">Qté expédiée<input type="number" name="quantiteExpediee" value="${s.quantiteExpediee}"/></label><input type="hidden" name="id" value="${s.id}"/><div class="controls"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" type="button" id="ship-edit-cancel">Annuler</button></div></form>` : ''}${observe ? `<form id="ship-observation-form" class="record-form"><label class="form-field">Type<select name="typeObservation"><option>Anomalie</option><option>Retard</option></select></label><label class="form-field">Importance<select name="importance"><option>Moyenne</option><option>Élevée</option></select></label><label class="form-field full-row">Commentaire<input name="commentaire"/></label><div><button class="btn" type="submit">Enregistrer observation</button></div></form>` : ''}</article>`;
}

export function renderLogistiquePage(container) { render(container, { section: 'reception', receptionRefs: 1, hidePickupAlert: localStorage.getItem('technocoat_hide_pickup_alert') === '1' }); }
