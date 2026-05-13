import { getTable } from '../data/databaseService.js';

const SECTIONS = [
  { key: 'equipements', title: 'Contrôle équipements', description: 'Suivi des contrôles cabines, bains, four, chaîne et équipements process.' },
  { key: 'signalements', title: 'Signalements qualité', description: 'Suivi des signalements internes, réclamations clients et non-conformités.' },
  { key: 'standards', title: 'Standards process', description: 'Suivi des standards qualité, points de contrôle et critères d’acceptation.' }
];

const safe = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function computeKpis() {
  const controles = getTable('controlesEquipements') || [];
  const observations = getTable('observations') || [];
  const qualiteObs = observations.filter((o) => String(o.activite || '').toLowerCase().includes('qualité') || String(o.activite || '').toLowerCase().includes('qualite'));
  const aFaire = controles.filter((c) => !c.resultat || c.resultat === 'À faire').length;
  const conformes = controles.filter((c) => String(c.resultat || '').toLowerCase().includes('conforme')).length;
  const nonConformes = controles.filter((c) => String(c.resultat || '').toLowerCase().includes('alerte') || String(c.resultat || '').toLowerCase().includes('non conforme')).length;
  const ouverts = qualiteObs.filter((o) => String(o.statutTraitement || '').toLowerCase() !== 'clôturée').length;
  const clients = qualiteObs.filter((o) => String(o.origine || '').toLowerCase() === 'client').length;
  const internes = Math.max(0, qualiteObs.length - clients);
  const retard = qualiteObs.filter((o) => String(o.statutTraitement || '').toLowerCase() === 'en retard').length;
  const taux = controles.length ? Math.round((conformes / controles.length) * 100) : 100;
  return { aFaire, conformes, nonConformes, ouverts, clients, internes, retard, taux };
}

function renderKpis() {
  const k = computeKpis();
  return `<div class="table-grid logistic-kpi-grid">
    <article class="card kpi"><h4>Contrôles à faire</h4><p class="kpi-count">${k.aFaire}</p></article>
    <article class="card kpi"><h4>Contrôles conformes</h4><p class="kpi-count">${k.conformes}</p></article>
    <article class="card kpi"><h4>Contrôles non conformes</h4><p class="kpi-count">${k.nonConformes}</p></article>
    <article class="card kpi"><h4>Signalements ouverts</h4><p class="kpi-count">${k.ouverts}</p></article>
    <article class="card kpi"><h4>Signalements clients</h4><p class="kpi-count">${k.clients}</p></article>
    <article class="card kpi"><h4>Signalements internes</h4><p class="kpi-count">${k.internes}</p></article>
    <article class="card kpi"><h4>Actions en retard</h4><p class="kpi-count">${k.retard}</p></article>
    <article class="card kpi"><h4>Taux de conformité</h4><p class="kpi-count">${k.taux}%</p></article>
  </div>`;
}

function sectionEquipements() {
  const controles = getTable('controlesEquipements') || [];
  if (!controles.length) return '<article class="card"><h4>Contrôle équipements</h4><p>Aucun contrôle équipement disponible pour le moment.</p></article>';
  return `<article class="card"><h4>Contrôle équipements</h4><p>Vue simplifiée des derniers contrôles process.</p><div class="table-wrapper"><table><thead><tr><th>Date contrôle</th><th>Équipement</th><th>Type contrôle</th><th>Valeur mesurée</th><th>Valeur cible</th><th>Tolérance</th><th>Résultat</th><th>Contrôleur</th><th>Action corrective</th></tr></thead><tbody>${controles.map((c) => `<tr><td>${safe(c.dateControle)}</td><td>${safe(c.equipement)}</td><td>${safe(c.typeControle)}</td><td>${safe(c.valeurMesuree)}</td><td>${safe(c.valeurCible)}</td><td>${safe(c.tolerance)}</td><td>${safe(c.resultat)}</td><td>${safe(c.controleur)}</td><td>${safe(c.actionCorrective)}</td></tr>`).join('')}</tbody></table></div></article>`;
}

function sectionSignalements() {
  const obs = (getTable('observations') || []).filter((o) => String(o.activite || '').toLowerCase().includes('qualit'));
  if (!obs.length) return '<article class="card"><h4>Signalements qualité</h4><p>Aucun signalement qualité disponible pour le moment.</p></article>';
  return `<article class="card"><h4>Signalements qualité</h4><div class="table-grid"><article class="card"><h5>Signalements internes</h5><p>Suivi des retours atelier et non-conformités internes.</p></article><article class="card"><h5>Signalements clients</h5><p>Suivi des réclamations et retours client.</p></article></div><div class="table-wrapper"><table><thead><tr><th>Date</th><th>Origine</th><th>Client</th><th>N° OF</th><th>Référence</th><th>Type signalement</th><th>Importance</th><th>Statut</th><th>Action prévue</th></tr></thead><tbody>${obs.map((o) => `<tr><td>${safe(o.dateObservation)}</td><td>${safe(o.origine || 'Interne')}</td><td>${safe(o.client || '')}</td><td>${safe(o.numeroOF || '')}</td><td>${safe(o.reference || '')}</td><td>${safe(o.typeObservation)}</td><td>${safe(o.importance)}</td><td>${safe(o.statutTraitement)}</td><td>${safe(o.actionPrevue)}</td></tr>`).join('')}</tbody></table></div></article>`;
}

function sectionStandards() {
  const standards = [
    ['Standard préparation', 'Assurer la conformité avant entrée en ligne', 'Actif'],
    ['Standard accroche', 'Vérifier accroche et stabilité des pièces', 'À mettre à jour'],
    ['Standard peinture', 'Respecter les paramètres process peinture', 'Actif'],
    ['Standard décroche', 'Contrôler intégrité après décroche', 'À formaliser'],
    ['Standard conditionnement', 'Définir emballage et protection adaptés', 'À formaliser'],
    ['Contrôle avant expédition', 'Valider conformité finale avant départ', 'Actif']
  ];
  return `<article class="card"><h4>Standards process</h4><div class="table-grid">${standards.map(([nom, obj, statut]) => `<article class="card"><h5>${nom}</h5><p>${obj}</p><p><strong>Statut :</strong> ${statut}</p></article>`).join('')}</div></article>`;
}

function renderQualite(container, active = 'equipements') {
  const activeSection = SECTIONS.find((s) => s.key === active) || SECTIONS[0];
  container.innerHTML = `<article class="card"><h3>Qualité</h3><p>Contrôles équipements, signalements qualité et standards process</p></article><section class="table-grid">${SECTIONS.map((s) => `<button type="button" class="card kpi ${s.key === activeSection.key ? 'active-tab' : ''}" data-q="${s.key}"><h4>${s.title}</h4><p>${s.description}</p></button>`).join('')}</section>${renderKpis()}<section id="qualite-section">${activeSection.key === 'equipements' ? sectionEquipements() : activeSection.key === 'signalements' ? sectionSignalements() : sectionStandards()}</section>`;
  container.querySelectorAll('[data-q]').forEach((btn) => btn.addEventListener('click', () => renderQualite(container, btn.dataset.q)));
}

export function renderQualitePage(container) {
  renderQualite(container, 'equipements');
}
