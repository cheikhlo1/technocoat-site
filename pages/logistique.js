import {
  addRecord,
  exportTableToCSV,
  filterRecords,
  getTable,
  updateRecord
} from '../data/databaseService.js';

const TABS = [
  { key: 'global', label: 'Vue globale' },
  { key: 'reception', label: 'Réception' },
  { key: 'shipping', label: 'Livraison / Expédition' },
  { key: 'packaging', label: 'Conditionnement & palettes' },
  { key: 'issues', label: 'Anomalies logistiques' },
  { key: 'history', label: 'Historique des mouvements' }
];

const LOGISTICS_OPERATOR = 'Hugo Martin (Opérateur logistique)';

const dateLabel = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

function safe(v) {
  return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function toRecordMap(table, key = 'id') {
  const map = new Map();
  table.forEach((item) => map.set(item[key], item));
  return map;
}

function readContext() {
  const clients = getTable('clients');
  const affaires = getTable('affaires');
  const references = getTable('referencesPieces');
  const commandes = getTable('commandes');
  const logistique = getTable('logistique');
  const observations = filterRecords('observations', { activite: 'Logistique' });
  return {
    clients,
    affaires,
    references,
    commandes,
    logistique,
    observations,
    clientMap: toRecordMap(clients),
    affaireMap: toRecordMap(affaires),
    referenceMap: toRecordMap(references),
    commandeMap: toRecordMap(commandes)
  };
}

function buildEntry(record, ctx) {
  const affaire = ctx.affaireMap.get(record.affaireId) || {};
  const reference = ctx.referenceMap.get(record.referenceId) || {};
  const client = ctx.clientMap.get(record.clientId || affaire.clientId) || {};
  const commande = ctx.commandeMap.get(affaire.commandeId) || {};
  return {
    ...record,
    clientNom: client.nom || 'Client non défini',
    numeroOF: affaire.numeroOF || '—',
    numeroCommande: commande.numeroCommande || '—',
    affaireLabel: `Affaire ${affaire.id || '—'}`,
    referenceCode: reference.referencePiece || '—',
    referenceDesignation: reference.designationPiece || '—',
    quantiteReference: Number(reference.quantite || 0),
    dateLivraisonDemandee: affaire.dateLivraisonDemandee || commande.dateLivraisonDemandee || ''
  };
}

function renderPage(container, activeTab = 'global') {
  const ctx = readContext();
  const logisticsEntries = ctx.logistique.map((record) => buildEntry(record, ctx));
  const now = new Date();

  container.innerHTML = `
    <section class="card logistic-header-card">
      <div>
        <h3>Logistique</h3>
        <p>Réception, conditionnement, mise en palette et expédition des pièces</p>
      </div>
      <div class="logistic-header-meta">
        <p><strong>Date :</strong> ${safe(dateLabel.format(now))}</p>
        <p><strong>Opérateur :</strong> ${safe(LOGISTICS_OPERATOR)}</p>
      </div>
    </section>

    <section class="card">
      <div class="logistic-tabbar">
        ${TABS.map((tab) => `<button type="button" data-tab="${tab.key}" class="btn secondary ${activeTab === tab.key ? 'active-tab' : ''}">${tab.label}</button>`).join('')}
      </div>
    </section>

    <section id="logistic-tab-content"></section>
  `;

  const tabContent = container.querySelector('#logistic-tab-content');
  renderTabContent(tabContent, activeTab, ctx, logisticsEntries);

  container.querySelector('.logistic-tabbar')?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-tab]');
    if (!button) return;
    renderPage(container, button.dataset.tab);
  });
}

function renderKPIs(ctx, entries) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const receptionsToday = entries.filter((item) => item.typeMouvement === 'Réception pièces brutes' && item.dateMouvement === todayIso).length;
  const shipmentsPlanned = entries.filter((item) => item.typeMouvement === 'Expédition client' && item.statut !== 'Expédiée').length;
  const pendingReception = entries.filter((item) => item.typeMouvement === 'Réception prévue' && item.statut !== 'Réception terminée').length;
  const readyToShip = entries.filter((item) => ['Préparée', 'Prête expédition'].includes(item.statut)).length;
  const palettesPreparing = entries.filter((item) => ['À préparer', 'En cours'].includes(item.statutPalette)).length;
  const waitingConditioning = entries.filter((item) => !item.typeConditionnement || item.statutPalette === 'À préparer').length;
  const openIssues = ctx.observations.filter((item) => item.statutTraitement !== 'Clôturée').length;
  const delayedShipments = entries.filter((item) => item.typeMouvement === 'Expédition client' && item.statut === 'Retardée').length;

  return {
    receptionsToday,
    shipmentsPlanned,
    pendingReception,
    readyToShip,
    palettesPreparing,
    waitingConditioning,
    openIssues,
    delayedShipments
  };
}

function renderTabContent(tabContent, tabKey, ctx, entries) {
  if (!tabContent) return;
  const kpis = renderKPIs(ctx, entries);

  if (tabKey === 'global') {
    tabContent.innerHTML = `
      <div class="table-grid logistic-kpi-grid">
        <article class="card kpi"><h4>Réceptions du jour</h4><p class="kpi-count">${kpis.receptionsToday}</p></article>
        <article class="card kpi"><h4>Livraisons prévues</h4><p class="kpi-count">${kpis.shipmentsPlanned}</p></article>
        <article class="card kpi"><h4>Affaires en attente de réception</h4><p class="kpi-count">${kpis.pendingReception}</p></article>
        <article class="card kpi"><h4>Affaires prêtes à expédier</h4><p class="kpi-count">${kpis.readyToShip}</p></article>
        <article class="card kpi"><h4>Palettes en préparation</h4><p class="kpi-count">${kpis.palettesPreparing}</p></article>
        <article class="card kpi"><h4>Pièces en attente de conditionnement</h4><p class="kpi-count">${kpis.waitingConditioning}</p></article>
        <article class="card kpi"><h4>Anomalies ouvertes</h4><p class="kpi-count">${kpis.openIssues}</p></article>
        <article class="card kpi"><h4>Retards expédition</h4><p class="kpi-count">${kpis.delayedShipments}</p></article>
      </div>
      <article class="card">
        <h4>Priorités logistiques</h4>
        <div class="table-grid">
          <article class="card"><strong>Réception urgente</strong><p>Vérifier les arrivées prioritaire haute avant 10:00.</p></article>
          <article class="card"><strong>Livraison client prévue aujourd'hui</strong><p>Confirmer BL et transporteur pour les expéditions du jour.</p></article>
          <article class="card"><strong>Palette à finaliser</strong><p>Contrôler conditionnement des palettes en cours.</p></article>
          <article class="card"><strong>Anomalie à traiter</strong><p>Traiter les écarts de quantité et blocages expédition ouverts.</p></article>
        </div>
      </article>
    `;
    return;
  }

  if (tabKey === 'reception') {
    const receptions = entries.filter((item) => item.typeMouvement.includes('Réception'));
    tabContent.innerHTML = renderReceptionSection(receptions);
    wireReceptionForm(tabContent);
    return;
  }
  if (tabKey === 'shipping') {
    const shipments = entries.filter((item) => item.typeMouvement === 'Expédition client' || item.typeMouvement === 'Mise à disposition produits finis');
    tabContent.innerHTML = renderShippingSection(shipments);
    wireShippingForm(tabContent);
    return;
  }
  if (tabKey === 'packaging') {
    tabContent.innerHTML = renderPackagingSection(entries);
    wirePackagingForm(tabContent);
    return;
  }
  if (tabKey === 'issues') {
    tabContent.innerHTML = renderIssuesSection(ctx.observations, ctx);
    wireIssueForm(tabContent);
    return;
  }

  tabContent.innerHTML = renderHistorySection(entries, ctx);
  wireHistoryFilters(tabContent, entries);
}

function renderReceptionSection(receptions) { return `<article class="card"><h4>Réceptions attendues et enregistrées</h4>${renderLogisticTable(receptions, 'reception')}</article>${receptionForm();}`; }
function renderShippingSection(shipments) { return `<article class="card"><h4>Livraisons / expéditions à suivre</h4>${renderLogisticTable(shipments, 'shipping')}</article>${shippingForm();}`; }
function renderPackagingSection(entries) { return `<article class="card"><h4>Conditionnement & palettes</h4>${renderLogisticTable(entries, 'packaging')}</article>${packagingForm();}`; }

function renderIssuesSection(observations, ctx) {
  const rows = observations.map((item) => {
    const affaire = ctx.affaireMap.get(item.affaireId) || {};
    const reference = ctx.referenceMap.get(item.referenceId) || {};
    return `<tr><td>${safe(item.dateObservation)}</td><td>${safe(item.typeObservation)}</td><td>${safe(item.importance)}</td><td>${safe(affaire.numeroOF || '—')}</td><td>${safe(reference.referencePiece || '—')}</td><td>${safe(item.statutTraitement)}</td><td>${safe(item.commentaire)}</td><td>${safe(item.actionPrevue || '')}</td></tr>`;
  }).join('');

  return `<article class="card"><h4>Anomalies logistiques</h4><div class="table-wrapper"><table><thead><tr><th>Date</th><th>Type anomalie</th><th>Gravité</th><th>N° OF</th><th>Référence</th><th>Statut traitement</th><th>Commentaire</th><th>Action prévue</th></tr></thead><tbody>${rows}</tbody></table></div></article>${issueForm()}`;
}

function renderHistorySection(entries) {
  return `<article class="card"><h4>Historique des mouvements</h4>${historyFilters()}<div id="history-table-zone">${historyTable(entries)}</div></article>`;
}

function renderLogisticTable(rows, mode) {
  const body = rows.map((row) => `<tr>
    <td>${safe(row.dateMouvement)}</td><td>${safe(row.clientNom)}</td><td>${safe(row.numeroCommande || '—')}</td><td>${safe(row.numeroOF)}</td><td>${safe(row.referenceCode)}</td>
    <td>${safe(row.referenceDesignation)}</td><td>${safe(row.quantiteAttendue ?? row.quantiteReference ?? row.quantite)}</td><td>${safe(row.quantiteRecue ?? row.quantiteExpediee ?? row.quantite)}</td>
    <td><span class="status-pill">${safe(row.statut || '')}</span></td><td>${safe(row.transporteur || '')}</td><td>${safe(row.emplacementDepose || row.emplacementPalette || '')}</td>
    <td>${mode === 'reception' ? '<button class="btn secondary">Enregistrer réception</button>' : mode === 'shipping' ? '<button class="btn secondary">Préparer / Expédier</button>' : safe(row.actionAttendue || 'Suivi')}</td>
  </tr>`).join('');
  return `<div class="table-wrapper"><table><thead><tr><th>Date</th><th>Client</th><th>N° commande</th><th>N° OF</th><th>Référence</th><th>Désignation</th><th>Qté attendue</th><th>Qté reçue / expédiée</th><th>Statut</th><th>Transporteur</th><th>Emplacement</th><th>Action</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

const receptionForm = () => `<article class="card"><h4>Enregistrer une réception</h4><form id="logistic-reception-form" class="record-form">${input('dateReception','Date réception','date')}${input('heureReception','Heure réception','time')}${input('clientId','Client (ID)')}${input('numeroCommande','N° commande')}${input('numeroOF','N° OF')}${input('referencePiece','Référence pièce')}${input('designationPiece','Désignation pièce')}${input('quantiteAttendue','Quantité attendue','number')}${input('quantiteRecue','Quantité reçue','number')}${select('etatReception','État à réception',['Conforme','Abîmé','Incomplet','À vérifier'])}${input('transporteur','Transporteur')}${input('numeroBL','Bon de livraison')}${input('emplacementDepose','Emplacement de dépose')}${input('commentaire','Commentaire réception')}<div><button class="btn" type="submit">Enregistrer</button></div></form></article>`;
const shippingForm = () => `<article class="card"><h4>Enregistrer une expédition</h4><form id="logistic-shipping-form" class="record-form">${input('dateExpedition','Date expédition','date')}${input('heureExpedition','Heure expédition','time')}${input('clientId','Client (ID)')}${input('numeroOF','N° OF')}${input('referencePiece','Référence pièce')}${input('designationPiece','Désignation pièce')}${input('quantiteExpediee','Quantité expédiée','number')}${input('typeConditionnement','Type conditionnement')}${input('numeroPalette','N° palette')}${input('nombreColis','Nombre de colis','number')}${input('transporteur','Transporteur')}${input('numeroBL','N° BL')}${select('statutExpedition','Statut expédition',['Préparée','Expédiée','Retardée','Bloquée'])}${input('commentaire','Commentaire expédition')}<div><button class="btn" type="submit">Enregistrer expédition</button></div></form></article>`;
const packagingForm = () => `<article class="card"><h4>Mise à jour conditionnement et palette</h4><form id="logistic-packaging-form" class="record-form">${input('numeroOF','Affaire / OF')}${input('typeConditionnement','Type de conditionnement')}${input('numeroPalette','N° palette')}${input('nombreColis','Nombre de colis','number')}${input('emplacement','Emplacement')}${input('cariste','Cariste / opérateur')}${select('statutPalette','Statut palette',['À préparer','En cours','Terminée','Bloquée'])}${input('commentaire','Commentaire')}<div><button class="btn" type="submit">Enregistrer</button></div></form></article>`;
const issueForm = () => `<article class="card"><h4>Enregistrer une anomalie logistique</h4><form id="logistic-issue-form" class="record-form">${select('typeObservation','Type anomalie',['Quantité reçue différente','Pièces abîmées à réception','BL manquant','Palette non prête','Transporteur en retard','Pièce non localisée','Erreur de référence','Blocage expédition'])}${select('importance','Gravité',['Faible','Moyenne','Critique'])}${input('numeroOF','Affaire / OF')}${input('referencePiece','Référence')}${input('commentaire','Commentaire')}${input('actionPrevue','Action prévue')}${input('responsableTraitement','Responsable traitement')}<div><button class="btn" type="submit">Enregistrer anomalie</button></div></form></article>`;

const historyFilters = () => `<div class="filters" id="history-filters">${input('dateDebut','Date début','date')}${input('dateFin','Date fin','date')}${input('client','Client')}${input('typeMouvement','Type mouvement')}${input('statut','Statut')}${input('numeroOF','N° OF')}${input('reference','Référence')}<div class="form-field"><label>Actions</label><div class="controls"><button type="button" class="btn secondary" id="history-apply">Filtrer</button><button type="button" class="btn" id="history-export">Export CSV / Excel</button></div></div></div>`;

function historyTable(rows) {
  const lines = rows.map((row) => `<tr><td>${safe(row.dateMouvement)}</td><td>${safe(row.typeMouvement)}</td><td>${safe(row.clientNom)}</td><td>${safe(row.numeroOF)}</td><td>${safe(row.referenceCode)}</td><td>${safe(row.quantite || row.quantiteRecue || row.quantiteExpediee || '')}</td><td>${safe(row.statut || '')}</td><td>${safe(row.numeroBL || '')}</td><td>${safe(row.transporteur || '')}</td><td>${safe(row.commentaire || '')}</td></tr>`).join('');
  return `<div class="table-wrapper"><table><thead><tr><th>Date</th><th>Type mouvement</th><th>Client</th><th>N° OF</th><th>Référence</th><th>Quantité</th><th>Statut</th><th>N° BL</th><th>Transporteur</th><th>Commentaire</th></tr></thead><tbody>${lines}</tbody></table></div>`;
}

function input(name, label, type = 'text') { return `<label class="form-field">${label}<input name="${name}" type="${type}" /></label>`; }
function select(name, label, options) { return `<label class="form-field">${label}<select name="${name}">${options.map((o) => `<option value="${o}">${o}</option>`).join('')}</select></label>`; }

function formValues(form) { return Object.fromEntries(new FormData(form).entries()); }

function wireReceptionForm(root) { root.querySelector('#logistic-reception-form')?.addEventListener('submit', (e) => { e.preventDefault(); const v = formValues(e.currentTarget); addRecord('logistique', { dateMouvement: v.dateReception, heureMouvement: v.heureReception, clientId: Number(v.clientId) || null, typeMouvement: 'Réception pièces brutes', quantiteAttendue: Number(v.quantiteAttendue) || 0, quantiteRecue: Number(v.quantiteRecue) || 0, statut: v.etatReception === 'Conforme' ? 'Réception terminée' : 'Anomalie réception', transporteur: v.transporteur, numeroBL: v.numeroBL, emplacementDepose: v.emplacementDepose, commentaire: v.commentaire }); alert('Réception enregistrée.'); }); }
function wireShippingForm(root) { root.querySelector('#logistic-shipping-form')?.addEventListener('submit', (e) => { e.preventDefault(); const v = formValues(e.currentTarget); addRecord('logistique', { dateMouvement: v.dateExpedition, heureMouvement: v.heureExpedition, clientId: Number(v.clientId) || null, typeMouvement: 'Expédition client', quantiteExpediee: Number(v.quantiteExpediee) || 0, typeConditionnement: v.typeConditionnement, numeroPalette: v.numeroPalette, nombreColis: Number(v.nombreColis) || 0, transporteur: v.transporteur, numeroBL: v.numeroBL, statut: v.statutExpedition, commentaire: v.commentaire }); alert('Expédition enregistrée.'); }); }
function wirePackagingForm(root) { root.querySelector('#logistic-packaging-form')?.addEventListener('submit', (e) => { e.preventDefault(); const v = formValues(e.currentTarget); addRecord('logistique', { typeMouvement: 'Mise en palette', statutPalette: v.statutPalette, numeroPalette: v.numeroPalette, typeConditionnement: v.typeConditionnement, nombreColis: Number(v.nombreColis) || 0, emplacementPalette: v.emplacement, caristeAffecte: v.cariste, actionAttendue: 'Suivi palette', commentaire: v.commentaire, dateMouvement: new Date().toISOString().slice(0, 10) }); alert('Palette mise à jour.'); }); }
function wireIssueForm(root) { root.querySelector('#logistic-issue-form')?.addEventListener('submit', (e) => { e.preventDefault(); const v = formValues(e.currentTarget); addRecord('observations', { dateObservation: new Date().toISOString().slice(0, 10), activite: 'Logistique', typeObservation: v.typeObservation, importance: v.importance, commentaire: v.commentaire, actionPrevue: v.actionPrevue, responsableTraitement: v.responsableTraitement, statutTraitement: 'Ouverte' }); alert('Anomalie logistique enregistrée.'); }); }

function wireHistoryFilters(root, entries) {
  const zone = root.querySelector('#history-table-zone');
  const apply = root.querySelector('#history-apply');
  const exportBtn = root.querySelector('#history-export');
  let currentRows = entries;
  apply?.addEventListener('click', () => {
    const filters = formValues(root.querySelector('#history-filters'));
    currentRows = entries.filter((row) => {
      if (filters.dateDebut && row.dateMouvement < filters.dateDebut) return false;
      if (filters.dateFin && row.dateMouvement > filters.dateFin) return false;
      if (filters.client && !row.clientNom.toLowerCase().includes(filters.client.toLowerCase())) return false;
      if (filters.typeMouvement && !row.typeMouvement.toLowerCase().includes(filters.typeMouvement.toLowerCase())) return false;
      if (filters.statut && !String(row.statut || '').toLowerCase().includes(filters.statut.toLowerCase())) return false;
      if (filters.numeroOF && !row.numeroOF.toLowerCase().includes(filters.numeroOF.toLowerCase())) return false;
      if (filters.reference && !row.referenceCode.toLowerCase().includes(filters.reference.toLowerCase())) return false;
      return true;
    });
    zone.innerHTML = historyTable(currentRows);
  });

  exportBtn?.addEventListener('click', () => {
    const exportRows = currentRows.map((row) => ({
      dateMouvement: row.dateMouvement,
      typeMouvement: row.typeMouvement,
      client: row.clientNom,
      numeroOF: row.numeroOF,
      reference: row.referenceCode,
      quantite: row.quantite || row.quantiteRecue || row.quantiteExpediee || '',
      statut: row.statut || '',
      numeroBL: row.numeroBL || '',
      transporteur: row.transporteur || '',
      commentaire: row.commentaire || ''
    }));
    exportTableToCSV('logistique_historique', exportRows);
  });
}

export function renderLogistiquePage(container) {
  renderPage(container, 'global');
}
