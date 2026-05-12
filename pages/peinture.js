import { badge, computeCommonKpi, getOperatorContext, mins, saveObservation, saveTaskUpdate } from './operatorCommon.js';

const state = { selectedId: null };

const calcMinutes = (s, e) => {
  if (!s || !e) return null;
  const [sh, sm] = s.split(':').map(Number);
  const [eh, em] = e.split(':').map(Number);
  const d = eh * 60 + em - (sh * 60 + sm);
  return d >= 0 ? d : -1;
};

export function renderPeinturePage(container) {
  function refresh() {
    const { rows, operator } = getOperatorContext('Peinture');
    const queue = [...rows].sort((a, b) => (a.task.datePrevue || '').localeCompare(b.task.datePrevue || '') || (a.task.heureDebutPrevue || '').localeCompare(b.task.heureDebutPrevue || ''));
    if (!state.selectedId && queue[0]) state.selectedId = queue[0].task.id;
    const current = queue.find((r) => r.task.id === state.selectedId) || null;
    const next = queue.filter((r) => r.task.id !== current?.task.id);
    const k = computeCommonKpi(queue, 'Peinture');
    const nc = queue.reduce((s, r) => s + Number(r.task.quantiteBloquee || 0), 0);
    const consoPrev = queue.reduce((s, r) => s + (r.reference?.quantite || 0) * 0.08, 0);
    const consoReal = queue.reduce((s, r) => s + Number(r.task.commentaireOperateur || 0), 0);
    const efficiency = k.realTime ? Math.min(100, Math.round((k.plannedTime / k.realTime) * 100)) : 0;
    const alerts = queue.filter((r) => (r.reference?.quantite || 0) > 30);

    container.innerHTML = `
      <article class='card'>
        <h3>Peinture</h3>
        <p>Production en cours, anticipation produits et paramètres process</p>
        <p>Date: ${new Date().toLocaleDateString('fr-FR')} | Opérateur: ${operator.prenom} ${operator.nom}</p>
      </article>

      <article class='card'>
        <h3>Productions à peindre</h3>
        <div class='prep-task-row'>
          ${queue.map((r) => `<button type='button' class='prep-task-card ${r.task.id === state.selectedId ? 'active' : ''}' data-task='${r.task.id}'>
            <strong class='of-title'>${r.affaire?.numeroOF || 'OF'}</strong>
            <span><b>Client</b> ${r.client?.nom || '-'}</span>
            <span><b>Référence</b> ${r.reference?.referencePiece || '-'}</span>
            <span><b>Désignation</b> ${r.reference?.designationPiece || '-'}</span>
            <span><b>Quantité</b> ${r.reference?.quantite || 0}</span>
            <span><b>Couleur / teinte</b> ${r.reference?.couleur || '-'}</span>
            <span><b>Produit</b> Poudre standard</span>
            <span><b>Traitement</b> ${r.reference?.traitement || '-'}</span>
            <span class='time-focus'><strong>Temps prévu :</strong> ${mins(r.task.tempsPrevu)}</span>
            <div class='prep-badges'>${badge(r.task.priorite)} ${badge(r.task.statutTache)}</div>
          </button>`).join('')}
        </div>
      </article>

      <article class='card'>
        <h3>Détail de l’affaire</h3>
        ${current ? `
          <div class='prep-detail-grid'>
            <section class='inner-card'><h4>Identification</h4><p><strong>Affaire :</strong> ${current.affaire?.id}</p><p><strong>N° OF :</strong> ${current.affaire?.numeroOF}</p><p><strong>Commande :</strong> ${current.affaire?.commandeId}</p><p><strong>Client :</strong> ${current.client?.nom}</p></section>
            <section class='inner-card'><h4>Pièce</h4><p><strong>Référence :</strong> ${current.reference?.referencePiece}</p><p><strong>Désignation :</strong> ${current.reference?.designationPiece}</p><p><strong>Quantité :</strong> ${current.reference?.quantite}</p><p><strong>Matière :</strong> ${current.reference?.matiere}</p><p><strong>Traitement :</strong> ${current.reference?.traitement}</p><p><strong>Couleur / teinte :</strong> ${current.reference?.couleur}</p></section>
            <section class='inner-card'><h4>Flux atelier</h4><p><strong>Localisation actuelle :</strong> ${current.affaire?.localisationActuelle}</p><p><strong>Étape actuelle :</strong> Peinture</p><p><strong>Prochaine étape :</strong> Décroche</p><p><strong>Priorité :</strong> ${current.task.priorite}</p><p><strong>Statut :</strong> ${current.task.statutTache}</p></section>
            <section class='inner-card'><h4>Temps</h4><p><strong>Temps prévu :</strong> ${mins(current.task.tempsPrevu)}</p><p><strong>Temps réel :</strong> ${mins(current.task.tempsReel)}</p><p><strong>Écart :</strong> ${mins((current.task.tempsReel || 0) - (current.task.tempsPrevu || 0))}</p></section>
            <section class='inner-card'><h4>Besoins peinture</h4><p><strong>Type de peinture :</strong> Poudre</p><p><strong>Produit / poudre :</strong> Poudre standard</p><p><strong>Teinte :</strong> ${current.reference?.couleur}</p><p><strong>Consommation prévue :</strong> ${((current.reference?.quantite || 0) * 0.08).toFixed(1)} kg</p><p><strong>Consommation réelle :</strong> ${Number(current.task.commentaireOperateur || 0).toFixed(1)} kg</p><p><strong>Température :</strong> 180°C</p><p><strong>Temps polymérisation :</strong> 20 min</p><p><strong>Vitesse chaîne :</strong> standard</p><p><strong>Points de vigilance :</strong> homogénéité teinte et épaisseur</p></section>
          </div>

          <h3>Déclaration peintre</h3>
          <form id='task-form' class='record-form'>
            <label class='form-field'>Heure début<input id='s' name='heureDebutReelle' type='time' value='${current.task.heureDebutReelle || ''}' /></label>
            <label class='form-field'>Heure fin<input id='e' name='heureFinReelle' type='time' value='${current.task.heureFinReelle || ''}' /></label>
            <label class='form-field'>Temps réel calculé<input id='t' name='tempsReel' type='number' readonly value='${current.task.tempsReel || 0}' /></label>
            <label class='form-field'>Quantité peinte<input name='quantiteTraitee' type='number' value='${current.task.quantiteTraitee || 0}' /></label>
            <label class='form-field'>Non-conformité<input name='quantiteBloquee' type='number' value='${current.task.quantiteBloquee || 0}' /></label>
            <label class='form-field'>Consommation réelle (kg)<input name='commentaireOperateur' type='number' step='0.1' value='${current.task.commentaireOperateur || 0}' /></label>
            <label class='form-field'>Statut final<select name='statutTache'><option>En cours</option><option>Terminée</option><option>Bloquée</option><option>Partiellement terminée</option></select></label>
          </form>
          <p id='time-err' class='status-error'></p>
          <button id='save-task' class='btn'>Enregistrer</button>

          <h3>Observation</h3>
          <form id='obs-form' class='obs-layout'>
            <div class='obs-left'>
              <label class='form-field'>Type<select name='typeObservation'><option>Qualité</option><option>Manque consommable</option><option>Retard</option></select></label>
              <label class='form-field'>Importance<select name='importance'><option>Faible</option><option>Moyenne</option><option>Critique</option></select></label>
              <button id='save-obs' class='btn secondary' type='button'>Enregistrer observation</button>
            </div>
            <div class='obs-right'>
              <label class='form-field obs-comment'>Commentaire<textarea name='commentaire' rows='4'></textarea></label>
            </div>
          </form>
        ` : '<p>Aucune tâche.</p>'}
      </article>

      <article class='card'>
        <h3>Prochaines productions à préparer</h3>
        <div class='table-wrapper'>
          <table>
            <thead><tr><th>Ordre</th><th>N° OF</th><th>Client</th><th>Référence</th><th>Désignation</th><th>Qté</th><th>Couleur</th><th>Produit / poudre</th><th>Consommation prévue</th><th>Temps prévu</th><th>Alerte stock</th></tr></thead>
            <tbody>${next.map((r, i) => `<tr><td>${i + 1}</td><td>${r.affaire?.numeroOF}</td><td>${r.client?.nom}</td><td>${r.reference?.referencePiece}</td><td>${r.reference?.designationPiece}</td><td>${r.reference?.quantite}</td><td>${r.reference?.couleur}</td><td>Poudre standard</td><td>${((r.reference?.quantite || 0) * 0.08).toFixed(1)} kg</td><td>${mins(r.task.tempsPrevu)}</td><td>${(r.reference?.quantite || 0) > 30 ? 'Alerte' : 'OK'}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </article>

      <article class='card'>
        <h3>Indicateurs peinture</h3>
        <div class='prep-indicators'>
          <section class='indicator-card'><h4>Nombre d’affaires</h4><p class='big-number'>${queue.length}</p><p><strong>Alertes produits :</strong> ${alerts.length}</p><p><strong>Observations ouvertes :</strong> ${k.openObs}</p></section>
          <section class='indicator-card'><h4>À peindre / En cours / Terminées</h4><div class='bar-wrap'><span style='width:${Math.min(100, (queue.length - k.done) * 10)}%'>À peindre ${queue.length - k.done}</span><span class='done' style='width:${Math.min(100, queue.filter((r) => r.task.statutTache === 'En cours').length * 20)}%'>En cours ${queue.filter((r) => r.task.statutTache === 'En cours').length}</span><span class='done' style='width:${Math.min(100, k.done * 10)}%'>Terminées ${k.done}</span></div></section>
          <section class='indicator-card'><h4>Efficacité</h4><div class='ring' style='--pct:${efficiency};'><span>${k.realTime ? `${efficiency}%` : 'Non calculé'}</span></div><p><strong>Consommation prévue / réelle :</strong> ${consoPrev.toFixed(1)} / ${consoReal.toFixed(1)} kg</p><p><strong>Non-conformités :</strong> ${nc}</p></section>
        </div>
      </article>

      <article class='card'>
        <h3>Alertes produits peinture</h3>
        <ul>${alerts.map((r) => `<li><strong>Produit:</strong> Poudre ${r.reference?.couleur} | <strong>Stock actuel:</strong> ${Math.max(5, 40 - (r.reference?.quantite || 0))} kg | <strong>Seuil minimum:</strong> 12 kg | <strong>Statut:</strong> Alerte | <strong>Action suggérée:</strong> lancer réapprovisionnement</li>`).join('') || '<li>Aucune alerte produit.</li>'}</ul>
      </article>
    `;

    container.querySelectorAll('[data-task]').forEach((card) => card.addEventListener('click', () => { state.selectedId = Number(card.dataset.task); refresh(); }));
    const statusSelect = container.querySelector("select[name='statutTache']");
    if (statusSelect && current) statusSelect.value = current.task.statutTache || 'En cours';

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
      if (!current) return;
      const minutes = calcMinutes(container.querySelector('#s').value, container.querySelector('#e').value);
      if (minutes === -1) return;
      saveTaskUpdate(current.task.id, container.querySelector('#task-form'));
      refresh();
    });

    container.querySelector('#save-obs')?.addEventListener('click', () => {
      if (!current) return;
      saveObservation(current, 'Peinture', container.querySelector('#obs-form'));
      refresh();
    });
  }

  refresh();
}
