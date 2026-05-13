import { badge, computeCommonKpi, getOperatorContext, mins, saveObservation, saveTaskUpdate } from './operatorCommon.js';

const state = { selectedId: null };
const calc = (s, e) => {
  if (!s || !e) return null;
  const [sh, sm] = s.split(':').map(Number);
  const [eh, em] = e.split(':').map(Number);
  const d = eh * 60 + em - (sh * 60 + sm);
  return d >= 0 ? d : -1;
};

function postFlowProfile(row) {
  const mod = Number(row.task.id) % 5;
  if (mod === 0) return { flow: 'Blocage anomalie', prepNeeded: true, demasquage: true, bouchons: true, nettoyage: true, ctrl: true, polyvalent: true, polyCount: 2, prepTime: 45, zone: 'Zone PF-3', destination: 'Bloqué', status: 'bloqué', retouche: 2 };
  if (mod === 1) return { flow: 'Logistique directe', prepNeeded: false, demasquage: false, bouchons: false, nettoyage: false, ctrl: false, polyvalent: false, polyCount: 0, prepTime: 0, zone: '-', destination: 'Logistique', status: 'prêt', retouche: 0 };
  if (mod === 2) return { flow: 'Préparation finale / démasquage', prepNeeded: true, demasquage: true, bouchons: true, nettoyage: true, ctrl: false, polyvalent: true, polyCount: 1, prepTime: 30, zone: 'Zone PF-1', destination: 'Préparation finale', status: 'à faire', retouche: 1 };
  if (mod === 3) return { flow: 'Contrôle qualité', prepNeeded: true, demasquage: false, bouchons: false, nettoyage: true, ctrl: true, polyvalent: false, polyCount: 0, prepTime: 20, zone: 'Zone PF-2', destination: 'Qualité', status: 'en cours', retouche: 0 };
  return { flow: 'Retouche', prepNeeded: true, demasquage: false, bouchons: true, nettoyage: true, ctrl: true, polyvalent: true, polyCount: 1, prepTime: 35, zone: 'Zone PF-4', destination: 'Retouche', status: 'à faire', retouche: 3 };
}

const flowBadge = (f) => `<span class='op-badge'>${f}</span>`;

export function renderDecrochePage(container) {
  function refresh() {
    const { rows, operator } = getOperatorContext('Décroche');
    const queue = [...rows].sort((a, b) => (a.task.datePrevue || '').localeCompare(b.task.datePrevue || '') || (a.task.heureDebutPrevue || '').localeCompare(b.task.heureDebutPrevue || ''));
    if (!state.selectedId && queue[0]) state.selectedId = queue[0].task.id;
    const selected = queue.find((r) => r.task.id === state.selectedId) || null;
    const k = computeCommonKpi(queue, 'Décroche');
    const profiles = queue.map((r) => ({ row: r, pf: postFlowProfile(r) }));
    const direct = profiles.filter((p) => p.pf.destination === 'Logistique').length;
    const prepFinal = profiles.filter((p) => p.pf.destination === 'Préparation finale').length;
    const demask = profiles.filter((p) => p.pf.demasquage).length;
    const quality = profiles.filter((p) => p.pf.destination === 'Qualité').length;
    const blocked = profiles.filter((p) => p.pf.destination === 'Bloqué').length;
    const prepTime = profiles.reduce((s, p) => s + p.pf.prepTime, 0);
    const retouchQty = profiles.reduce((s, p) => s + p.pf.retouche, 0);
    const nonConf = queue.reduce((s, r) => s + Number(r.task.quantiteBloquee || 0), 0);

    const selPf = selected ? postFlowProfile(selected) : null;

    container.innerHTML = `
      <article class='card'><h3>Décroche</h3><p>Flux de sortie après peinture</p><p>Date: ${new Date().toLocaleDateString('fr-FR')} | Opérateur: ${operator.prenom} ${operator.nom}</p></article>

      <article class='card'><h3>File d’attente décroche</h3><div class='prep-task-row'>${queue.map((r)=>`<button class='prep-task-card ${r.task.id===state.selectedId?'active':''}' data-task='${r.task.id}'><strong class='of-title'>${r.affaire?.numeroOF||'OF'}</strong><span><b>Client</b> ${r.client?.nom||'-'}</span><span><b>Référence</b> ${r.reference?.referencePiece||'-'}</span><span><b>Désignation</b> ${r.reference?.designationPiece||'-'}</span><span><b>Quantité</b> ${r.reference?.quantite||0}</span><span class='time-focus'><strong>Temps prévu :</strong> ${mins(r.task.tempsPrevu)}</span><div class='prep-badges'>${badge(r.task.statutTache)} ${flowBadge(postFlowProfile(r).destination)}</div></button>`).join('')}</div></article>

      <article class='card'><h3>Détail de l’affaire</h3>${selected?`<div class='prep-detail-grid'><section class='inner-card'><h4>Identification</h4><p><strong>Affaire :</strong> ${selected.affaire?.id}</p><p><strong>N° OF :</strong> ${selected.affaire?.numeroOF}</p><p><strong>Commande :</strong> ${selected.affaire?.commandeId}</p><p><strong>Client :</strong> ${selected.client?.nom}</p></section><section class='inner-card'><h4>Pièce</h4><p><strong>Référence :</strong> ${selected.reference?.referencePiece}</p><p><strong>Désignation :</strong> ${selected.reference?.designationPiece}</p><p><strong>Quantité :</strong> ${selected.reference?.quantite}</p></section><section class='inner-card'><h4>Flux atelier</h4><p><strong>Localisation :</strong> ${selected.affaire?.localisationActuelle}</p><p><strong>Étape actuelle :</strong> Décroche</p><p><strong>Destination suivante :</strong> ${selPf.destination}</p><p><strong>Statut :</strong> ${selected.task.statutTache}</p></section><section class='inner-card'><h4>Temps</h4><p><strong>Temps prévu :</strong> ${mins(selected.task.tempsPrevu)}</p><p><strong>Temps réel :</strong> ${mins(selected.task.tempsReel)}</p><p><strong>Écart :</strong> ${mins((selected.task.tempsReel||0)-(selected.task.tempsPrevu||0))}</p></section><section class='inner-card'><h4>Flux après décroche</h4><p>${flowBadge(selPf.flow)}</p><p><strong>Préparation finale nécessaire :</strong> ${selPf.prepNeeded?'Oui':'Non'}</p><p><strong>Démasquage :</strong> ${selPf.demasquage?'Oui':'Non'}</p><p><strong>Retrait bouchons :</strong> ${selPf.bouchons?'Oui':'Non'}</p><p><strong>Nettoyage final :</strong> ${selPf.nettoyage?'Oui':'Non'}</p><p><strong>Contrôle visuel complémentaire :</strong> ${selPf.ctrl?'Oui':'Non'}</p><p><strong>Opérateurs polyvalents :</strong> ${selPf.polyvalent?'Oui':'Non'} (${selPf.polyCount})</p><p><strong>Temps prévu préparation finale :</strong> ${selPf.prepTime} min</p><p><strong>Zone préparation finale :</strong> ${selPf.zone}</p></section></div>

      <h3>Déclaration opérateur</h3><form id='task-form' class='record-form'><label class='form-field'>Heure début<input id='s' name='heureDebutReelle' type='time' value='${selected.task.heureDebutReelle||''}'/></label><label class='form-field'>Heure fin<input id='e' name='heureFinReelle' type='time' value='${selected.task.heureFinReelle||''}'/></label><label class='form-field'>Temps réel calculé<input id='t' name='tempsReel' type='number' readonly value='${selected.task.tempsReel||0}'/></label><label class='form-field'>Quantité décrochée<input name='quantiteTraitee' type='number' value='${selected.task.quantiteTraitee||0}'/></label><label class='form-field'>Non-conformité<input name='quantiteBloquee' type='number' value='${selected.task.quantiteBloquee||0}'/></label><label class='form-field'>Pièces à retoucher<input name='piecesRetouche' type='number' value='${selPf.retouche}'/></label><label class='form-field'>Préparation finale nécessaire<select name='prepFinale'><option ${selPf.prepNeeded?'selected':''}>Oui</option><option ${!selPf.prepNeeded?'selected':''}>Non</option></select></label><label class='form-field'>Destination après décroche<select name='commentaireOperateur'><option ${selPf.destination==='Logistique'?'selected':''}>Logistique</option><option ${selPf.destination==='Préparation finale'?'selected':''}>Préparation finale</option><option ${selPf.destination==='Qualité'?'selected':''}>Qualité</option><option ${selPf.destination==='Retouche'?'selected':''}>Retouche</option></select></label><label class='form-field'>Qté vers logistique<input name='qteLog' type='number' value='${selPf.destination==='Logistique'?selected.reference?.quantite:0}'/></label><label class='form-field'>Qté vers préparation finale<input name='qtePrep' type='number' value='${selPf.destination==='Préparation finale'?selected.reference?.quantite:0}'/></label><label class='form-field'>Qté bloquée anomalie<input name='qteBlock' type='number' value='${selPf.destination==='Bloqué'?selected.reference?.quantite:0}'/></label><label class='form-field'>Statut final<select name='statutTache'><option>En cours</option><option>Terminée</option><option>Bloquée</option><option>Partiellement terminée</option></select></label></form><p id='time-err' class='status-error'></p><button id='save-task' class='btn'>Enregistrer</button>

      <h3>Préparation finale / démasquage</h3>${selPf.prepNeeded?`<div class='inner-card'><p><strong>Affaire :</strong> ${selected.affaire?.id}</p><p><strong>N° OF :</strong> ${selected.affaire?.numeroOF}</p><p><strong>Référence :</strong> ${selected.reference?.referencePiece}</p><p><strong>Désignation :</strong> ${selected.reference?.designationPiece}</p><p><strong>Quantité concernée :</strong> ${selected.reference?.quantite}</p><p><strong>Démasquage :</strong> ${selPf.demasquage?'Oui':'Non'}</p><p><strong>Retrait bouchons :</strong> ${selPf.bouchons?'Oui':'Non'}</p><p><strong>Nettoyage final :</strong> ${selPf.nettoyage?'Oui':'Non'}</p><p><strong>Opérateurs polyvalents requis :</strong> ${selPf.polyCount}</p><p><strong>Temps prévu :</strong> ${selPf.prepTime} min</p><p><strong>Statut :</strong> ${selPf.status}</p><p><strong>Commentaire :</strong> Suivre fiche PF-${selected.task.id}</p></div>`:'<p>Pas de préparation finale nécessaire.</p>'}

      <h3>Observation</h3><form id='obs-form' class='obs-layout'><div class='obs-left'><label class='form-field'>Type<select name='typeObservation'><option>Qualité</option><option>Anomalie</option><option>Information</option></select></label><label class='form-field'>Importance<select name='importance'><option>Faible</option><option>Moyenne</option><option>Critique</option></select></label><button id='save-obs' class='btn secondary' type='button'>Enregistrer observation</button></div><div class='obs-right'><label class='form-field obs-comment'>Commentaire<textarea name='commentaire' rows='4'></textarea></label></div></form>`:'<p>Aucune tâche.</p>'}</article>

      <article class='card'><h3>Mise à disposition</h3><div class='table-wrapper'><table><thead><tr><th>N° OF</th><th>Client</th><th>Référence</th><th>Quantité</th><th>Destination</th><th>Statut</th><th>Action attendue</th></tr></thead><tbody>${profiles.map((p)=>`<tr><td>${p.row.affaire?.numeroOF}</td><td>${p.row.client?.nom}</td><td>${p.row.reference?.referencePiece}</td><td>${p.row.reference?.quantite}</td><td>${p.pf.destination}</td><td>${p.pf.status}</td><td>${p.pf.destination==='Logistique'?'Expédier':'Traiter poste suivant'}</td></tr>`).join('')}</tbody></table></div></article>

      <article class='card'><h3>Indicateurs décroche</h3><div class='prep-indicators'><section class='indicator-card'><h4>Flux</h4><p><strong>Logistique directe :</strong> ${direct}</p><p><strong>Préparation finale :</strong> ${prepFinal}</p><p><strong>Démasquage :</strong> ${demask}</p><p><strong>Attente qualité :</strong> ${quality}</p><p><strong>Bloquées :</strong> ${blocked}</p></section><section class='indicator-card'><h4>Qualité / retouche</h4><p><strong>Non-conformités :</strong> ${nonConf}</p><p><strong>Pièces à retoucher :</strong> ${retouchQty}</p><p><strong>Observations ouvertes :</strong> ${k.openObs}</p></section><section class='indicator-card'><h4>Temps préparation finale</h4><p class='big-number'>${prepTime} min</p><p><strong>Temps prévu / réel décroche :</strong> ${k.plannedTime} / ${k.realTime} min</p></section></div></article>
    `;

    container.querySelectorAll('[data-task]').forEach((card) => card.addEventListener('click', () => { state.selectedId = Number(card.dataset.task); refresh(); }));
    const st = container.querySelector("select[name='statutTache']"); if (st && selected) st.value = selected.task.statutTache || 'En cours';

    const f = () => {
      const m = calc(container.querySelector('#s')?.value, container.querySelector('#e')?.value);
      if (m === -1) { container.querySelector('#time-err').textContent = 'Heure fin invalide'; return; }
      container.querySelector('#time-err').textContent = '';
      if (m !== null) container.querySelector('#t').value = String(m);
    };
    container.querySelector('#s')?.addEventListener('input', f);
    container.querySelector('#e')?.addEventListener('input', f);

    container.querySelector('#save-task')?.addEventListener('click', () => {
      if (!selected) return;
      if (calc(container.querySelector('#s').value, container.querySelector('#e').value) === -1) return;
      saveTaskUpdate(selected.task.id, container.querySelector('#task-form'));
      refresh();
    });

    container.querySelector('#save-obs')?.addEventListener('click', () => {
      if (!selected) return;
      saveObservation(selected, 'Décroche', container.querySelector('#obs-form'));
      refresh();
    });
  }

  refresh();
}
