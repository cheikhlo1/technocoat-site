import { addRecord, deleteRecord, getTable, updateRecord } from '../data/databaseService.js';

const SECTIONS = [
  { key: 'equipements', title: 'Contrôle équipements', description: 'Suivi des contrôles cabines, bains, four, chaîne et équipements process.' },
  { key: 'signalements', title: 'Signalements qualité', description: 'Suivi des signalements internes, réclamations clients et non-conformités.' },
  { key: 'standards', title: 'Standards process', description: 'Suivi des standards qualité, points de contrôle et critères d’acceptation.' }
];

const safe = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const today = () => new Date().toISOString().slice(0, 10);
const DEFAUT_TYPES = ['Manque peinture', 'Coulure', 'Rayure', 'Mauvais masquage', 'Pièce abîmée', 'Défaut aspect', 'Non-conformité dimensionnelle', 'Erreur référence', 'Problème conditionnement', 'Réclamation client', 'Autre'];
const STATUTS = ['Ouvert', 'En analyse', 'Action en cours', 'En attente client', 'Clôturé'];
const GRAVITES = ['Faible', 'Moyenne', 'Élevée', 'Critique'];

function equipementData() {
  const controles = getTable('controlesEquipements') || [];
  const appareils = getTable('appareilsMesure') || [];
  const bains = controles.filter((c) => /pH|température|concentration|conductivité/i.test(String(c.typeControle || '')));
  const fours = controles.filter((c) => /four/i.test(String(c.equipement || '')));
  const cabines = controles.filter((c) => /cabine|séchage|mesure/i.test(String(c.equipement || '')) && !/four/i.test(String(c.equipement || '')));
  return { controles, appareils, bains, fours, cabines };
}


function signalementsData() {
  const observations = getTable('observations') || [];
  const affaires = getTable('affaires') || [];
  const references = getTable('referencesPieces') || [];
  const clients = getTable('clients') || [];
  return observations.filter((o) => String(o.activite || '').toLowerCase().includes('qualit')).map((o) => {
    const affaire = affaires.find((a) => a.id === Number(o.affaireId));
    const ref = references.find((r) => r.id === Number(o.referenceId));
    const client = clients.find((c) => c.id === Number(affaire?.clientId));
    const statut = o.statutTraitement === 'Ouverte' ? 'Ouvert' : o.statutTraitement === 'En cours' ? 'Action en cours' : o.statutTraitement === 'Clôturée' ? 'Clôturé' : (o.statutTraitement || 'Ouvert');
    const origine = o.origineSignalement || o.origine || (String(o.typeObservation || '').toLowerCase().includes('réclamation') ? 'Client' : 'Interne');
    return {
      ...o,
      origineSignalement: origine,
      client: o.client || client?.nom || '',
      numeroOF: o.numeroOF || affaire?.numeroOF || '',
      reference: o.reference || ref?.referencePiece || '',
      designation: o.designation || ref?.designationPiece || '',
      typeDefaut: o.typeDefaut || o.typeObservation || 'Autre',
      gravite: o.gravite || o.importance || 'Moyenne',
      quantiteConcernee: Number(o.quantiteConcernee || 0),
      descriptionProbleme: o.descriptionProbleme || o.commentaire || '',
      causeProbable: o.causeProbable || '',
      statutTraitement: statut,
      dateCibleCloture: o.dateCibleCloture || '',
      dateCloture: o.dateCloture || '',
      commentaireCloture: o.commentaireCloture || ''
    };
  });
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
    const data = signalementsData();
    const ouverts = data.filter((o) => o.statutTraitement !== 'Clôturé');
    const clotures = data.filter((o) => o.statutTraitement === 'Clôturé').length;
    const retard = data.filter((o) => o.dateCibleCloture && o.dateCibleCloture < today() && o.statutTraitement !== 'Clôturé').length;
    return [
      ['Signalements ouverts', ouverts.length],
      ['Signalements internes', data.filter((o) => o.origineSignalement === 'Interne').length],
      ['Signalements clients', data.filter((o) => o.origineSignalement === 'Client').length],
      ['Signalements critiques', data.filter((o) => o.gravite === 'Critique').length],
      ['Actions correctives en cours', data.filter((o) => o.statutTraitement === 'Action en cours').length],
      ['Actions en retard', retard],
      ['Signalements clôturés', clotures],
      ['Taux de clôture', `${data.length ? Math.round((clotures / data.length) * 100) : 0}%`]
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

function sectionSignalements(state) {
  const filters = state.filters || {};
  const all = signalementsData();
  const nav = state.subsection || 'tous';
  const active = all.filter((o) => (nav === 'tous' ? true : nav === 'internes' ? o.origineSignalement === 'Interne' : o.origineSignalement === 'Client')).filter((o) => (!filters.dateDebut || o.dateObservation >= filters.dateDebut) && (!filters.dateFin || o.dateObservation <= filters.dateFin) && (!filters.origine || o.origineSignalement === filters.origine) && (!filters.client || o.client === filters.client) && (!filters.statut || o.statutTraitement === filters.statut) && (!filters.gravite || o.gravite === filters.gravite) && (!filters.typeDefaut || o.typeDefaut === filters.typeDefaut) && (!filters.responsable || o.responsableTraitement === filters.responsable));
  const row = (o) => `<tr><td>${safe(o.dateObservation)}</td><td>${safe(o.origineSignalement)}</td><td>${safe(o.client)}</td><td>${safe(o.numeroOF)}</td><td>${safe(o.reference)}</td><td>${safe(o.designation)}</td><td>${safe(o.typeDefaut)}</td><td><span class="badge ${String(o.gravite).toLowerCase()}">${safe(o.gravite)}</span></td><td>${safe(o.quantiteConcernee)}</td><td><span class="badge">${safe(o.statutTraitement)}</span></td><td>${safe(o.responsableTraitement)}</td><td>${safe(o.actionPrevue || '')}</td><td><button class="btn secondary" data-s-action="detail" data-id="${o.id}">Détail</button> <button class="btn secondary" data-s-action="edit" data-id="${o.id}">Modifier</button></td></tr>`;
  const options = (vals, selected) => ['<option value="">Tous</option>', ...Array.from(new Set(vals.filter(Boolean))).map((v) => `<option ${v === selected ? 'selected' : ''}>${safe(v)}</option>`)].join('');
  if (state.mode === 'detail' || state.mode === 'edit' || state.mode === 'create') {
    const current = state.current || {};
    const edit = state.mode !== 'detail';
    const fields = `<label class="form-field">Date signalement<input type="date" name="dateObservation" value="${safe(current.dateObservation || today())}" ${edit ? '' : 'disabled'} required /></label><label class="form-field">Origine<select name="origineSignalement" ${edit ? '' : 'disabled'}><option ${current.origineSignalement === 'Interne' ? 'selected' : ''}>Interne</option><option ${current.origineSignalement === 'Client' ? 'selected' : ''}>Client</option></select></label><label class="form-field">Client<input name="client" value="${safe(current.client || '')}" ${edit ? '' : 'disabled'} /></label><label class="form-field">N° OF<input name="numeroOF" value="${safe(current.numeroOF || '')}" ${edit ? '' : 'disabled'} /></label><label class="form-field">Référence pièce<input name="reference" value="${safe(current.reference || '')}" ${edit ? '' : 'disabled'} /></label><label class="form-field">Désignation pièce<input name="designation" value="${safe(current.designation || '')}" ${edit ? '' : 'disabled'} /></label><label class="form-field">Type défaut<select name="typeDefaut" ${edit ? '' : 'disabled'}>${DEFAUT_TYPES.map((d)=>`<option ${current.typeDefaut===d?'selected':''}>${d}</option>`).join('')}</select></label><label class="form-field">Gravité<select name="gravite" ${edit ? '' : 'disabled'}>${GRAVITES.map((g)=>`<option ${current.gravite===g?'selected':''}>${g}</option>`).join('')}</select></label><label class="form-field">Quantité concernée<input type="number" min="0" name="quantiteConcernee" value="${safe(current.quantiteConcernee || 0)}" ${edit ? '' : 'disabled'} /></label><label class="form-field full-row">Description du problème<input name="descriptionProbleme" value="${safe(current.descriptionProbleme || '')}" ${edit ? '' : 'disabled'} /></label><label class="form-field">Cause probable<input name="causeProbable" value="${safe(current.causeProbable || '')}" ${edit ? '' : 'disabled'} /></label><label class="form-field">Action prévue<input name="actionPrevue" value="${safe(current.actionPrevue || '')}" ${edit ? '' : 'disabled'} /></label><label class="form-field">Responsable traitement<input name="responsableTraitement" value="${safe(current.responsableTraitement || '')}" ${edit ? '' : 'disabled'} /></label><label class="form-field">Statut<select name="statutTraitement" ${edit ? '' : 'disabled'}>${STATUTS.map((s)=>`<option ${current.statutTraitement===s?'selected':''}>${s}</option>`).join('')}</select></label><label class="form-field">Date cible de clôture<input type="date" name="dateCibleCloture" value="${safe(current.dateCibleCloture || '')}" ${edit ? '' : 'disabled'} /></label>`;
    const detailBlocks = state.mode === 'detail' ? `<div class="table-grid"><article class="card"><h5>Identification</h5><p>Date : ${safe(current.dateObservation)}</p><p>Origine : ${safe(current.origineSignalement)}</p><p>Client : ${safe(current.client)}</p><p>N° OF : ${safe(current.numeroOF)}</p><p>Référence : ${safe(current.reference)}</p><p>Désignation : ${safe(current.designation)}</p></article><article class="card"><h5>Problème</h5><p>Type défaut : ${safe(current.typeDefaut)}</p><p>Gravité : ${safe(current.gravite)}</p><p>Quantité : ${safe(current.quantiteConcernee)}</p><p>Description : ${safe(current.descriptionProbleme)}</p></article><article class="card"><h5>Analyse</h5><p>Cause probable : ${safe(current.causeProbable)}</p><p>Responsable : ${safe(current.responsableTraitement)}</p><p>Statut : ${safe(current.statutTraitement)}</p></article><article class="card"><h5>Action corrective</h5><p>Action prévue : ${safe(current.actionPrevue)}</p><p>Date cible : ${safe(current.dateCibleCloture)}</p><p>Date clôture : ${safe(current.dateCloture || '-')}</p><p>Commentaire clôture : ${safe(current.commentaireCloture || '-')}</p></article></div>` : '';
    return `<article class="card"><h4>Signalements qualité</h4><p>Suivi des signalements internes, réclamations clients et non-conformités.</p>${kpiHtml('signalements')}<article class="card">${detailBlocks}<form id="signalement-form" class="record-form">${fields}<div class="controls">${edit ? '<button class="btn" type="submit">Enregistrer</button>' : ''}${state.mode === 'detail' ? '<button class="btn secondary" type="button" data-s-action="edit" data-id="'+current.id+'">Modifier</button><button class="btn secondary" type="button" data-s-action="close" data-id="'+current.id+'">Clôturer</button>' : ''}<button class="btn secondary" type="button" data-s-action="back">Retour</button></div></form></article></article>`;
  }
  return `<article class="card"><h4>Signalements qualité</h4><p>Suivi des signalements internes, réclamations clients et non-conformités.</p>${kpiHtml('signalements')}<div class="controls"><button class="btn secondary ${nav === 'internes' ? 'active-tab' : ''}" data-s-nav="internes">Signalements internes</button><button class="btn secondary ${nav === 'clients' ? 'active-tab' : ''}" data-s-nav="clients">Signalements clients</button><button class="btn secondary ${nav === 'tous' ? 'active-tab' : ''}" data-s-nav="tous">Tous les signalements</button><button class="btn" data-s-action="create">Ajouter un signalement</button></div><form id="signalements-filters" class="record-form"><label class="form-field">Date début<input type="date" name="dateDebut" value="${safe(filters.dateDebut || '')}"/></label><label class="form-field">Date fin<input type="date" name="dateFin" value="${safe(filters.dateFin || '')}"/></label><label class="form-field">Origine<select name="origine">${options(['Interne','Client'], filters.origine)}</select></label><label class="form-field">Client<select name="client">${options(all.map((o)=>o.client), filters.client)}</select></label><label class="form-field">Statut<select name="statut">${options(STATUTS, filters.statut)}</select></label><label class="form-field">Gravité<select name="gravite">${options(GRAVITES, filters.gravite)}</select></label><label class="form-field">Type défaut<select name="typeDefaut">${options(DEFAUT_TYPES, filters.typeDefaut)}</select></label><label class="form-field">Responsable<select name="responsable">${options(all.map((o)=>o.responsableTraitement), filters.responsable)}</select></label><div class="controls"><button class="btn" type="submit">Filtrer</button><button class="btn secondary" type="button" data-s-action="reset-filters">Réinitialiser les filtres</button></div></form>${active.length ? `<div class="table-wrapper"><table><thead><tr><th>Date signalement</th><th>Origine</th><th>Client</th><th>N° OF</th><th>Référence</th><th>Désignation</th><th>Type défaut</th><th>Gravité</th><th>Quantité concernée</th><th>Statut</th><th>Responsable</th><th>Action prévue</th><th>Action</th></tr></thead><tbody>${active.map(row).join('')}</tbody></table></div>` : '<p>Aucun signalement pour les filtres sélectionnés.</p>'}</article>`;
}

function sectionStandards() {
  const standards = [['Standard préparation', 'Assurer la conformité avant entrée en ligne', 'Actif'], ['Standard accroche', 'Vérifier accroche et stabilité des pièces', 'À mettre à jour'], ['Standard peinture', 'Respecter les paramètres process peinture', 'Actif'], ['Standard décroche', 'Contrôler intégrité après décroche', 'À formaliser'], ['Standard conditionnement', 'Définir emballage et protection adaptés', 'À formaliser'], ['Contrôle avant expédition', 'Valider conformité finale avant départ', 'Actif']];
  return `<article class="card"><h4>Standards process</h4>${kpiHtml('standards')}<div class="table-grid">${standards.map(([n, o, s]) => `<article class="card"><h5>${n}</h5><p>${o}</p><p><strong>Statut :</strong> ${s}</p></article>`).join('')}</div></article>`;
}

function renderQualite(container, active = 'equipements', showForm = false, signalementsState = { subsection: 'tous', filters: {}, mode: 'list', current: null }) {
  const activeSection = SECTIONS.find((s) => s.key === active) || SECTIONS[0];
  const sectionHtml = activeSection.key === 'equipements' ? sectionEquipements(showForm) : activeSection.key === 'signalements' ? sectionSignalements(signalementsState) : sectionStandards();
  container.innerHTML = `<article class="card"><h3>Qualité</h3><p>Contrôles équipements, signalements qualité et standards process</p></article><section class="table-grid">${SECTIONS.map((s) => `<button type="button" class="card kpi ${s.key === activeSection.key ? 'active-tab' : ''}" data-q="${s.key}"><h4>${s.title}</h4><p>${s.description}</p></button>`).join('')}</section>${sectionHtml}`;
  container.querySelectorAll('[data-q]').forEach((btn) => btn.addEventListener('click', () => renderQualite(container, btn.dataset.q, false, signalementsState)));
  container.querySelector('#add-device-btn')?.addEventListener('click', () => renderQualite(container, 'equipements', true));
  container.querySelector('#cancel-device-btn')?.addEventListener('click', () => renderQualite(container, 'equipements', false));
  container.querySelector('#device-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    addRecord('appareilsMesure', d);
    renderQualite(container, 'equipements', false);
  });

  container.querySelectorAll('[data-s-nav]').forEach((btn) => btn.addEventListener('click', () => renderQualite(container, 'signalements', false, { ...signalementsState, subsection: btn.dataset.sNav, mode: 'list', current: null })));
  container.querySelector('#signalements-filters')?.addEventListener('submit', (e) => {
    e.preventDefault();
    renderQualite(container, 'signalements', false, { ...signalementsState, mode: 'list', filters: Object.fromEntries(new FormData(e.currentTarget).entries()) });
  });
  container.querySelectorAll('[data-s-action]').forEach((btn) => btn.addEventListener('click', () => {
    const id = Number(btn.dataset.id);
    const action = btn.dataset.sAction;
    const current = signalementsData().find((o) => o.id === id) || null;
    if (action === 'create') return renderQualite(container, 'signalements', false, { ...signalementsState, mode: 'create', current: { dateObservation: today(), origineSignalement: 'Interne', typeDefaut: 'Autre', gravite: 'Moyenne', statutTraitement: 'Ouvert' } });
    if (action === 'detail') return renderQualite(container, 'signalements', false, { ...signalementsState, mode: 'detail', current });
    if (action === 'edit') return renderQualite(container, 'signalements', false, { ...signalementsState, mode: 'edit', current });
    if (action === 'back') return renderQualite(container, 'signalements', false, { ...signalementsState, mode: 'list', current: null });
    if (action === 'reset-filters') return renderQualite(container, 'signalements', false, { ...signalementsState, filters: {}, mode: 'list' });
    if (action === 'close' && current) {
      const commentaire = window.prompt('Commentaire de clôture', current.commentaireCloture || '');
      updateRecord('observations', id, { statutTraitement: 'Clôturé', dateCloture: today(), commentaireCloture: commentaire || '' });
      return renderQualite(container, 'signalements', false, { ...signalementsState, mode: 'detail', current: signalementsData().find((o) => o.id === id) });
    }
  }));
  container.querySelector('#signalement-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const payload = { ...data, activite: 'Qualité', typeObservation: data.typeDefaut, importance: data.gravite, commentaire: data.descriptionProbleme, origine: data.origineSignalement };
    if (signalementsState.mode === 'edit' && signalementsState.current?.id) updateRecord('observations', signalementsState.current.id, payload);
    else addRecord('observations', payload);
    renderQualite(container, 'signalements', false, { ...signalementsState, mode: 'list', current: null });
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
