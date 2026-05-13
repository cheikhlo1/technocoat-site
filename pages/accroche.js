import { badge, computeCommonKpi, getOperatorContext, kpiCards, mins, renderOperatorDetailBlocks, renderOperatorIndicators, saveObservation, saveTaskUpdate } from './operatorCommon.js';

const state = { selectedId: null };

const calcMinutes = (s, e) => {
  if (!s || !e) return null;
  const [sh, sm] = s.split(':').map(Number);
  const [eh, em] = e.split(':').map(Number);
  const delta = eh * 60 + em - (sh * 60 + sm);
  return delta >= 0 ? delta : -1;
};

export function renderAccrochePage(container) {
  function refresh() {
    const { rows, operator } = getOperatorContext('Accroche');
    const queue = [...rows].sort((a, b) => (a.task.datePrevue || '').localeCompare(b.task.datePrevue || '') || (a.task.heureDebutPrevue || '').localeCompare(b.task.heureDebutPrevue || ''));
    if (!state.selectedId && queue[0]) state.selectedId = queue[0].task.id;
    const selected = queue.find((r) => r.task.id === state.selectedId) || null;
    const k = computeCommonKpi(queue, 'Accroche');
    const waiting = queue.filter((r) => r.task.statutTache !== 'Terminée').length;
    const inProgress = queue.filter((r) => r.task.statutTache === 'En cours').length;
    const done = queue.filter((r) => r.task.statutTache === 'Terminée').length;
    const nc = queue.reduce((s, r) => s + Number(r.task.quantiteBloquee || 0), 0);
    const efficiency = k.realTime ? Math.min(100, Math.round((k.plannedTime / k.realTime) * 100)) : 0;

    container.innerHTML = `
      <article class='card'>
        <h3>Accroche</h3>
        <p>Mise en place des pièces sur outillages avant traitement</p>
        <p>Date: ${new Date().toLocaleDateString('fr-FR')} | Opérateur: ${operator.prenom} ${operator.nom}</p>
      </article>

      <article class='card'>
        <h3>File d’attente accroche</h3>
        <div class='prep-task-row'>
          ${queue.map((r) => `<button type='button' class='prep-task-card ${r.task.id === state.selectedId ? 'active' : ''}' data-task='${r.task.id}'>
            <strong class='of-title'>${r.affaire?.numeroOF || 'OF'}</strong>
            <span><b>Client</b> ${r.client?.nom || '-'}</span>
            <span><b>Référence</b> ${r.reference?.referencePiece || '-'}</span>
            <span><b>Désignation</b> ${r.reference?.designationPiece || '-'}</span>
            <span><b>Quantité</b> ${r.reference?.quantite || 0}</span>
            <span class='time-focus'><strong>Temps prévu :</strong> ${mins(r.task.tempsPrevu)}</span>
            <div class='prep-badges'>${badge(r.task.priorite)} ${badge(r.task.statutTache)}</div>
          </button>`).join('')}
        </div>
      </article>

      <article class='card'>
        <h3>Détail de l’affaire</h3>
        ${selected ? `
          <div class='prep-detail-grid'>
            <section class='inner-card'><h4>Identification</h4><p><strong>Affaire :</strong> ${selected.affaire?.id}</p><p><strong>N° OF :</strong> ${selected.affaire?.numeroOF}</p><p><strong>Commande :</strong> ${selected.affaire?.commandeId}</p><p><strong>Client :</strong> ${selected.client?.nom}</p></section>
            <section class='inner-card'><h4>Pièce</h4><p><strong>Référence :</strong> ${selected.reference?.referencePiece}</p><p><strong>Désignation :</strong> ${selected.reference?.designationPiece}</p><p><strong>Quantité :</strong> ${selected.reference?.quantite}</p><p><strong>Matière :</strong> ${selected.reference?.matiere}</p><p><strong>Traitement :</strong> ${selected.reference?.traitement}</p><p><strong>Couleur :</strong> ${selected.reference?.couleur}</p></section>
            <section class='inner-card'><h4>Flux atelier</h4><p><strong>Localisation actuelle :</strong> ${selected.affaire?.localisationActuelle}</p><p><strong>Étape actuelle :</strong> Accroche</p><p><strong>Prochaine étape :</strong> Peinture</p><p><strong>Priorité :</strong> ${selected.task.priorite}</p><p><strong>Statut :</strong> ${selected.task.statutTache}</p></section>
            <section class='inner-card'><h4>Temps</h4><p><strong>Temps prévu :</strong> ${mins(selected.task.tempsPrevu)}</p><p><strong>Temps réel :</strong> ${mins(selected.task.tempsReel)}</p><p><strong>Écart :</strong> ${mins((selected.task.tempsReel || 0) - (selected.task.tempsPrevu || 0))}</p></section>
            <section class='inner-card'><h4>Besoins accroche</h4><p><strong>Mode d’accrochage :</strong> standard ligne continue</p><p><strong>Crochets / outillage :</strong> crochets A12, clé de réglage</p><p><strong>Balancelles :</strong> L2 / L3 selon gabarit</p><p><strong>Points de vigilance :</strong> centrage et stabilité des pièces</p></section>
          </div>

          <h3>Déclaration opérateur</h3>
          <form id='task-form' class='record-form'>
            <label class='form-field'>Heure début<input id='s' name='heureDebutReelle' type='time' value='${selected.task.heureDebutReelle || ''}' /></label>
            <label class='form-field'>Heure fin<input id='e' name='heureFinReelle' type='time' value='${selected.task.heureFinReelle || ''}' /></label>
            <label class='form-field'>Temps réel calculé<input id='t' name='tempsReel' type='number' readonly value='${selected.task.tempsReel || 0}' /></label>
            <label class='form-field'>Quantité accrochée<input name='quantiteTraitee' type='number' value='${selected.task.quantiteTraitee || 0}' /></label>
            <label class='form-field'>Non-conformité<input name='quantiteBloquee' type='number' value='${selected.task.quantiteBloquee || 0}' /></label>
            <label class='form-field'>Statut final<select name='statutTache'><option>En cours</option><option>Terminée</option><option>Bloquée</option><option>Partiellement terminée</option></select></label>
          </form>
          <p id='time-err' class='status-error'></p>
          <button id='save-task' class='btn'>Enregistrer</button>

          <h3>Observation</h3>
          <form id='obs-form' class='obs-layout'>
            <div class='obs-left'>
              <label class='form-field'>Type<select name='typeObservation'><option>Outillage</option><option>Anomalie</option><option>Retard</option></select></label>
              <label class='form-field'>Importance<select name='importance'><option>Faible</option><option>Moyenne</option><option>Critique</option></select></label>
              <button id='save-obs' class='btn secondary' type='button'>Enregistrer observation</button>
            </div>
            <div class='obs-right'>
              <label class='form-field obs-comment'>Commentaire<textarea name='commentaire' rows='4'></textarea></label>
            </div>
          </form>
        ` : '${kpiCards([{ label: 'Aucune tâche', value: 0 }])}'}
      </article>

      <article class='card'>
        <h3>Indicateurs accroche</h3>
        <div class='prep-indicators'>
          <section class='indicator-card'><h4>Nombre d’affaires</h4><p class='big-number'>${queue.length}</p><p><strong>Observations ouvertes :</strong> ${k.openObs}</p><p><strong>Non-conformités :</strong> ${nc}</p></section>
          <section class='indicator-card'><h4>En attente / En cours / Terminées</h4><div class='bar-wrap'><span style='width:${Math.min(100, waiting * 10)}%'>En attente ${waiting}</span><span class='done' style='width:${Math.min(100, inProgress * 20)}%'>En cours ${inProgress}</span><span class='done' style='width:${Math.min(100, done * 10)}%'>Terminées ${done}</span></div></section>
          <section class='indicator-card'><h4>Efficacité</h4><div class='ring' style='--pct:${efficiency};'><span>${k.realTime ? `${efficiency}%` : 'Non calculé'}</span></div><p><strong>Temps prévu :</strong> ${k.plannedTime} min</p><p><strong>Temps réel :</strong> ${k.realTime} min</p></section>
        </div>
      </article>
    `;

    container.querySelectorAll('[data-task]').forEach((card) => card.addEventListener('click', () => { state.selectedId = Number(card.dataset.task); refresh(); }));
    const statusSelect = container.querySelector("select[name='statutTache']");
    if (statusSelect && selected) statusSelect.value = selected.task.statutTache || 'En cours';

    const compute = () => {
      const minutes = calcMinutes(container.querySelector('#s')?.value, container.querySelector('#e')?.value);
      if (minutes === -1) {
        container.querySelector('#time-err').textContent = 'Heure fin inférieure à début';
        return;
      }
      container.querySelector('#time-err').textContent = '';
      if (minutes !== null) container.querySelector('#t').value = String(minutes);
    };

    container.querySelector('#s')?.addEventListener('input', compute);
    container.querySelector('#e')?.addEventListener('input', compute);

    container.querySelector('#save-task')?.addEventListener('click', () => {
      if (!selected) return;
      const minutes = calcMinutes(container.querySelector('#s').value, container.querySelector('#e').value);
      if (minutes === -1) return;
      saveTaskUpdate(selected.task.id, container.querySelector('#task-form'));
      refresh();
    });

    container.querySelector('#save-obs')?.addEventListener('click', () => {
      if (!selected) return;
      saveObservation(selected, 'Accroche', container.querySelector('#obs-form'));
      refresh();
    });
  }

  refresh();
}
