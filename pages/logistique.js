import { addRecord, getTable, updateRecord } from '../data/databaseService.js';

const RECEPTION_TYPES = ['Réception prévue', 'Réception pièces brutes', 'Réception matière'];

function safe(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function buildReceptionRows() {
  const clients = getTable('clients');
  const affaires = getTable('affaires');
  const commandes = getTable('commandes');
  const references = getTable('referencesPieces');
  const logistique = getTable('logistique').filter((item) => RECEPTION_TYPES.includes(item.typeMouvement));

  const clientMap = new Map(clients.map((item) => [item.id, item]));
  const affaireMap = new Map(affaires.map((item) => [item.id, item]));
  const commandeMap = new Map(commandes.map((item) => [item.id, item]));
  const referenceMap = new Map(references.map((item) => [item.id, item]));

  return logistique.map((item) => {
    const affaire = affaireMap.get(item.affaireId) || {};
    const commande = commandeMap.get(affaire.commandeId) || {};
    const client = clientMap.get(item.clientId || affaire.clientId) || {};
    const reference = referenceMap.get(item.referenceId) || {};

    return {
      ...item,
      clientNom: item.clientNom || client.nom || 'Client non défini',
      numeroCommande: item.numeroCommande || commande.numeroCommande || '—',
      numeroOF: item.numeroOF || affaire.numeroOF || '',
      referencePiece: item.referencePiece || reference.referencePiece || '—',
      designationPiece: item.designationPiece || reference.designationPiece || '—',
      quantiteAttendue: Number(item.quantiteAttendue ?? reference.quantite ?? item.quantite ?? 0),
      quantiteRecue: Number(item.quantiteRecue ?? 0),
      statut: item.statut || 'En attente',
      transporteur: item.transporteur || '—',
      emplacementDepose: item.emplacementDepose || 'Zone réception'
    };
  });
}

function computeKpis(rows) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    prevuesJour: rows.filter((row) => row.dateMouvement === today && row.typeMouvement === 'Réception prévue').length,
    enregistrees: rows.filter((row) => row.typeMouvement === 'Réception pièces brutes').length,
    enAttente: rows.filter((row) => ['En attente', 'Prévue'].includes(row.statut) || row.typeMouvement === 'Réception prévue').length,
    anomalies: rows.filter((row) => ['Anomalie réception', 'À vérifier', 'Incomplet'].includes(row.statut)).length,
    qteAttendue: rows.reduce((sum, row) => sum + (Number(row.quantiteAttendue) || 0), 0),
    qteRecue: rows.reduce((sum, row) => sum + (Number(row.quantiteRecue) || 0), 0)
  };
}

function receptionStateFromCondition(etat) {
  if (etat === 'Conforme') return { statut: 'Réception terminée', importance: '' };
  if (etat === 'Abîmé') return { statut: 'Anomalie réception', importance: 'Critique' };
  if (etat === 'Incomplet') return { statut: 'Anomalie réception', importance: 'Moyenne' };
  return { statut: 'À vérifier', importance: 'Moyenne' };
}

function kpiFilterRows(rows, key) {
  const today = new Date().toISOString().slice(0, 10);
  if (key === 'prevuesJour') return rows.filter((row) => row.dateMouvement === today && row.typeMouvement === 'Réception prévue');
  if (key === 'enregistrees') return rows.filter((row) => row.typeMouvement === 'Réception pièces brutes');
  if (key === 'enAttente') return rows.filter((row) => ['En attente', 'Prévue'].includes(row.statut) || row.typeMouvement === 'Réception prévue');
  if (key === 'anomalies') return rows.filter((row) => ['Anomalie réception', 'À vérifier', 'Incomplet'].includes(row.statut));
  if (key === 'qteAttendue') return rows.filter((row) => Number(row.quantiteAttendue) > 0);
  if (key === 'qteRecue') return rows.filter((row) => Number(row.quantiteRecue) > 0);
  return rows;
}

function kpiTitle(key) {
  return {
    prevuesJour: 'Réceptions prévues aujourd’hui',
    enregistrees: 'Réceptions enregistrées',
    enAttente: 'Réceptions en attente',
    anomalies: 'Réceptions avec anomalie',
    qteAttendue: 'Réceptions avec quantité attendue',
    qteRecue: 'Réceptions avec quantité reçue'
  }[key] || 'Détail réception';
}

function referenceRowTemplate(index, ref = {}) {
  return `<div class="reference-row" data-ref-index="${index}">
    <label class="form-field">Référence pièce<input name="referencePiece_${index}" value="${safe(ref.referencePiece || '')}" /></label>
    <label class="form-field">Désignation pièce<input name="designationPiece_${index}" value="${safe(ref.designationPiece || '')}" /></label>
    <label class="form-field">Quantité attendue<input type="number" name="quantiteAttendue_${index}" value="${safe(ref.quantiteAttendue ?? 0)}" /></label>
    <label class="form-field">Quantité reçue<input type="number" name="quantiteRecue_${index}" value="${safe(ref.quantiteRecue ?? 0)}" /></label>
    <label class="form-field">État à réception
      <select name="etatReception_${index}">
        ${['Conforme', 'Abîmé', 'Incomplet', 'À vérifier'].map((s) => `<option ${ref.etatReception === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </label>
  </div>`;
}

function render(container, state = {}) {
  const {
    selectedId = null,
    onlyWithoutOF = false,
    showOFAlert = false,
    detailKey = null,
    detailEditId = null,
    extraRefs = 0
  } = state;

  const rows = buildReceptionRows();
  const filteredRows = onlyWithoutOF ? rows.filter((row) => !row.numeroOF) : rows;
  const kpi = computeKpis(filteredRows);
  const selected = rows.find((row) => row.id === selectedId) || null;

  const defaultRefs = selected ? [{
    referencePiece: selected.referencePiece,
    designationPiece: selected.designationPiece,
    quantiteAttendue: selected.quantiteAttendue,
    quantiteRecue: selected.quantiteRecue,
    etatReception: 'Conforme'
  }] : [{ quantiteAttendue: 0, quantiteRecue: 0, etatReception: 'Conforme' }];

  const refRows = [...defaultRefs, ...Array.from({ length: extraRefs }, () => ({ quantiteAttendue: 0, quantiteRecue: 0, etatReception: 'Conforme' }))];

  const detailRows = detailKey ? kpiFilterRows(filteredRows, detailKey) : [];
  const detailEdit = rows.find((row) => row.id === detailEditId) || null;

  container.innerHTML = `
    <article class="card logistic-header-card">
      <div>
        <h3>Logistique</h3>
        <p>Réception, conditionnement, mise en palette et expédition des pièces</p>
      </div>
    </article>

    <section class="table-grid">
      <article class="card kpi"><h4>Réception</h4><p>Enregistrements des arrivées pièces et contrôles de conformité.</p></article>
      <article class="card kpi"><h4>Livraison / Expédition</h4><p>Section en attente de développement.</p></article>
      <article class="card kpi"><h4>Conditionnement & palettes</h4><p>Section en attente de développement.</p></article>
    </section>

    <section class="card">
      <h4>Réception des pièces et marchandises</h4>
      <p>Enregistrement des arrivées, contrôle de conformité et mise à disposition atelier.</p>
      ${showOFAlert ? '<p class="status-error">OF à rattacher</p>' : ''}

      <div class="table-grid logistic-kpi-grid">
        <button class="card kpi kpi-btn" data-kpi="prevuesJour" type="button"><h4>Réceptions prévues aujourd’hui</h4><p class="kpi-count">${kpi.prevuesJour}</p></button>
        <button class="card kpi kpi-btn" data-kpi="enregistrees" type="button"><h4>Réceptions enregistrées</h4><p class="kpi-count">${kpi.enregistrees}</p></button>
        <button class="card kpi kpi-btn" data-kpi="enAttente" type="button"><h4>Réceptions en attente</h4><p class="kpi-count">${kpi.enAttente}</p></button>
        <button class="card kpi kpi-btn" data-kpi="anomalies" type="button"><h4>Réceptions avec anomalie</h4><p class="kpi-count">${kpi.anomalies}</p></button>
        <button class="card kpi kpi-btn" data-kpi="qteAttendue" type="button"><h4>Quantité attendue</h4><p class="kpi-count">${kpi.qteAttendue}</p></button>
        <button class="card kpi kpi-btn" data-kpi="qteRecue" type="button"><h4>Quantité reçue</h4><p class="kpi-count">${kpi.qteRecue}</p></button>
      </div>

      ${detailKey ? `
      <article class="card">
        <div class="controls"><button type="button" class="btn secondary" id="back-reception-view">Retour à la vue Réception</button></div>
        <h4>${kpiTitle(detailKey)}</h4>
        <p>${detailRows.length} élément(s)</p>
        <div class="table-wrapper"><table><thead><tr><th>Date prévue</th><th>Client</th><th>N° commande</th><th>N° OF</th><th>Référence</th><th>Désignation</th><th>Qté attendue</th><th>Qté reçue</th><th>Statut</th><th>Transporteur</th><th>Emplacement</th><th>Action</th></tr></thead>
        <tbody>${detailRows.map((row) => `<tr><td>${safe(row.dateMouvement)}</td><td>${safe(row.clientNom)}</td><td>${safe(row.numeroCommande)}</td><td>${safe(row.numeroOF || '—')}</td><td>${safe(row.referencePiece)}</td><td>${safe(row.designationPiece)}</td><td>${safe(row.quantiteAttendue)}</td><td>${safe(row.quantiteRecue)}</td><td><span class="status-pill">${safe(row.statut)}</span></td><td>${safe(row.transporteur)}</td><td>${safe(row.emplacementDepose)}</td><td><button class="btn secondary" data-detail-edit="${row.id}" type="button">Modifier</button></td></tr>`).join('')}</tbody></table></div>
      </article>
      ${detailEdit ? `<article class="card"><h4>Modifier une réception</h4>${renderDetailEditForm(detailEdit)}</article>` : ''}
      ` : `
      <div class="controls"><button type="button" class="btn secondary ${onlyWithoutOF ? 'active-tab' : ''}" id="toggle-without-of">Réceptions sans OF</button></div>
      <div class="logistic-reception-layout">
        <div class="table-wrapper">
          <table><thead><tr><th>Date prévue</th><th>Client</th><th>N° commande</th><th>N° OF</th><th>Référence</th><th>Désignation</th><th>Qté attendue</th><th>Statut réception</th><th>Transporteur</th><th>Emplacement prévu</th><th>Action</th></tr></thead>
          <tbody>${filteredRows.map((row) => `<tr><td>${safe(row.dateMouvement)}</td><td>${safe(row.clientNom)}</td><td>${safe(row.numeroCommande)}</td><td>${safe(row.numeroOF || '—')}</td><td>${safe(row.referencePiece)}</td><td>${safe(row.designationPiece)}</td><td>${safe(row.quantiteAttendue)}</td><td><span class="status-pill">${safe(row.statut)}</span></td><td>${safe(row.transporteur)}</td><td>${safe(row.emplacementDepose)}</td><td><button type="button" class="btn secondary" data-open-form="${row.id}">Enregistrer réception</button></td></tr>`).join('')}</tbody></table>
        </div>

        <article class="card reception-form-card">
          <h4>Enregistrer une réception</h4>
          <form id="reception-form">
            <input type="hidden" name="sourceId" value="${selected?.id || ''}" />
            <div class="record-form">
              <h5 class="full-row">Informations générales réception</h5>
              <label class="form-field">Date réception<input required type="date" name="dateReception" value="${safe(selected?.dateMouvement || new Date().toISOString().slice(0, 10))}" /></label>
              <label class="form-field">Heure réception<input required type="time" name="heureReception" value="08:00" /></label>
              <label class="form-field">Client<input name="client" value="${safe(selected?.clientNom || '')}" /></label>
              <label class="form-field">N° commande<input name="numeroCommande" value="${safe(selected?.numeroCommande || '')}" /></label>
              <label class="form-field">N° OF<input name="numeroOF" value="${safe(selected?.numeroOF || '')}" /></label>
              <label class="form-field">Transporteur<input name="transporteur" value="${safe(selected?.transporteur || '')}" /></label>
              <label class="form-field">N° BL fournisseur/client<input name="numeroBL" value="${safe(selected?.numeroBL || '')}" /></label>
              <label class="form-field">Emplacement de dépose<input name="emplacementDepose" value="${safe(selected?.emplacementDepose || '')}" /></label>
              <label class="form-field full-row">Commentaire réception<input name="commentaireReception" value="" /></label>
            </div>
            <div class="record-form">
              <h5 class="full-row">Références reçues</h5>
              <div id="reference-rows" class="full-row">${refRows.map((r, i) => referenceRowTemplate(i, r)).join('')}</div>
              <div class="controls full-row"><button type="button" class="btn secondary" id="add-reference">+ Ajouter une référence</button></div>
            </div>
            <div class="controls">
              <button type="submit" class="btn">Enregistrer</button>
              <button type="button" class="btn secondary" id="cancel-reception">Annuler</button>
            </div>
          </form>
        </article>
      </div>
      `}
    </section>
  `;

  container.querySelectorAll('.kpi-btn').forEach((button) => button.addEventListener('click', () => render(container, { ...state, detailKey: button.dataset.kpi, detailEditId: null })));

  container.querySelector('#back-reception-view')?.addEventListener('click', () => render(container, { ...state, detailKey: null, detailEditId: null }));
  container.querySelectorAll('[data-detail-edit]').forEach((button) => button.addEventListener('click', () => render(container, { ...state, detailEditId: Number(button.dataset.detailEdit) })));

  container.querySelector('#detail-edit-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    updateRecord('logistique', Number(data.id), {
      dateMouvement: data.dateReception,
      numeroOF: data.numeroOF,
      numeroCommande: data.numeroCommande,
      referencePiece: data.referencePiece,
      designationPiece: data.designationPiece,
      quantiteAttendue: Number(data.quantiteAttendue) || 0,
      quantiteRecue: Number(data.quantiteRecue) || 0,
      statut: data.statut,
      transporteur: data.transporteur,
      emplacementDepose: data.emplacementDepose
    });
    render(container, { ...state });
  });

  container.querySelectorAll('[data-open-form]').forEach((button) => {
    button.addEventListener('click', () => render(container, { ...state, selectedId: Number(button.dataset.openForm) }));
  });

  container.querySelector('#cancel-reception')?.addEventListener('click', () => render(container, { ...state, selectedId: null, showOFAlert: false }));
  container.querySelector('#toggle-without-of')?.addEventListener('click', () => render(container, { ...state, onlyWithoutOF: !onlyWithoutOF }));
  container.querySelector('#add-reference')?.addEventListener('click', () => render(container, { ...state, extraRefs: extraRefs + 1 }));

  container.querySelector('#reception-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const sourceId = Number(data.sourceId || 0);

    const references = Object.keys(data)
      .filter((key) => key.startsWith('referencePiece_'))
      .map((key) => key.split('_')[1])
      .map((i) => ({
        referencePiece: data[`referencePiece_${i}`],
        designationPiece: data[`designationPiece_${i}`],
        quantiteAttendue: Number(data[`quantiteAttendue_${i}`]) || 0,
        quantiteRecue: Number(data[`quantiteRecue_${i}`]) || 0,
        etatReception: data[`etatReception_${i}`] || 'Conforme'
      }))
      .filter((item) => item.referencePiece || item.designationPiece || item.quantiteAttendue || item.quantiteRecue);

    if (!references.length) return;

    references.forEach((ref, index) => {
      const stateRef = receptionStateFromCondition(ref.etatReception);
      const payload = {
        dateMouvement: data.dateReception,
        heureMouvement: data.heureReception,
        typeMouvement: 'Réception pièces brutes',
        numeroCommande: data.numeroCommande,
        numeroOF: data.numeroOF,
        clientNom: data.client,
        referencePiece: ref.referencePiece,
        designationPiece: ref.designationPiece,
        quantiteAttendue: ref.quantiteAttendue,
        quantiteRecue: ref.quantiteRecue,
        statut: data.numeroOF ? stateRef.statut : 'OF à créer / à rattacher',
        transporteur: data.transporteur,
        numeroBL: data.numeroBL,
        emplacementDepose: data.emplacementDepose,
        commentaire: data.commentaireReception,
        referencesReception: references
      };

      if (sourceId && index === 0) updateRecord('logistique', sourceId, payload);
      else addRecord('logistique', payload);

      if (stateRef.importance) {
        addRecord('observations', {
          dateObservation: data.dateReception,
          activite: 'Logistique',
          typeObservation: 'Anomalie',
          importance: stateRef.importance,
          commentaire: data.commentaireReception || `Réception ${ref.referencePiece || ''}`,
          statutTraitement: 'Ouvert',
          actionPrevue: 'Contrôler la réception et statuer avec la qualité',
          responsableTraitement: 'Responsable logistique'
        });
      }
    });

    render(container, { ...state, selectedId: null, extraRefs: 0, showOFAlert: !data.numeroOF });
  });
}

function renderDetailEditForm(item) {
  return `<form id="detail-edit-form" class="record-form">
    <input type="hidden" name="id" value="${safe(item.id)}" />
    <label class="form-field">Date réception<input name="dateReception" type="date" value="${safe(item.dateMouvement)}" /></label>
    <label class="form-field">N° commande<input name="numeroCommande" value="${safe(item.numeroCommande || '')}" /></label>
    <label class="form-field">N° OF<input name="numeroOF" value="${safe(item.numeroOF || '')}" /></label>
    <label class="form-field">Référence pièce<input name="referencePiece" value="${safe(item.referencePiece || '')}" /></label>
    <label class="form-field">Désignation pièce<input name="designationPiece" value="${safe(item.designationPiece || '')}" /></label>
    <label class="form-field">Quantité attendue<input type="number" name="quantiteAttendue" value="${safe(item.quantiteAttendue)}" /></label>
    <label class="form-field">Quantité reçue<input type="number" name="quantiteRecue" value="${safe(item.quantiteRecue)}" /></label>
    <label class="form-field">Statut<input name="statut" value="${safe(item.statut || '')}" /></label>
    <label class="form-field">Transporteur<input name="transporteur" value="${safe(item.transporteur || '')}" /></label>
    <label class="form-field">Emplacement<input name="emplacementDepose" value="${safe(item.emplacementDepose || '')}" /></label>
    <div><button type="submit" class="btn">Enregistrer la modification</button></div>
  </form>`;
}

export function renderLogistiquePage(container) {
  render(container);
}
