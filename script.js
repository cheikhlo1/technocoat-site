const pages = {
  manager: {
    title: 'Manager',
    subtitle: 'Vue globale des indicateurs de pilotage atelier.',
    description: 'Synthèse fictive des OF, délais, qualité et charge atelier.',
    metrics: ['OF en cours : 12', 'Tâches terminées : 38', 'Alertes stock : 2']
  },
  production: {
    title: 'Production / OF',
    subtitle: 'Suivi des ordres de fabrication et des priorités.',
    description: 'Liste simplifiée des OF actifs et de leur avancement.',
    metrics: ['OF en attente : 5', 'OF terminés : 27', 'Retards : 1']
  },
  'responsable-methode': {
    title: 'Responsable méthode',
    subtitle: 'Préparation des gammes et standards de fabrication.',
    description: 'Structure métier prête pour intégrer les gammes par référence.',
    metrics: ['Gammes actives : 18', 'Révisions en cours : 3', 'Écarts process : 0']
  },
  preparation: { title: 'Préparation', subtitle: 'Tâches opérateur et préparation des pièces.', description: 'Suivi fictif des besoins masquage et outillage.', metrics: ['Tâches du jour : 9', 'Temps prévu : 6h20', 'Blocages : 1'] },
  accroche: { title: 'Accroche', subtitle: 'Organisation des balancelles et accroche des pièces.', description: 'Zone de suivi des priorités et consommables accroche.', metrics: ['OF à accrocher : 4', 'Crochets dispo : 160', 'Retards : 0'] },
  peinture: { title: 'Peinture', subtitle: 'Pilotage cabine et consommation peinture.', description: 'Indicateurs fictifs sur cadence, qualité et consommables.', metrics: ['OF en cabine : 3', 'Conso poudre : 42 kg', 'Alertes qualité : 1'] },
  decroche: { title: 'Décroche', subtitle: 'Suivi des pièces en sortie et transfert.', description: 'Visualisation simplifiée de la décroche et du flux aval.', metrics: ['Lots à décrocher : 6', 'Transferts prêts : 4', 'Anomalies : 0'] },
  qualite: { title: 'Qualité', subtitle: 'Contrôles qualité et suivi des non-conformités.', description: 'Emplacement réservé aux contrôles visuels et dimensionnels.', metrics: ['Contrôles prévus : 14', 'NC ouvertes : 2', 'NC clôturées : 5'] },
  logistique: { title: 'Logistique', subtitle: 'Expéditions, livraisons et coordination flux.', description: 'Synthèse fictive du stock global et des livraisons.', metrics: ['Expéditions du jour : 3', 'Réceptions : 2', 'Urgences : 1'] },
  stock: { title: 'Stock', subtitle: 'Stock central et alertes de réapprovisionnement.', description: 'Base propre pour le suivi des niveaux par activité.', metrics: ['Articles suivis : 124', 'Articles en alerte : 7', 'Ruptures : 0'] },
  'base-donnees': { title: 'Base de données', subtitle: 'Page de simulation des données futures.', description: 'Aucune base réelle : uniquement un espace de préparation fonctionnelle.', metrics: ['Tables simulées : 6', 'Données fictives : actives', 'Connexion réelle : non'] },
  parametres: { title: 'Paramètres / Utilisateurs', subtitle: 'Gestion visuelle des profils et préférences.', description: 'Préparation des rôles sans authentification réelle.', metrics: ['Utilisateurs fictifs : 9', 'Rôles configurés : 8', 'Demandes accès : 2'] }
};

const contentNode = document.getElementById('page-content');
const navButtons = document.querySelectorAll('.sidebar-nav button');

function renderPage(pageKey) {
  const page = pages[pageKey];
  if (!page) return;

  contentNode.innerHTML = `
    <h2 class="page-title">${page.title}</h2>
    <p class="page-subtitle">${page.subtitle}</p>

    <article class="card">
      <h3>Carte de présentation</h3>
      <p>${page.description}</p>
      <div class="badges">
        <span class="badge orange">Priorité atelier</span>
        <span class="badge green">Suivi terminé</span>
        <span class="badge red">Alerte active</span>
      </div>
    </article>

    <article class="card">
      <h3>Données fictives</h3>
      <ul>
        ${page.metrics.map((metric) => `<li>${metric}</li>`).join('')}
      </ul>
    </article>

    <article class="todo-box">
      <strong>À développer :</strong> contenu détaillé métier, tableaux OF et formulaires opérateurs.
    </article>
  `;
}

function setActiveButton(pageKey) {
  navButtons.forEach((button) => {
    button.classList.toggle('active-nav', button.dataset.section === pageKey);
  });
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const pageKey = button.dataset.section;
    renderPage(pageKey);
    setActiveButton(pageKey);
  });
});

document.getElementById('change-role').addEventListener('click', () => {
  window.alert('Simulation : changement de rôle à développer.');
});

renderPage('manager');
setActiveButton('manager');
