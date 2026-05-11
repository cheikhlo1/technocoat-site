import {
  addRecord,
  deleteRecord,
  exportTableToCSV,
  filterRecords,
  getTable,
  loadDatabase,
  resetDatabase,
  updateRecord
} from '../data/databaseService.js';

const tableConfig = {
  clients: { label: 'Clients', hint: 'Clients actifs, prospects et historiques' },
  commandes: { label: 'Commandes', hint: 'Commandes planifiées et suivies' },
  affaires: { label: 'Affaires / OF', hint: 'Affaires liées à la production' },
  referencesPieces: { label: 'Références pièces', hint: 'Pièces suivies par affaire' },
  gammes: { label: 'Gammes', hint: 'Standards et modes opératoires' },
  etapesGamme: { label: 'Étapes de gamme', hint: 'Étapes prévues par activité' },
  taches: { label: 'Tâches', hint: 'Affectations opérateurs' },
  personnel: { label: 'Personnel', hint: 'Utilisateurs et rôles' },
  stocks: { label: 'Stocks', hint: 'Articles et seuils minimums' },
  mouvementsStock: { label: 'Mouvements stock', hint: 'Entrées, sorties et corrections' },
  qualitePieces: { label: 'Qualité pièces', hint: 'Contrôles et conformité' },
  controlesEquipements: { label: 'Contrôles équipements', hint: 'Bains, process et équipements' },
  logistique: { label: 'Logistique', hint: 'Réceptions, BL et expéditions' },
  observations: { label: 'Observations / REX', hint: 'Retours terrain et anomalies' }
};

const filterLabels = {
  dateStart: 'Date de début',
  dateEnd: 'Date de fin',
  client: 'Client',
  statut: 'Statut',
  activite: 'Activité',
  priorite: 'Priorité',
  affaire: 'Affaire / OF',
  reference: 'Référence'
};

let activeTable = 'clients';
let activeFilters = {};
let activeSearch = '';

const formatLines = (count) => `${count} ${count > 1 ? 'lignes' : 'ligne'}`;

function getColumns(tableName) {
  const rows = getTable(tableName);
  return rows.length ? Object.keys(rows[0]) : ['id'];
}

function normalize(value) {
  return String(value ?? '').toLowerCase();
}

function getMatchingField(columns, candidates) {
  return columns.find((column) => candidates.some((token) => normalize(column).includes(token)));
}

function resolveFilterFields(tableName) {
  const columns = getColumns(tableName);
  return {
    date: getMatchingField(columns, ['date']),
    client: getMatchingField(columns, ['client']),
    statut: getMatchingField(columns, ['statut', 'status']),
    activite: getMatchingField(columns, ['activite', 'activité', 'atelier', 'poste', 'mouvement']),
    priorite: getMatchingField(columns, ['priorite', 'priorité']),
    affaire: getMatchingField(columns, ['affaire', 'code', 'commande']),
    reference: getMatchingField(columns, ['reference', 'référence'])
  };
}

function getFilteredData(tableName) {
  const fields = resolveFilterFields(tableName);
  let rows = filterRecords(tableName, {});

  if (activeFilters.client && fields.client) rows = rows.filter((row) => normalize(row[fields.client]).includes(normalize(activeFilters.client)));
  if (activeFilters.statut && fields.statut) rows = rows.filter((row) => normalize(row[fields.statut]).includes(normalize(activeFilters.statut)));
  if (activeFilters.activite && fields.activite) rows = rows.filter((row) => normalize(row[fields.activite]).includes(normalize(activeFilters.activite)));
  if (activeFilters.priorite && fields.priorite) rows = rows.filter((row) => normalize(row[fields.priorite]).includes(normalize(activeFilters.priorite)));
  if (activeFilters.affaire && fields.affaire) rows = rows.filter((row) => normalize(row[fields.affaire]).includes(normalize(activeFilters.affaire)));
  if (activeFilters.reference && fields.reference) rows = rows.filter((row) => normalize(row[fields.reference]).includes(normalize(activeFilters.reference)));

  if (fields.date && (activeFilters.dateStart || activeFilters.dateEnd)) {
    rows = rows.filter((row) => {
      const dateValue = row[fields.date];
      if (!dateValue) return false;
      const rowDate = new Date(dateValue);
      if (Number.isNaN(rowDate.getTime())) return false;
      if (activeFilters.dateStart && rowDate < new Date(activeFilters.dateStart)) return false;
      if (activeFilters.dateEnd && rowDate > new Date(activeFilters.dateEnd)) return false;
      return true;
    });
  }

  if (activeSearch.trim()) {
    const search = normalize(activeSearch);
    rows = rows.filter((row) => Object.values(row).some((value) => normalize(value).includes(search)));
  }

  return rows;
}

function renderSummaryCards() {
  return Object.entries(tableConfig)
    .map(([tableName, config]) => {
      const count = getTable(tableName).length;
      return `<button type="button" class="card kpi shortcut-card ${tableName === activeTable ? 'active' : ''}" data-shortcut="${tableName}"><h3>${config.label}</h3><p class="kpi-count">${formatLines(count)}</p><p class="kpi-hint">${config.hint}</p></button>`;
    })
    .join('');
}

function renderFilterFields(tableName) {
  const fields = resolveFilterFields(tableName);
  const configs = [
    { key: 'dateStart', type: 'date', enabled: Boolean(fields.date) },
    { key: 'dateEnd', type: 'date', enabled: Boolean(fields.date) },
    { key: 'client', type: 'text', enabled: Boolean(fields.client) },
    { key: 'statut', type: 'text', enabled: Boolean(fields.statut) },
    { key: 'activite', type: 'text', enabled: Boolean(fields.activite) },
    { key: 'priorite', type: 'text', enabled: Boolean(fields.priorite) },
    { key: 'affaire', type: 'text', enabled: Boolean(fields.affaire) },
    { key: 'reference', type: 'text', enabled: Boolean(fields.reference) }
  ];

  return configs
    .filter((config) => config.enabled)
    .map((config) => `<label class="filter-item">${filterLabels[config.key]}<input data-filter="${config.key}" type="${config.type}" value="${activeFilters[config.key] || ''}" /></label>`)
    .join('');
}

function renderTable(tableName, rows) {
  const columns = getColumns(tableName);
  if (!rows.length) return '<p>Aucune donnée disponible pour cette table avec les filtres en cours.</p>';

  const headers = columns.map((column) => `<th>${column}</th>`).join('');
  const body = rows
    .map((row) => `<tr>${columns.map((column) => `<td>${row[column] ?? ''}</td>`).join('')}<td class="actions-cell"><button class="btn secondary row-edit" data-id="${row.id}">Modifier</button><button class="btn warning row-delete" data-id="${row.id}">Supprimer</button></td></tr>`)
    .join('');

  return `<div class="table-wrapper"><table><thead><tr>${headers}<th>Actions</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

function buildForm(tableName, row = {}) {
  const columns = getColumns(tableName).filter((column) => column !== 'id');
  if (!columns.length) return '<p>Aucune colonne éditable disponible.</p>';
  return columns
    .map((column) => {
      const isDate = normalize(column).includes('date');
      return `<label class="form-field">${column}<input type="${isDate ? 'date' : 'text'}" name="${column}" value="${row[column] ?? ''}" /></label>`;
    })
    .join('');
}

function exportCurrentTable(tableName, rows) {
  const today = new Date().toISOString().slice(0, 10);
  const content = exportTableToCSV(tableName, rows);
  if (!content) return;
  const link = document.querySelector('a[download]');
  if (link) link.setAttribute('download', `export_${tableName}_${today}.csv`);
}

export function renderDatabasePage(container) {
  loadDatabase();

  function refreshView() {
    const filteredRows = getFilteredData(activeTable);
    container.innerHTML = `
      <section class="table-grid">${renderSummaryCards()}</section>

      <article class="card">
        <div class="table-selector">${Object.entries(tableConfig)
          .map(([key, config]) => `<button type="button" class="btn ${key === activeTable ? '' : 'secondary'} table-tab" data-table="${key}">${config.label}</button>`)
          .join('')}</div>
      </article>

      <article class="card">
        <div class="controls">
          <label class="search-box">Recherche globale<input id="global-search" type="text" value="${activeSearch}" placeholder="Rechercher dans la table active" /></label>
          <button id="add-line" class="btn" type="button">Ajouter une ligne</button>
          <button id="export-csv" class="btn secondary" type="button">Export CSV / Excel</button>
          <button id="reset-db" class="btn warning" type="button">Réinitialiser les données fictives</button>
        </div>
        <div class="filters">${renderFilterFields(activeTable) || '<p>Pas de filtres disponibles pour cette table.</p>'}</div>
      </article>

      <article class="card" id="table-section">
        <h3>${tableConfig[activeTable].label}</h3>
        <p>${formatLines(filteredRows.length)} affichée(s) sur ${formatLines(getTable(activeTable).length)}</p>
        ${renderTable(activeTable, filteredRows)}
      </article>

      <article class="card" id="form-card" hidden>
        <h3 id="form-title">Ajouter une ligne</h3>
        <form id="record-form" class="record-form"></form>
        <div class="controls">
          <button class="btn" type="submit" form="record-form">Enregistrer</button>
          <button id="cancel-form" class="btn secondary" type="button">Annuler</button>
        </div>
      </article>
    `;

    container.querySelectorAll('.table-tab').forEach((button) => {
      button.addEventListener('click', () => {
        activeTable = button.dataset.table;
        activeFilters = {};
        activeSearch = '';
        refreshView();
      });
    });

    container.querySelectorAll('[data-shortcut]').forEach((button) => {
      button.addEventListener('click', () => {
        activeTable = button.dataset.shortcut;
        activeFilters = {};
        activeSearch = '';
        refreshView();
        container.querySelector('#table-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    container.querySelector('#global-search').addEventListener('input', (event) => {
      activeSearch = event.target.value;
      refreshView();
    });

    container.querySelectorAll('[data-filter]').forEach((input) => {
      input.addEventListener('input', (event) => {
        activeFilters[event.target.dataset.filter] = event.target.value;
        refreshView();
      });
    });

    container.querySelector('#export-csv').addEventListener('click', () => exportCurrentTable(activeTable, filteredRows));

    container.querySelector('#reset-db').addEventListener('click', () => {
      if (!window.confirm('Confirmer la réinitialisation des données fictives ?')) return;
      resetDatabase();
      activeFilters = {};
      activeSearch = '';
      refreshView();
    });

    container.querySelector('#add-line').addEventListener('click', () => openForm());

    container.querySelectorAll('.row-edit').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.id);
        openForm(getTable(activeTable).find((item) => item.id === id));
      });
    });

    container.querySelectorAll('.row-delete').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.id);
        if (!window.confirm('Confirmer la suppression de cette ligne ?')) return;
        deleteRecord(activeTable, id);
        refreshView();
      });
    });
  }

  function openForm(record = null) {
    const formCard = container.querySelector('#form-card');
    const form = container.querySelector('#record-form');
    container.querySelector('#form-title').textContent = record ? 'Modifier une ligne' : 'Ajouter une ligne';
    form.innerHTML = buildForm(activeTable, record || {});
    formCard.hidden = false;

    form.onsubmit = (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      if (record) updateRecord(activeTable, record.id, payload);
      else addRecord(activeTable, payload);
      formCard.hidden = true;
      refreshView();
    };

    container.querySelector('#cancel-form').onclick = () => {
      formCard.hidden = true;
    };
  }

  refreshView();
}
