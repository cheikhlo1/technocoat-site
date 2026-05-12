import { loadDatabase } from './data/databaseService.js';

const pageRegistry = {
  manager: { label: 'Manager', subtitle: 'Pilotage global des affaires', loader: () => import('./pages/manager.js'), renderName: 'renderManagerPage' },
  database: { label: 'Base de données', subtitle: 'Consultation, modification, filtrage et export des données', loader: () => import('./pages/database.js'), renderName: 'renderDatabasePage' },
  production: { label: 'Production / Affaires', subtitle: 'Suivi opérationnel des OF', loader: () => import('./pages/production.js'), renderName: 'renderProductionPage' },
  methodes: { label: 'Responsable méthode', subtitle: 'Structuration des gammes et temps standards', loader: () => import('./pages/methodes.js'), renderName: 'renderMethodesPage' },
  preparation: { label: 'Préparation', subtitle: 'Préparation des pièces avant ligne', loader: () => import('./pages/preparation.js'), renderName: 'renderPreparationPage' },
  accroche: { label: 'Accroche', subtitle: 'Gestion de l’accroche des pièces', loader: () => import('./pages/accroche.js'), renderName: 'renderAccrochePage' },
  peinture: { label: 'Peinture', subtitle: 'Pilotage du process peinture', loader: () => import('./pages/peinture.js'), renderName: 'renderPeinturePage' },
  decroche: { label: 'Décroche', subtitle: 'Décroche et transfert aval', loader: () => import('./pages/decroche.js'), renderName: 'renderDecrochePage' },
  qualite: { label: 'Qualité', subtitle: 'Contrôles qualité et conformité', loader: () => import('./pages/qualite.js'), renderName: 'renderQualitePage' },
  logistique: { label: 'Logistique', subtitle: 'Flux logistiques entrants et sortants', loader: () => import('./pages/logistique.js'), renderName: 'renderLogistiquePage' },
  stock: { label: 'Stock', subtitle: 'Suivi des niveaux de stock', loader: () => import('./pages/stock.js'), renderName: 'renderStockPage' },
  settings: { label: 'Paramètres / Utilisateurs', subtitle: 'Configuration de l’application', loader: () => import('./pages/settings.js'), renderName: 'renderSettingsPage' }
};

const nav = document.querySelector('#sidebar-nav');
const pageTitle = document.querySelector('#page-title');
const pageSubtitle = document.querySelector('#page-subtitle');
const pageContent = document.querySelector('#page-content');
const menuToggle = document.querySelector('#menu-toggle');
const menuClose = document.querySelector('#menu-close');
const sidebarOverlay = document.querySelector('#sidebar-overlay');
const LAST_PAGE_STORAGE_KEY = 'technocoat:lastPage';

function renderFallback(error) {
  console.error('Erreur de chargement de page:', error);
  if (pageTitle) pageTitle.textContent = 'Erreur de chargement';
  if (pageSubtitle) pageSubtitle.textContent = 'Une erreur JavaScript a interrompu le rendu de la page.';
  if (pageContent) pageContent.innerHTML = '<article class="card"><h3>Erreur</h3><p>Le rendu a échoué. Vérifier la console navigateur.</p></article>';
}

async function setActivePage(pageKey) {
  try {
    const currentPageKey = pageRegistry[pageKey] ? pageKey : 'database';
    const currentPage = pageRegistry[currentPageKey];
    if (!currentPage) throw new Error(`Page introuvable: ${pageKey}`);

    pageTitle.textContent = currentPage.label;
    pageSubtitle.textContent = currentPage.subtitle;
    pageContent.innerHTML = '<article class="card"><h3>Chargement de la page</h3><p>Rendu en cours...</p></article>';

    try {
      const pageModule = await currentPage.loader();
      const renderFn = pageModule[currentPage.renderName];
      if (typeof renderFn !== 'function') throw new Error(`Fonction de rendu absente: ${currentPage.renderName}`);
      renderFn(pageContent);
    } catch (pageError) {
      console.error(`Erreur de rendu page "${currentPageKey}":`, pageError);
      pageContent.innerHTML = '<article class="card"><h3>Erreur de chargement de cette page</h3><p>Le contenu détaillé est indisponible, mais la navigation reste active.</p></article>';
    }

    document.querySelectorAll('.nav-btn').forEach((button) => {
      button.classList.toggle('active', button.dataset.page === currentPageKey);
    });

    localStorage.setItem(LAST_PAGE_STORAGE_KEY, currentPageKey);
  } catch (error) {
    renderFallback(error);
  }
}

function renderNavigation() {
  if (!nav) throw new Error('Conteneur navigation introuvable (#sidebar-nav).');
  nav.innerHTML = Object.entries(pageRegistry).map(([key, page]) => `<button type="button" class="nav-btn" data-page="${key}">${page.label}</button>`).join('');
  nav.addEventListener('click', async (event) => {
    const button = event.target.closest('.nav-btn');
    if (!button) return;
    await setActivePage(button.dataset.page);
    closeSidebarOnMobile();
  });
}

function closeSidebarOnMobile() {
  if (window.innerWidth <= 1024) document.body.classList.add('sidebar-collapsed');
}

function setupMenu() {
  menuToggle?.addEventListener('click', () => document.body.classList.toggle('sidebar-collapsed'));
  menuClose?.addEventListener('click', () => document.body.classList.add('sidebar-collapsed'));
  sidebarOverlay?.addEventListener('click', () => document.body.classList.add('sidebar-collapsed'));
}


function bootstrap() {
  try {
    loadDatabase();
    renderNavigation();
    const lastPage = localStorage.getItem(LAST_PAGE_STORAGE_KEY);
    setActivePage(lastPage || 'database');
    setupMenu();
    closeSidebarOnMobile();
    window.addEventListener('resize', closeSidebarOnMobile);
  } catch (error) {
    renderFallback(error);
  }
}

bootstrap();
