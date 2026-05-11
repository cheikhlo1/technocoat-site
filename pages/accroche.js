import { badge, computeCommonKpi, getOperatorContext, mins, saveObservation, saveTaskUpdate } from './operatorCommon.js';

const calcMinutes = (s, e) => {
  if (!s || !e) return null;
  const [sh, sm] = s.split(':').map(Number);
  const [eh, em] = e.split(':').map(Number);
  const d = eh * 60 + em - (sh * 60 + sm);
  return d >= 0 ? d : -1;
};

export function renderAccrochePage(container) {
  function refresh() {
    const { rows, operator } = getOperatorContext('Accroche');
    const current = rows.find((r) => r.task.statutTache === 'En cours') || rows[0] || null;
    const queue = rows.filter((r) => r.task.id !== current?.task.id);
    const k = computeCommonKpi(rows, 'Accroche');
    const totalQty = rows.reduce((s, r) => s + Number(r.task.quantiteTraitee || 0), 0);
    const nc = rows.reduce((s, r) => s + Number(r.task.quantiteBloquee || 0), 0);

    container.innerHTML = `<article class='card'><h3>Accroche</h3><p>Mise en place des pièces sur outillages avant traitement</p><p>Date: ${new Date().toLocaleDateString('fr-FR')} | Opérateur: ${operator.prenom} ${operator.nom}</p></article>
    <section class='operator-grid'><article class='card'><h3>File d’attente accroche</h3><ul>${queue.map((r)=>`<li><strong>${r.affaire?.numeroOF}</strong> - ${r.client?.nom} - ${r.reference?.referencePiece} - ${badge(r.task.priorite)}</li>`).join('') || '<li>Aucune tâche</li>'}</ul></article><article class='card'><h3>Affaire en cours d’accrochage</h3>${current?`<p><strong>N° OF :</strong> ${current.affaire?.numeroOF}</p><p><strong>Client :</strong> ${current.client?.nom}</p><p><strong>Référence :</strong> ${current.reference?.referencePiece}</p><p><strong>Désignation :</strong> ${current.reference?.designationPiece}</p><p><strong>Quantité :</strong> ${current.reference?.quantite}</p><p><strong>Mode d’accrochage :</strong> standard balancelle</p><p><strong>Crochets / outillage :</strong> crochets A12, balancelle L2</p><p><strong>Points de vigilance :</strong> stabilité et espacement</p>`:'<p>Aucune tâche en cours.</p>'}</article></section>
    <article class='card'><h3>Déclaration opérateur</h3><form id='task-form' class='record-form'><label class='form-field'>Heure début<input id='s' name='heureDebutReelle' type='time' value='${current?.task.heureDebutReelle||''}'/></label><label class='form-field'>Heure fin<input id='e' name='heureFinReelle' type='time' value='${current?.task.heureFinReelle||''}'/></label><label class='form-field'>Temps réel calculé<input id='t' name='tempsReel' type='number' readonly value='${current?.task.tempsReel||0}'/></label><label class='form-field'>Quantité accrochée<input name='quantiteTraitee' type='number' value='${current?.task.quantiteTraitee||0}'/></label><label class='form-field'>Non-conformité<input name='quantiteBloquee' type='number' value='${current?.task.quantiteBloquee||0}'/></label><label class='form-field'>Statut final<select name='statutTache'><option>En cours</option><option>Terminée</option><option>Bloquée</option><option>Partiellement terminée</option></select></label></form><p id='time-err' class='status-error'></p><button id='save-task' class='btn'>Enregistrer</button>
    <h3>Observation</h3><form id='obs-form' class='obs-layout'><div class='obs-left'><label class='form-field'>Type<select name='typeObservation'><option>Outillage</option><option>Anomalie</option><option>Retard</option></select></label><label class='form-field'>Importance<select name='importance'><option>Faible</option><option>Moyenne</option><option>Critique</option></select></label><button id='save-obs' class='btn secondary' type='button'>Enregistrer observation</button></div><div class='obs-right'><label class='form-field obs-comment'>Commentaire<textarea name='commentaire' rows='4'></textarea></label></div></form></article>
    <article class='card'><h3>Indicateurs poste accroche</h3><div class='prep-indicators'><section class='indicator-card'><h4>Affaires en attente</h4><p class='big-number'>${queue.length}</p></section><section class='indicator-card'><h4>Temps prévu / réel</h4><p>${k.plannedTime} / ${k.realTime} min</p><div class='bar-wrap'><span style='width:${Math.min(100,k.planned*12)}%'>Prévues ${k.planned}</span><span class='done' style='width:${Math.min(100,k.done*12)}%'>Réalisées ${k.done}</span></div></section><section class='indicator-card'><h4>Saturation poste</h4><p><strong>Qté accrochée :</strong> ${totalQty}</p><p><strong>Non-conformités :</strong> ${nc}</p></section></div></article>`;

    const st = container.querySelector("select[name='statutTache']"); if (st && current) st.value = current.task.statutTache || 'En cours';
    const compute = ()=>{const m=calcMinutes(container.querySelector('#s')?.value,container.querySelector('#e')?.value); if(m===-1){container.querySelector('#time-err').textContent='Heure fin inférieure à début';return;} container.querySelector('#time-err').textContent=''; if(m!==null) container.querySelector('#t').value=String(m);};
    container.querySelector('#s')?.addEventListener('input',compute); container.querySelector('#e')?.addEventListener('input',compute);
    container.querySelector('#save-task')?.addEventListener('click',()=>{if(!current)return; const m=calcMinutes(container.querySelector('#s').value,container.querySelector('#e').value); if(m===-1) return; saveTaskUpdate(current.task.id,container.querySelector('#task-form')); refresh();});
    container.querySelector('#save-obs')?.addEventListener('click',()=>{if(!current)return; saveObservation(current,'Accroche',container.querySelector('#obs-form')); refresh();});
  }
  refresh();
}
