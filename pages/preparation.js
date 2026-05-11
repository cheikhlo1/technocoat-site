import { badge, computeCommonKpi, getOperatorContext, kpiCards, mins, saveObservation, saveTaskUpdate } from './operatorCommon.js';

const state = { selectedId: null };

export function renderPreparationPage(container) {
  function refresh() {
    const { rows, operator } = getOperatorContext('Préparation');
    if (!state.selectedId && rows[0]) state.selectedId = rows[0].task.id;
    const selected = rows.find((r) => r.task.id === state.selectedId) || null;
    const k = computeCommonKpi(rows, 'Préparation');

    container.innerHTML = `<article class="card"><h3>Préparation</h3><p>Tâches assignées, masquage, préparation avant production</p><p>Date: ${new Date().toLocaleDateString('fr-FR')} | Opérateur: ${operator.prenom} ${operator.nom} | Activité: Préparation</p></article>
    ${kpiCards([{label:'Tâches prévues aujourd’hui',value:k.planned},{label:'Tâches terminées',value:k.done},{label:'Tâches en retard',value:k.late},{label:'Temps prévu total',value:mins(k.plannedTime)},{label:'Temps réel déclaré',value:mins(k.realTime)},{label:'Écart temps',value:mins(k.gap)},{label:'Observations ouvertes',value:k.openObs},{label:'Taux de réalisation',value:`${k.rate}%`}])}
    <article class="card"><h3>Graphiques rapides</h3><p>Prévu/Terminé: ${k.planned} / ${k.done}</p><p>Temps prévu/réel: ${k.plannedTime} / ${k.realTime} min</p></article>
    <article class="card"><h3>Liste des tâches du jour</h3><div class="table-wrapper"><table><thead><tr><th>Affaire</th><th>N° OF</th><th>Client</th><th>Référence</th><th>Désignation</th><th>Qté</th><th>Priorité</th><th>Temps prévu</th><th>Statut</th><th>Localisation</th><th>Ressources</th><th>Ordre</th><th>Action</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${r.affaire?.id||''}</td><td>${r.affaire?.numeroOF||''}</td><td>${r.client?.nom||''}</td><td>${r.reference?.referencePiece||''}</td><td>${r.reference?.designationPiece||''}</td><td>${r.reference?.quantite||''}</td><td>${badge(r.task.priorite)}</td><td>${mins(r.task.tempsPrevu)}</td><td>${badge(r.task.statutTache)}</td><td>${r.affaire?.localisationActuelle||''}</td><td>Masquage standard</td><td><button class='btn secondary up' data-i='${i}'>Monter</button><button class='btn secondary down' data-i='${i}'>Descendre</button></td><td><button class='btn op-view' data-id='${r.task.id}'>Voir détail</button></td></tr>`).join('')}</tbody></table></div></article>
    <article class="card">${selected?`<h3>Détail tâche sélectionnée</h3><p>Affaire: ${selected.affaire?.id} | N° OF: ${selected.affaire?.numeroOF} | Commande: ${selected.affaire?.commandeId} | Client: ${selected.client?.nom}</p><p>Référence: ${selected.reference?.referencePiece} | Désignation: ${selected.reference?.designationPiece} | Quantité: ${selected.reference?.quantite}</p><p>Étape actuelle: Préparation | Prochaine étape: Accroche | Localisation: ${selected.affaire?.localisationActuelle}</p><p>Priorité: ${selected.task.priorite} | Statut: ${selected.task.statutTache} | Fiche instruction: Standard PREP-01</p>`:'<p>Aucune tâche.</p>'}
    <h3>Besoins préparation</h3><ul><li>Type de préparation</li><li>Type de masquage</li><li>Zones à protéger</li><li>Bouchons</li><li>Adhésifs</li><li>Chiffons</li><li>Gants</li><li>Outillage nécessaire</li><li>Points de vigilance</li></ul>
    <h3>Déclaration opérateur</h3><form id='task-form' class='record-form'><input name='heureDebutReelle' type='time' value='${selected?.task.heureDebutReelle||''}'/><input name='heureFinReelle' type='time' value='${selected?.task.heureFinReelle||''}'/><input name='tempsReel' type='number' value='${selected?.task.tempsReel||0}'/><input name='quantiteTraitee' type='number' value='${selected?.task.quantiteTraitee||0}'/><input name='quantiteBloquee' type='number' value='${selected?.task.quantiteBloquee||0}'/><select name='statutTache'><option>En cours</option><option>Terminée</option><option>Bloquée</option><option>Partiellement terminée</option></select><input name='commentaireOperateur' type='text' value='${selected?.task.commentaireOperateur||''}'/></form><button class='btn' id='save-task'>Enregistrer</button>
    <h3>Observation / REX</h3><form id='obs-form' class='record-form'><select name='typeObservation'><option>Anomalie</option><option>Amélioration</option><option>Information</option><option>Retard</option><option>Manque consommable</option><option>Outillage</option><option>Qualité</option></select><select name='importance'><option>Faible</option><option>Moyenne</option><option>Critique</option></select><input name='commentaire' type='text'/></form><button class='btn secondary' id='save-obs'>Enregistrer observation</button></article>`;

    container.querySelectorAll('.op-view').forEach((b)=>b.onclick=()=>{state.selectedId=Number(b.dataset.id);refresh();});
    container.querySelector('#save-task')?.addEventListener('click',()=>{if(!selected)return;saveTaskUpdate(selected.task.id,container.querySelector('#task-form'));refresh();});
    container.querySelector('#save-obs')?.addEventListener('click',()=>{if(!selected)return;saveObservation(selected,'Préparation',container.querySelector('#obs-form'));refresh();});
  }
  refresh();
}
