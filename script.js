import { loadDatabase } from './data/databaseService.js';
import { renderDatabasePage } from './pages/database.js';
import { renderManagerPage } from './pages/manager.js';
import { renderProductionPage } from './pages/production.js';
import { renderMethodesPage } from './pages/methodes.js';
import { renderPreparationPage } from './pages/preparation.js';
import { renderAccrochePage } from './pages/accroche.js';
import { renderPeinturePage } from './pages/peinture.js';
import { renderDecrochePage } from './pages/decroche.js';
import { renderQualitePage } from './pages/qualite.js';
import { renderLogistiquePage } from './pages/logistique.js';
import { renderStockPage } from './pages/stock.js';
import { renderSettingsPage } from './pages/settings.js';

const pages = [
  { key: 'manager', label: 'Manager', subtitle: 'Pilotage global des affaires', render: renderManagerPage },
  { key: 'database', label: 'Base de données', subtitle: 'Consultation, modification, filtrage et export des données', render: renderDatabasePage },
  { key: 'production', label: 'Production / Affaires', subtitle: 'Suivi opérationnel des OF', render: renderProductionPage },
  { key: 'methodes', label: 'Responsable méthode', subtitle: 'Structuration des gammes et temps standards', render: renderMethodesPage },
  { key: 'preparation', label: 'Préparation', subtitle: 'Préparation des pièces avant ligne', render: renderPreparationPage },
  { key: 'accroche', label: 'Accroche', subtitle: 'Gestion de l’accroche des pièces', render: renderAccrochePage },
  { key: 'peinture', label: 'Peinture', subtitle: 'Pilotage du process peinture', render: renderPeinturePage },
  { key: 'decroche', label: 'Décroche', subtitle: 'Décroche et transfert aval', render: renderDecrochePage },
  { key: 'qualite', label: 'Qualité', subtitle: 'Contrôles qualité et conformité', render: renderQualitePage },
  { key: 'logistique', label: 'Logistique', subtitle: 'Flux logistiques entrants et sortants', render: renderLogistiquePage },
  { key: 'stock', label: 'Stock', subtitle: 'Suivi des niveaux de stock', render: renderStockPage },
  { key: 'settings', label: 'Paramètres / Utilisateurs', subtitle: 'Configuration de l’application', render: renderSettingsPage }
];

const nav = document.querySelector('#sidebar-nav');
const pageTitle = document.querySelector('#page-title');
const pageSubtitle = document.querySelector('#page-subtitle');
const pageContent = document.querySelector('#page-content');

function setActivePage(pageKey) {
  const currentPage = pages.find((page) => page.key === pageKey) || pages.find((page) => page.key === 'database');

  pageTitle.textContent = currentPage.label;
  pageSubtitle.textContent = currentPage.subtitle;
  currentPage.render(pageContent);

  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.page === currentPage.key);
  });
}

function renderNavigation() {
  nav.innerHTML = pages
    .map((page) => `<button type="button" class="nav-btn" data-page="${page.key}">${page.label}</button>`)
    .join('');

  nav.addEventListener('click', (event) => {
    const button = event.target.closest('.nav-btn');
    if (!button) return;
    setActivePage(button.dataset.page);
  });
}

function bootstrap() {
  loadDatabase();
  renderNavigation();
  setActivePage('database');
}

bootstrap();
