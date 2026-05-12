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
      clientNom: client.nom || 'Client non défini',
      numeroCommande: commande.numeroCommande || '—',
      numeroOF: item.numeroOF || affaire.numeroOF || '',
      referencePiece: reference.referencePiece || '—',
      designationPiece: reference.designationPiece || '—',
      quantiteAttendue: Number(item.quantiteAttendue ?? reference.quantite ?? item.quantite ?? 0),
      quantiteRecue: Number(item.quantiteRecue ?? 0),
      statut: item.statut || 'En attente',
      transporteur: item.transporteur || '—',
      emplacementDepose: item.emplacementDepose || 'Zone réception',
      statutRattachementOF: item.numeroOF || affaire.numeroOF ? 'OF rattaché' : (item.statut?.includes('vérifier') ? 'OF à vérifier' : 'OF à créer')
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

function render(container, selectedId = null, onlyWithoutOF = false, showOFAlert = false) {
  const rows = buildReceptionRows();
  const filteredRows = onlyWithoutOF ? rows.filter((row) => !row.numeroOF) : rows;
  const kpi = computeKpis(filteredRows);
  const selected = rows.find((row) => row.id === selectedId) || null;

  container.innerHTML = `
    <article class="card">
      <h3>Logistique</h3>
      <p>Réception, conditionnement, mise en palette et expédition des pièces.</p>
    </article>

    <section class="table-grid">
      <article class="card kpi">
        <h4>Réception</h4>
        <p>Enregistrements des arrivées pièces et contrôles de conformité.</p>
      </article>
      <article class="card kpi">
        <h4>Livraison / Expédition</h4>
        <p>Section en attente de développement.</p>
      </article>
      <article class="card kpi">
        <h4>Conditionnement & palettes</h4>
        <p>Section en attente de développement.</p>
      </article>
    </section>

    <section class="card">
      <h4>Réception des pièces et marchandises</h4>
      <p>Enregistrement des arrivées, contrôle de conformité et mise à disposition atelier.</p>
      ${showOFAlert ? '<p class="status-error">OF à rattacher</p>' : ''}

      <div class="table-grid logistic-kpi-grid">
        <article class="card kpi"><h4>Réceptions prévues aujourd’hui</h4><p class="kpi-count">${kpi.prevuesJour}</p></article>
        <article class="card kpi"><h4>Réceptions enregistrées</h4><p class="kpi-count">${kpi.enregistrees}</p></article>
        <article class="card kpi"><h4>Réceptions en attente</h4><p class="kpi-count">${kpi.enAttente}</p></article>
        <article class="card kpi"><h4>Réceptions avec anomalie</h4><p class="kpi-count">${kpi.anomalies}</p></article>
        <article class="card kpi"><h4>Quantité attendue</h4><p class="kpi-count">${kpi.qteAttendue}</p></article>
        <article class="card kpi"><h4>Quantité reçue</h4><p class="kpi-count">${kpi.qteRecue}</p></article>
      </div>

      <div class="controls">
        <button type="button" class="btn secondary ${onlyWithoutOF ? 'active-tab' : ''}" id="toggle-without-of">Réceptions sans OF</button>
      </div>
      <div class="logistic-reception-layout">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date prévue</th><th>Client</th><th>N° commande</th><th>N° OF</th><th>Statut rattachement OF</th><th>Référence</th><th>Désignation</th><th>Qté attendue</th><th>Statut réception</th><th>Transporteur</th><th>Emplacement prévu</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRows.map((row) => `<tr>
                <td>${safe(row.dateMouvement)}</td><td>${safe(row.clientNom)}</td><td>${safe(row.numeroCommande)}</td><td>${safe(row.numeroOF || '—')}</td><td><span class="status-pill">${safe(row.statutRattachementOF)}</span></td><td>${safe(row.referencePiece)}</td>
                <td>${safe(row.designationPiece)}</td><td>${safe(row.quantiteAttendue)}</td><td><span class="status-pill">${safe(row.statut)}</span></td><td>${safe(row.transporteur)}</td><td>${safe(row.emplacementDepose)}</td>
                <td><button type="button" class="btn secondary" data-open-form="${row.id}">Enregistrer réception</button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <article class="card reception-form-card">
          <h4>Enregistrer une réception</h4>
          <form id="reception-form" class="record-form">
            <input type="hidden" name="sourceId" value="${selected?.id || ''}" />
            <label class="form-field">Date réception<input required type="date" name="dateReception" value="${safe(selected?.dateMouvement || new Date().toISOString().slice(0, 10))}" /></label>
            <label class="form-field">Heure réception<input required type="time" name="heureReception" value="08:00" /></label>
            <label class="form-field">Client<input name="client" value="${safe(selected?.clientNom || '')}" /></label>
            <label class="form-field">N° commande<input name="numeroCommande" value="${safe(selected?.numeroCommande || '')}" /></label>
            <label class="form-field">N° OF (optionnel)<input name="numeroOF" value="${safe(selected?.numeroOF || '')}" /></label>
            <label class="form-field">Référence pièce<input name="referencePiece" value="${safe(selected?.referencePiece || '')}" /></label>
            <label class="form-field">Désignation pièce<input name="designationPiece" value="${safe(selected?.designationPiece || '')}" /></label>
            <label class="form-field">Quantité attendue<input required type="number" name="quantiteAttendue" value="${safe(selected?.quantiteAttendue || 0)}" /></label>
            <label class="form-field">Quantité reçue<input required type="number" name="quantiteRecue" value="${safe(selected?.quantiteRecue || 0)}" /></label>
            <label class="form-field">État à réception
              <select name="etatReception">
                <option>Conforme</option><option>Abîmé</option><option>Incomplet</option><option>À vérifier</option>
              </select>
            </label>
            <label class="form-field">Transporteur<input name="transporteur" value="${safe(selected?.transporteur || '')}" /></label>
            <label class="form-field">N° BL fournisseur/client<input name="numeroBL" value="${safe(selected?.numeroBL || '')}" /></label>
            <label class="form-field">Emplacement de dépose<input name="emplacementDepose" value="${safe(selected?.emplacementDepose || '')}" /></label>
            <label class="form-field">Commentaire réception<input name="commentaireReception" value="" /></label>
            <div class="controls">
              <button type="submit" class="btn">Enregistrer</button>
              <button type="button" class="btn secondary" id="cancel-reception">Annuler</button>
            </div>
          </form>
        </article>
      </div>
    </section>
  `;

  container.querySelectorAll('[data-open-form]').forEach((button) => {
    button.addEventListener('click', () => render(container, Number(button.dataset.openForm), onlyWithoutOF));
  });

  container.querySelector('#cancel-reception')?.addEventListener('click', () => render(container, null, onlyWithoutOF));
  container.querySelector('#toggle-without-of')?.addEventListener('click', () => render(container, null, !onlyWithoutOF));

  container.querySelector('#reception-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const sourceId = Number(data.sourceId || 0);
    const state = receptionStateFromCondition(data.etatReception);

    const payload = {
      dateMouvement: data.dateReception,
      heureMouvement: data.heureReception,
      typeMouvement: 'Réception pièces brutes',
      quantiteAttendue: Number(data.quantiteAttendue) || 0,
      quantiteRecue: Number(data.quantiteRecue) || 0,
      statut: data.numeroOF ? state.statut : 'OF à créer / à rattacher',
      numeroOF: data.numeroOF,
      transporteur: data.transporteur,
      numeroBL: data.numeroBL,
      emplacementDepose: data.emplacementDepose,
      commentaire: data.commentaireReception
    };

    if (sourceId) {
      updateRecord('logistique', sourceId, payload);
    } else {
      addRecord('logistique', payload);
    }

    if (state.importance) {
      addRecord('observations', {
        dateObservation: data.dateReception,
        activite: 'Logistique',
        typeObservation: 'Anomalie',
        importance: state.importance,
        commentaire: data.commentaireReception || `Réception ${data.referencePiece || ''}`,
        statutTraitement: 'Ouvert',
        actionPrevue: 'Contrôler la réception et statuer avec la qualité',
        responsableTraitement: 'Responsable logistique'
      });
    }

    render(container, null, onlyWithoutOF, !data.numeroOF);
  });
}

export function renderLogistiquePage(container) {
  render(container);
}
