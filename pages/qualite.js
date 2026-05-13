import { addRecord, deleteRecord, getTable, updateRecord } from '../data/databaseService.js';

const SECTIONS = [
  { key: 'equipements', title: 'Contrôle équipements', description: 'Suivi des contrôles cabines, bains, four, chaîne et équipements process.' },
  { key: 'signalements', title: 'Signalements qualité', description: 'Suivi des signalements internes, réclamations clients et non-conformités.' },
  { key: 'standards', title: 'Standards process', description: 'Suivi des standards qualité, points de contrôle et critères d’acceptation.' }
];

const safe = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const today = () => new Date().toISOString().slice(0, 10);

function equipementData() {
  const controles = getTable('controlesEquipements') || [];
  const appareils = getTable('appareilsMesure') || [];
  const bains = controles.filter((c) => /pH|température|concentration|conductivité/i.test(String(c.typeControle || '')));
  const fours = controles.filter((c) => /four/i.test(String(c.equipement || '')));
  const cabines = controles.filter((c) => /cabine|séchage|mesure/i.test(String(c.equipement || '')) && !/four/i.test(String(c.equipement || '')));
  return { controles, appareils, bains, fours, cabines };
}

function sectionKpis(section) {
  const { controles, appareils, bains, fours } = equipementData();
  const observations = getTable('observations') || [];
  const qualiteObs = observations.filter((o) => String(o.activite || '').toLowerCase().includes('qualit'));
  if (section === 'equipements') {
    const alertsOpen = fours.filter((f) => ['Signalé', 'Pris en charge'].includes(f.statutMaintenance)).length;
    const reactions = fours.filter((f) => f.tempsReactionMinutes).map((f) => Number(f.tempsReactionMinutes));
    const avgReaction = reactions.length ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length) : 0;
    return [
      ['Contrôles bains à faire', bains.filter((b) => !b.resultat || b.resultat === 'À faire').length],
      ['Contrôles bains conformes', bains.filter((b) => String(b.resultat).includes('Conforme')).length],
      ['Contrôles bains non conformes', bains.filter((b) => /Non conforme|Alerte/i.test(String(b.resultat))).length],
      ['Contrôles cabines à faire', controles.filter((c) => /cabine/i.test(String(c.equipement || '')) && (!c.resultat || c.resultat === 'À faire')).length],
      ['Appareils à étalonner', appareils.filter((a) => a.statut === 'À étalonner' || a.statut === 'En retard').length],
      ['Appareils à remplacer', appareils.filter((a) => a.statut === 'À remplacer').length],
      ['Alertes maintenance ouvertes', alertsOpen],
      ['Temps moyen de réaction maintenance', `${avgReaction} min`]
    ];
  }
  if (section === 'signalements') {
    const ouverts = qualiteObs.filter((o) => o.statutTraitement !== 'Clôturée');
    const clotures = qualiteObs.filter((o) => o.statutTraitement === 'Clôturée').length;
    return [
      ['Signalements ouverts', ouverts.length],
      ['Signalements internes', qualiteObs.filter((o) => (o.origine || 'Interne') === 'Interne').length],
      ['Signalements clients', qualiteObs.filter((o) => o.origine === 'Client').length],
      ['Signalements critiques', qualiteObs.filter((o) => o.importance === 'Critique').length],
      ['Actions correctives en cours', qualiteObs.filter((o) => o.statutTraitement === 'En cours').length],
      ['Actions en retard', qualiteObs.filter((o) => o.statutTraitement === 'En retard').length],
      ['Signalements clôturés', clotures],
      ['Taux de clôture', `${qualiteObs.length ? Math.round((clotures / qualiteObs.length) * 100) : 0}%`]
    ];
  }
  const standards = [
    { statut: 'Actif' }, { statut: 'À formaliser' }, { statut: 'À mettre à jour' }, { statut: 'Actif' }, { statut: 'À formaliser' }, { statut: 'Actif' }
  ];
  return [
    ['Standards actifs', standards.filter((s) => s.statut === 'Actif').length],
    ['Standards à formaliser', standards.filter((s) => s.statut === 'À formaliser').length],
    ['Standards à mettre à jour', standards.filter((s) => s.statut === 'À mettre à jour').length],
    ['Points de contrôle définis', 18],
    ['Documents qualité disponibles', 12],
    ['Standards validés', 4],
    ['Standards en attente validation', 2],
    ['Taux de couverture process', '78%']
  ];
}

function kpiHtml(section) {
  return `<div class="table-grid logistic-kpi-grid">${sectionKpis(section).map(([l, v]) => `<article class="card kpi"><h4>${l}</h4><p class="kpi-count">${v}</p></article>`).join('')}</div>`;
}

function sectionEquipements(showForm = false) {
  const { bains, fours, cabines, appareils } = equipementData();
  return `<article class="card"><h4>Contrôle équipements</h4>${kpiHtml('equipements')}
  <article class="card"><h5>Contrôle des bains</h5>${bains.length ? `<div class="table-wrapper"><table><thead><tr><th>Bain concerné</th><th>Date contrôle</th><th>Heure contrôle</th><th>Paramètre contrôlé</th><th>Valeur mesurée</th><th>Valeur cible</th><th>Tolérance</th><th>Résultat</th><th>Contrôleur</th><th>Action immédiate</th><th>Commentaire</th></tr></thead><tbody>${bains.map((b) => `<tr><td>${safe(b.equipement)}</td><td>${safe(b.dateControle)}</td><td>${safe(b.heureControle || '')}</td><td>${safe(b.typeControle)}</td><td>${safe(b.valeurMesuree)}</td><td>${safe(b.valeurCible)}</td><td>${safe(b.tolerance)}</td><td>${safe(b.resultat)}</td><td>${safe(b.controleur)}</td><td>${safe(b.actionCorrective || '')}</td><td>${safe(b.commentaire || '')}</td></tr>`).join('')}</tbody></table></div>` : '<p>Aucun contrôle bain disponible pour le moment.</p>'}</article>
  <article class="card"><h5>Alertes fours / maintenance</h5>${fours.length ? `<div class="table-wrapper"><table><thead><tr><th>Four concerné</th><th>Type alerte</th><th>Date signalement</th><th>Heure signalement</th><th>Statut maintenance</th><th>Heure prise en charge</th><th>Heure résolution</th><th>Temps de réaction</th><th>Commentaire qualité</th></tr></thead><tbody>${fours.map((f) => `<tr><td>${safe(f.equipement)}</td><td>${safe(f.typeAlerte || f.typeControle)}</td><td>${safe(f.dateSignalement || f.dateControle)}</td><td>${safe(f.heureSignalement || '')}</td><td>${safe(f.statutMaintenance || 'Signalé')}</td><td>${safe(f.heurePriseEnCharge || '')}</td><td>${safe(f.heureResolution || '')}</td><td>${safe(f.tempsReactionMinutes || '')}</td><td>${safe(f.commentaire || '')}</td></tr>`).join('')}</tbody></table></div>` : '<p>Aucune alerte four disponible pour le moment.</p>'}</article>
  <article class="card"><h5>Cabines et équipements process</h5>${cabines.length ? `<div class="table-wrapper"><table><thead><tr><th>Équipement</th><th>Type contrôle</th><th>Date contrôle</th><th>Résultat</th><th>Statut</th><th>Action à prévoir</th><th>Responsable</th><th>Commentaire</th></tr></thead><tbody>${cabines.map((c) => `<tr><td>${safe(c.equipement)}</td><td>${safe(c.typeControle)}</td><td>${safe(c.dateControle)}</td><td>${safe(c.resultat)}</td><td>${safe(c.statut || '')}</td><td>${safe(c.actionCorrective || '')}</td><td>${safe(c.controleur || '')}</td><td>${safe(c.commentaire || '')}</td></tr>`).join('')}</tbody></table></div>` : '<p>Aucun contrôle cabine/process disponible pour le moment.</p>'}</article>
  <article class="card"><div class="controls"><h5>Appareils à étalonner / remplacer</h5><button class="btn secondary" id="add-device-btn" type="button">Ajouter un appareil</button></div>${appareils.length ? `<div class="table-wrapper"><table><thead><tr><th>Nom appareil</th><th>Référence interne</th><th>Type appareil</th><th>Localisation</th><th>Dernier étalonnage</th><th>Prochain étalonnage</th><th>Statut</th><th>Responsable</th><th>Commentaire</th><th>Actions</th></tr></thead><tbody>${appareils.map((a) => `<tr><td>${safe(a.nomAppareil)}</td><td>${safe(a.referenceInterne)}</td><td>${safe(a.typeAppareil)}</td><td>${safe(a.localisation)}</td><td>${safe(a.dernierEtalonnage)}</td><td>${safe(a.prochainEtalonnage)}</td><td>${safe(a.statut)}</td><td>${safe(a.responsable)}</td><td>${safe(a.commentaire || '')}</td><td><button class="btn secondary" type="button" data-app-action="etalonne" data-id="${a.id}">Marquer étalonné</button> <button class="btn secondary" type="button" data-app-action="replace" data-id="${a.id}">À remplacer</button> <button class="btn secondary" type="button" data-app-action="delete" data-id="${a.id}">Supprimer</button></td></tr>`).join('')}</tbody></table></div>` : '<p>Aucun appareil renseigné pour le moment.</p>'}
  ${showForm ? `<form id="device-form" class="record-form"><label class="form-field">Nom appareil<input name="nomAppareil" required /></label><label class="form-field">Référence interne<input name="referenceInterne" required /></label><label class="form-field">Type appareil<input name="typeAppareil" required /></label><label class="form-field">Localisation<input name="localisation" required /></label><label class="form-field">Dernier étalonnage<input type="date" name="dernierEtalonnage" /></label><label class="form-field">Prochain étalonnage<input type="date" name="prochainEtalonnage" /></label><label class="form-field">Statut<select name="statut"><option>Conforme</option><option>À étalonner</option><option>En retard</option><option>À remplacer</option></select></label><label class="form-field">Responsable<input name="responsable" /></label><label class="form-field full-row">Commentaire<input name="commentaire" /></label><div class="controls"><button class="btn" type="submit">Enregistrer</button><button class="btn secondary" id="cancel-device-btn" type="button">Annuler</button></div></form>` : ''}
  </article></article>`;
}

function sectionSignalements() {
  const obs = (getTable('observations') || []).filter((o) => String(o.activite || '').toLowerCase().includes('qualit'));
  return `<article class="card"><h4>Signalements qualité</h4>${kpiHtml('signalements')}<div class="table-grid"><article class="card"><h5>Signalements internes</h5></article><article class="card"><h5>Signalements clients</h5></article></div>${obs.length ? `<div class="table-wrapper"><table><thead><tr><th>Date</th><th>Origine</th><th>Client</th><th>N° OF</th><th>Référence</th><th>Type signalement</th><th>Importance</th><th>Statut</th><th>Action prévue</th></tr></thead><tbody>${obs.map((o) => `<tr><td>${safe(o.dateObservation)}</td><td>${safe(o.origine || 'Interne')}</td><td>${safe(o.client || '')}</td><td>${safe(o.numeroOF || '')}</td><td>${safe(o.reference || '')}</td><td>${safe(o.typeObservation)}</td><td>${safe(o.importance)}</td><td>${safe(o.statutTraitement)}</td><td>${safe(o.actionPrevue)}</td></tr>`).join('')}</tbody></table></div>` : '<p>Aucun signalement qualité disponible pour le moment.</p>'}</article>`;
}

function sectionStandards() {
  const standards = [['Standard préparation', 'Assurer la conformité avant entrée en ligne', 'Actif'], ['Standard accroche', 'Vérifier accroche et stabilité des pièces', 'À mettre à jour'], ['Standard peinture', 'Respecter les paramètres process peinture', 'Actif'], ['Standard décroche', 'Contrôler intégrité après décroche', 'À formaliser'], ['Standard conditionnement', 'Définir emballage et protection adaptés', 'À formaliser'], ['Contrôle avant expédition', 'Valider conformité finale avant départ', 'Actif']];
  return `<article class="card"><h4>Standards process</h4>${kpiHtml('standards')}<div class="table-grid">${standards.map(([n, o, s]) => `<article class="card"><h5>${n}</h5><p>${o}</p><p><strong>Statut :</strong> ${s}</p></article>`).join('')}</div></article>`;
}

function renderQualite(container, active = 'equipements', showForm = false) {
  const activeSection = SECTIONS.find((s) => s.key === active) || SECTIONS[0];
  const sectionHtml = activeSection.key === 'equipements' ? sectionEquipements(showForm) : activeSection.key === 'signalements' ? sectionSignalements() : sectionStandards();
  container.innerHTML = `<article class="card"><h3>Qualité</h3><p>Contrôles équipements, signalements qualité et standards process</p></article><section class="table-grid">${SECTIONS.map((s) => `<button type="button" class="card kpi ${s.key === activeSection.key ? 'active-tab' : ''}" data-q="${s.key}"><h4>${s.title}</h4><p>${s.description}</p></button>`).join('')}</section>${sectionHtml}`;
  container.querySelectorAll('[data-q]').forEach((btn) => btn.addEventListener('click', () => renderQualite(container, btn.dataset.q, false)));
  container.querySelector('#add-device-btn')?.addEventListener('click', () => renderQualite(container, 'equipements', true));
  container.querySelector('#cancel-device-btn')?.addEventListener('click', () => renderQualite(container, 'equipements', false));
  container.querySelector('#device-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    addRecord('appareilsMesure', d);
    renderQualite(container, 'equipements', false);
  });
  container.querySelectorAll('[data-app-action]').forEach((btn) => btn.addEventListener('click', () => {
    const id = Number(btn.dataset.id);
    const action = btn.dataset.appAction;
    if (action === 'etalonne') updateRecord('appareilsMesure', id, { statut: 'Conforme', dernierEtalonnage: today() });
    if (action === 'replace') updateRecord('appareilsMesure', id, { statut: 'À remplacer' });
    if (action === 'delete') deleteRecord('appareilsMesure', id);
    renderQualite(container, 'equipements', false);
  }));
}

export function renderQualitePage(container) {
  renderQualite(container, 'equipements', false);
}
