import { badge, computeCommonKpi, getOperatorContext, kpiCards, mins, saveObservation, saveTaskUpdate } from './operatorCommon.js';

const state = { selectedId: null };
const prioRank = { Haute: 1, Moyenne: 2, Basse: 3 };

function sortPreparation(rows) {
  return [...rows].sort((a, b) => {
    const orderA = Number(a.task.ordrePassage ?? 9999);
    const orderB = Number(b.task.ordrePassage ?? 9999);
    if (orderA !== orderB) return orderA - orderB;
    const pa = prioRank[a.task.priorite] ?? 9;
    const pb = prioRank[b.task.priorite] ?? 9;
    if (pa !== pb) return pa - pb;
    if ((a.task.datePrevue || '') !== (b.task.datePrevue || '')) return (a.task.datePrevue || '').localeCompare(b.task.datePrevue || '');
    return (a.task.heureDebutPrevue || '').localeCompare(b.task.heureDebutPrevue || '');
  });
}

export function renderPreparationPage(container) {
  function refresh() {
    const { rows: baseRows, operator } = getOperatorContext('Préparation');
    const rows = sortPreparation(baseRows);
    if (!state.selectedId && rows[0]) state.selectedId = rows[0].task.id;
    const selected = rows.find((r) => r.task.id === state.selectedId) || null;
    const k = computeCommonKpi(rows, 'Préparation');
    const qtyPrepared = rows.reduce((s, r) => s + Number(r.task.quantiteTraitee || 0), 0);
    const qtyBlocked = rows.reduce((s, r) => s + Number(r.task.quantiteBloquee || 0), 0);
    const perfWeek = k.planned ? Math.round(((k.done + Math.max(0, k.planned - k.late)) / k.planned) * 100) : 0;

    container.innerHTML = `
      <article class="card">
        <h3>Préparation</h3>
        <p>Tâches assignées, masquage, préparation avant production</p>
        <p>Date: ${new Date().toLocaleDateString('fr-FR')} | Opérateur: ${operator.prenom} ${operator.nom} | Activité: Préparation</p>
      </article>

      <article class="card">
        <h3>Tâches du jour</h3>
        <div class="prep-task-row">
          ${rows.map((r) => `<button type="button" class="prep-task-card ${r.task.id === state.selectedId ? 'active' : ''}" data-task-id="${r.task.id}">
            <strong>${r.affaire?.numeroOF || 'OF non défini'}</strong>
            <span>Client: ${r.client?.nom || '-'}</span>
            <span>${r.reference?.referencePiece || '-'} - ${r.reference?.designationPiece || '-'}</span>
            <span>Quantité: ${r.reference?.quantite || 0}</span>
            <span>Temps prévu: ${mins(r.task.tempsPrevu)}</span>
            <div class="prep-badges">${badge(r.task.priorite)} ${badge(r.task.statutTache)}</div>
          </button>`).join('')}
        </div>
      </article>

      <article class="card">
        <h3>Détail de l’affaire sélectionnée</h3>
        ${selected ? `
          <p>Affaire: ${selected.affaire?.id} | N° OF: ${selected.affaire?.numeroOF} | Commande: ${selected.affaire?.commandeId} | Client: ${selected.client?.nom}</p>
          <p>Référence pièce: ${selected.reference?.referencePiece} | Désignation: ${selected.reference?.designationPiece} | Quantité: ${selected.reference?.quantite}</p>
          <p>Matière: ${selected.reference?.matiere} | Traitement: ${selected.reference?.traitement} | Couleur: ${selected.reference?.couleur}</p>
          <p>Localisation actuelle: ${selected.affaire?.localisationActuelle} | Étape actuelle: Préparation | Prochaine étape: Accroche</p>
          <p>Priorité: ${selected.task.priorite} | Statut: ${selected.task.statutTache} | Temps prévu: ${mins(selected.task.tempsPrevu)} | Temps réel: ${mins(selected.task.tempsReel)}</p>
          <h3>Besoins préparation</h3>
          <ul>
            <li>Type de préparation: standard atelier</li>
            <li>Type de masquage: mixte adhésif / bouchons</li>
            <li>Zones à protéger: perçages et plans de portée</li>
            <li>Consommables nécessaires: bouchons, adhésifs, chiffons, gants</li>
            <li>Outillage nécessaire: poste de masquage, cutter sécurité, rack</li>
            <li>Fiche instruction: PREP-01</li>
            <li>Points de vigilance: conformité masquage et traçabilité lot</li>
          </ul>

          <h3>Déclaration opérateur</h3>
          <form id="task-form" class="record-form">
            <label class="form-field">Heure début réelle<input name="heureDebutReelle" type="time" value="${selected.task.heureDebutReelle || ''}" /></label>
            <label class="form-field">Heure fin réelle<input name="heureFinReelle" type="time" value="${selected.task.heureFinReelle || ''}" /></label>
            <label class="form-field">Temps réel passé<input name="tempsReel" type="number" value="${selected.task.tempsReel || 0}" /></label>
            <label class="form-field">Quantité préparée<input name="quantiteTraitee" type="number" value="${selected.task.quantiteTraitee || 0}" /></label>
            <label class="form-field">Quantité bloquée<input name="quantiteBloquee" type="number" value="${selected.task.quantiteBloquee || 0}" /></label>
            <label class="form-field">Statut final<select name="statutTache"><option>En cours</option><option>Terminée</option><option>Bloquée</option><option>Partiellement terminée</option></select></label>
            <label class="form-field">Commentaire opérateur<input name="commentaireOperateur" type="text" value="${selected.task.commentaireOperateur || ''}" /></label>
          </form>
          <button id="save-task" class="btn" type="button">Enregistrer la déclaration</button>

          <h3>Observation / Retour d’expérience</h3>
          <form id="obs-form" class="record-form">
            <label class="form-field">Type d’observation<select name="typeObservation"><option>Anomalie</option><option>Amélioration</option><option>Information</option><option>Retard</option><option>Manque consommable</option><option>Outillage</option><option>Qualité</option></select></label>
            <label class="form-field">Importance<select name="importance"><option>Faible</option><option>Moyenne</option><option>Critique</option></select></label>
            <label class="form-field">Commentaire<input name="commentaire" type="text" /></label>
          </form>
          <button id="save-obs" class="btn secondary" type="button">Enregistrer observation</button>
        ` : '<p>Aucune tâche Préparation disponible.</p>'}
      </article>

      <article class="card">
        <h3>Indicateurs préparation</h3>
        ${kpiCards([
          { label: 'Tâches prévues aujourd’hui', value: k.planned },
          { label: 'Tâches terminées', value: k.done },
          { label: 'Tâches en retard', value: k.late },
          { label: 'Temps prévu total', value: mins(k.plannedTime) },
          { label: 'Temps réel déclaré', value: mins(k.realTime) },
          { label: 'Écart temps prévu / réel', value: mins(k.gap) },
          { label: 'Taux de réalisation', value: `${k.rate}%` },
          { label: 'Observations ouvertes', value: k.openObs },
          { label: 'Quantité préparée', value: qtyPrepared },
          { label: 'Quantité bloquée', value: qtyBlocked },
          { label: 'Performance semaine', value: `${perfWeek}%` }
        ])}
        <div class="prep-graphs">
          <div class="graph-item"><h4>Tâches prévues vs terminées</h4><div class="bar-wrap"><span style="width:${Math.min(100, k.planned * 10)}%">Prévues: ${k.planned}</span><span class="done" style="width:${Math.min(100, k.done * 10)}%">Terminées: ${k.done}</span></div></div>
          <div class="graph-item"><h4>Temps prévu vs temps réel</h4><div class="bar-wrap"><span style="width:${Math.min(100, Math.round(k.plannedTime / 6))}%">Prévu: ${k.plannedTime}</span><span class="done" style="width:${Math.min(100, Math.round(k.realTime / 6))}%">Réel: ${k.realTime}</span></div></div>
          <div class="graph-item"><h4>Évolution semaine</h4><div class="bar-wrap"><span style="width:${perfWeek}%">Performance: ${perfWeek}%</span></div></div>
        </div>
      </article>
    `;

    container.querySelectorAll('[data-task-id]').forEach((card) => {
      card.addEventListener('click', () => {
        state.selectedId = Number(card.dataset.taskId);
        refresh();
      });
    });

    const select = container.querySelector('#task-form select[name="statutTache"]');
    if (select && selected) select.value = selected.task.statutTache || 'En cours';

    container.querySelector('#save-task')?.addEventListener('click', () => {
      if (!selected) return;
      saveTaskUpdate(selected.task.id, container.querySelector('#task-form'));
      refresh();
    });

    container.querySelector('#save-obs')?.addEventListener('click', () => {
      if (!selected) return;
      saveObservation(selected, 'Préparation', container.querySelector('#obs-form'));
      refresh();
    });
  }

  refresh();
}
