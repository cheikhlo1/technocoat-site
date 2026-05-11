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

const tableLabels = {
  clients: 'Clients',
  commandes: 'Commandes',
  affaires: 'Affaires / OF',
  referencesPieces: 'Références pièces',
  gammes: 'Gammes',
  etapesGamme: 'Étapes de gamme',
  taches: 'Tâches',
  personnel: 'Personnel',
  stocks: 'Stocks',
  mouvementsStock: 'Mouvements stock',
  qualitePieces: 'Qualité pièces',
  controlesEquipements: 'Contrôles équipements',
  logistique: 'Logistique',
  observations: 'Observations / REX'
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

  if (activeFilters.client && fields.client) {
    rows = rows.filter((row) => normalize(row[fields.client]).includes(normalize(activeFilters.client)));
  }
  if (activeFilters.statut && fields.statut) {
    rows = rows.filter((row) => normalize(row[fields.statut]).includes(normalize(activeFilters.statut)));
  }
  if (activeFilters.activite && fields.activite) {
    rows = rows.filter((row) => normalize(row[fields.activite]).includes(normalize(activeFilters.activite)));
  }
  if (activeFilters.priorite && fields.priorite) {
    rows = rows.filter((row) => normalize(row[fields.priorite]).includes(normalize(activeFilters.priorite)));
  }
  if (activeFilters.affaire && fields.affaire) {
    rows = rows.filter((row) => normalize(row[fields.affaire]).includes(normalize(activeFilters.affaire)));
  }
  if (activeFilters.reference && fields.reference) {
    rows = rows.filter((row) => normalize(row[fields.reference]).includes(normalize(activeFilters.reference)));
  }
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
  return Object.entries(tableLabels)
    .map(([tableName, label]) => `<article class="card kpi"><h3>${label}</h3><p>${getTable(tableName).length} ligne(s)</p></article>`)
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
    .map(
      (config) => `<label class="filter-item">${filterLabels[config.key]}<input data-filter="${config.key}" type="${config.type}" value="${activeFilters[config.key] || ''}" /></label>`
    )
    .join('');
}

function renderTable(tableName, rows) {
  const columns = getColumns(tableName);
  if (!rows.length) {
    return '<p>Aucune donnée disponible pour cette table avec les filtres en cours.</p>';
  }

  const headers = columns.map((column) => `<th>${column}</th>`).join('');
  const body = rows
    .map(
      (row) => `<tr>${columns.map((column) => `<td>${row[column] ?? ''}</td>`).join('')}<td class="actions-cell"><button class="btn secondary row-edit" data-id="${row.id}">Modifier</button><button class="btn warning row-delete" data-id="${row.id}">Supprimer</button></td></tr>`
    )
    .join('');

  return `<div class="table-wrapper"><table><thead><tr>${headers}<th>Actions</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

function buildForm(tableName, row = {}) {
  const columns = getColumns(tableName).filter((column) => column !== 'id');
  if (!columns.length) return '<p>Aucune colonne éditable disponible.</p>';
  return columns
    .map((column) => {
      const isDate = normalize(column).includes('date');
      const inputType = isDate ? 'date' : 'text';
      return `<label class="form-field">${column}<input type="${inputType}" name="${column}" value="${row[column] ?? ''}" /></label>`;
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
      <article class="card">
        <h3>Base de données</h3>
        <p>Consultation, modification, filtrage et export des données</p>
      </article>

      <section class="table-grid">${renderSummaryCards()}</section>

      <article class="card">
        <div class="table-selector">${Object.entries(tableLabels)
          .map(([key, label]) => `<button type="button" class="btn ${key === activeTable ? '' : 'secondary'} table-tab" data-table="${key}">${label}</button>`)
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

      <article class="card">
        <h3>${tableLabels[activeTable]}</h3>
        <p>${filteredRows.length} ligne(s) affichée(s) sur ${getTable(activeTable).length}</p>
        ${renderTable(activeTable, filteredRows)}
      </article>

      <article class="card" id="form-card" hidden>
        <h3 id="form-title">Ajouter une ligne</h3>
        <form id="record-form" class="record-form"></form>
        <div class="controls">
          <button id="save-record" class="btn" type="submit" form="record-form">Enregistrer</button>
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

    container.querySelector('#export-csv').addEventListener('click', () => {
      exportCurrentTable(activeTable, filteredRows);
    });

    container.querySelector('#reset-db').addEventListener('click', () => {
      const confirmed = window.confirm('Confirmer la réinitialisation des données fictives ?');
      if (!confirmed) return;
      resetDatabase();
      activeFilters = {};
      activeSearch = '';
      refreshView();
    });

    container.querySelector('#add-line').addEventListener('click', () => {
      openForm();
    });

    container.querySelectorAll('.row-edit').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.id);
        const record = getTable(activeTable).find((item) => item.id === id);
        openForm(record);
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
    const title = container.querySelector('#form-title');

    title.textContent = record ? 'Modifier une ligne' : 'Ajouter une ligne';
    form.innerHTML = buildForm(activeTable, record || {});
    formCard.hidden = false;

    form.onsubmit = (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      if (record) {
        updateRecord(activeTable, record.id, payload);
      } else {
        addRecord(activeTable, payload);
      }
      formCard.hidden = true;
      refreshView();
    };

    container.querySelector('#cancel-form').onclick = () => {
      formCard.hidden = true;
    };
  }

  refreshView();
}
