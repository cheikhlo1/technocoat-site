import { getTable, loadDatabase, resetDatabase } from '../data/databaseService.js';

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

function renderTableCards() {
  return Object.entries(tableLabels)
    .map(([tableName, label]) => {
      const count = getTable(tableName).length;
      return `<article class="card kpi"><h3>${label}</h3><p>${count} ligne(s)</p></article>`;
    })
    .join('');
}

export function renderDatabasePage(container) {
  loadDatabase();
  container.innerHTML = `
    <article class="card">
      <h3>Base de données</h3>
      <p>Consultation, modification, filtrage et export des données.</p>
      <div class="controls">
        <button id="reset-db" class="btn warning" type="button">Réinitialiser les données fictives</button>
        <button id="verify-db" class="btn secondary" type="button">Vérifier la base</button>
      </div>
      <p id="db-status"></p>
    </article>
    <section class="table-grid" id="table-cards">${renderTableCards()}</section>
  `;

  const status = container.querySelector('#db-status');
  const cards = container.querySelector('#table-cards');

  container.querySelector('#reset-db').addEventListener('click', () => {
    resetDatabase();
    cards.innerHTML = renderTableCards();
    status.className = 'status-ok';
    status.textContent = 'La base a été réinitialisée avec les données fictives.';
  });

  container.querySelector('#verify-db').addEventListener('click', () => {
    const missingTables = Object.keys(tableLabels).filter((name) => !Array.isArray(getTable(name)));
    if (missingTables.length) {
      status.className = 'status-error';
      status.textContent = `Tables manquantes: ${missingTables.join(', ')}`;
      return;
    }
    status.className = 'status-ok';
    status.textContent = 'Vérification terminée: toutes les tables sont disponibles.';
  });
}
