import {
  badge,
  computeCommonKpi,
  getOperatorContext,
  mins,
  saveObservation,
  saveTaskUpdate
} from './operatorCommon.js';

const state = { selectedId: null };

const prioRank = {
  Urgente: 0,
  Haute: 1,
  Moyenne: 2,
  Basse: 3
};

const sortRows = (rows) =>
  [...rows].sort((a, b) =>
    (Number(a.task.ordrePassage ?? 9999) - Number(b.task.ordrePassage ?? 9999)) ||
    ((prioRank[a.task.priorite] ?? 9) - (prioRank[b.task.priorite] ?? 9)) ||
    (a.task.datePrevue || '').localeCompare(b.task.datePrevue || '') ||
    (a.task.heureDebutPrevue || '').localeCompare(b.task.heureDebutPrevue || '')
  );

const calcMinutes = (start, end) => {
  if (!start || !end) return null;

  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const delta = eh * 60 + em - (sh * 60 + sm);

  return delta >= 0 ? delta : -1;
};

export function renderPreparationPage(container) {
  function refresh() {
    const { rows: baseRows, operator } = getOperatorContext('Préparation');
    const rows = sortRows(baseRows);

    if (!state.selectedId && rows[0]) {
      state.selectedId = String(rows[0].task.id);
    }

    const selected =
      rows.find((row) => String(row.task.id) === String(state.selectedId)) || null;

    const k = computeCommonKpi(rows, 'Préparation');

    container.innerHTML = `
      <article class="card">
        <h3>Préparation</h3>
        <p>Tâches assignées, masquage, préparation avant production</p>
        <p>
          <strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')} |
          <strong>Opérateur :</strong> ${operator.prenom} ${operator.nom} |
          <strong>Activité :</strong> Préparation
        </p>
      </article>

      <article class="card">
        <h3>Tâches du jour</h3>
        <div class="prep-task-row">
          ${rows.map((r) => `
            <button
              class="prep-task-card ${String(r.task.id) === String(state.selectedId) ? 'active' : ''}"
              data-task="${r.task.id}"
              type="button"
            >
              <strong class="of-title">${r.affaire?.numeroOF || 'OF'}</strong>
              <span><b>Client</b> ${r.client?.nom || '-'}</span>
              <span><b>Référence</b> ${r.reference?.referencePiece || '-'}</span>
              <span><b>Désignation</b> ${r.reference?.designationPiece || '-'}</span>
              <span><b>Quantité</b> ${r.reference?.quantite || 0}</span>
              <span class="time-focus">
                <strong>Temps prévu :</strong> ${mins(r.task.tempsPrevu)}
              </span>
              <div class="prep-badges">
                ${badge(r.task.priorite)} ${badge(r.task.statutTache)}
              </div>
            </button>
          `).join('')}
        </div>
      </article>

      <article class="card">
        <h3>Détail de l’affaire</h3>

        ${selected ? `
          <div class="prep-detail-grid">
            <section class="inner-card">
              <h4>Identification</h4>
              <p><strong>Affaire :</strong> ${selected.affaire?.id || '-'}</p>
              <p><strong>N° OF :</strong> ${selected.affaire?.numeroOF || '-'}</p>
              <p><strong>Commande :</strong> ${selected.affaire?.commandeId || '-'}</p>
              <p><strong>Client :</strong> ${selected.client?.nom || '-'}</p>
            </section>

            <section class="inner-card">
              <h4>Pièce</h4>
              <p><strong>Référence pièce :</strong> ${selected.reference?.referencePiece || '-'}</p>
              <p><strong>Désignation :</strong> ${selected.reference?.designationPiece || '-'}</p>
              <p><strong>Quantité :</strong> ${selected.reference?.quantite || 0}</p>
              <p><strong>Matière :</strong> ${selected.reference?.matiere || '-'}</p>
              <p><strong>Traitement :</strong> ${selected.reference?.traitement || '-'}</p>
              <p><strong>Couleur :</strong> ${selected.reference?.couleur || '-'}</p>
            </section>

            <section class="inner-card">
              <h4>Flux atelier</h4>
              <p><strong>Localisation :</strong> ${selected.affaire?.localisationActuelle || '-'}</p>
              <p><strong>Étape actuelle :</strong> Préparation</p>
              <p><strong>Prochaine étape :</strong> Accroche</p>
              <p><strong>Priorité :</strong> ${selected.task.priorite || '-'}</p>
              <p><strong>Statut :</strong> ${selected.task.statutTache || '-'}</p>
            </section>

            <section class="inner-card">
              <h4>Temps</h4>
              <p><strong>Temps prévu :</strong> ${mins(selected.task.tempsPrevu)}</p>
              <p><strong>Temps réel :</strong> ${mins(selected.task.tempsReel)}</p>
              <p><strong>Écart :</strong> ${mins((selected.task.tempsReel || 0) - (selected.task.tempsPrevu || 0))}</p>
            </section>

            <section class="inner-card">
              <h4>Besoins préparation</h4>
              <p><strong>Type de préparation :</strong> standard</p>
              <p><strong>Type de masquage :</strong> adhésif + bouchons</p>
              <p><strong>Zones à protéger :</strong> surfaces fonctionnelles</p>
              <p><strong>Consommables :</strong> bouchons, adhésifs, chiffons</p>
              <p><strong>Outillage :</strong> poste masquage, rack</p>
              <p><strong>Fiche instruction :</strong> PREP-01</p>
              <p><strong>Points de vigilance :</strong> traçabilité et contrôle masquage</p>
            </section>
          </div>

          <h3>Déclaration opérateur</h3>

          <form id="task-form" class="record-form">
            <label class="form-field">
              Heure début réelle
              <input id="h-start" name="heureDebutReelle" type="time" value="${selected.task.heureDebutReelle || ''}">
            </label>

            <label class="form-field">
              Heure fin réelle
              <input id="h-end" name="heureFinReelle" type="time" value="${selected.task.heureFinReelle || ''}">
            </label>

            <label class="form-field">
              Temps réel calculé (min)
              <input id="h-total" name="tempsReel" type="number" readonly value="${selected.task.tempsReel || 0}">
            </label>

            <label class="form-field">
              Quantité préparée
              <input name="quantiteTraitee" type="number" value="${selected.task.quantiteTraitee || 0}">
            </label>

            <label class="form-field">
              Non-conformité
              <input name="quantiteBloquee" type="number" value="${selected.task.quantiteBloquee || 0}">
            </label>

            <label class="form-field">
              Statut final
              <select name="statutTache">
                <option>En cours</option>
                <option>Terminée</option>
                <option>Bloquée</option>
                <option>Partiellement terminée</option>
              </select>
            </label>
          </form>

          <p id="time-alert" class="status-error"></p>
          <button id="save-task" class="btn" type="button">Enregistrer la déclaration</button>

          <h3>Observation</h3>

          <form id="obs-form" class="obs-layout">
            <div class="obs-left">
              <label class="form-field">
                Type d’observation
                <select name="typeObservation">
                  <option>Anomalie</option>
                  <option>Amélioration</option>
                  <option>Information</option>
                  <option>Retard</option>
                  <option>Manque consommable</option>
                  <option>Outillage</option>
                  <option>Qualité</option>
                </select>
              </label>

              <label class="form-field">
                <strong>Importance :</strong>
                <select name="importance">
                  <option>Faible</option>
                  <option>Moyenne</option>
                  <option>Critique</option>
                </select>
              </label>

              <button id="save-obs" class="btn secondary" type="button">
                Enregistrer observation
              </button>
            </div>

            <div class="obs-right">
              <label class="form-field obs-comment">
                Commentaire d’observation
                <textarea name="commentaire" rows="4"></textarea>
              </label>
            </div>
          </form>
        ` : `
          <p>Aucune tâche.</p>
        `}
      </article>

      <article class="card">
        <h3>Indicateurs préparation</h3>

        <div class="prep-indicators">
          <section class="indicator-card">
            <h4>Nombre d’affaires</h4>
            <p class="big-number">${rows.length}</p>
          </section>

          <section class="indicator-card">
            <h4>Prévues / Réalisées</h4>
            <div class="bar-wrap">
              <span style="width:${Math.min(100, k.planned * 12)}%">
                Prévues ${k.planned}
              </span>
              <span class="done" style="width:${Math.min(100, k.done * 12)}%">
                Réalisées ${k.done}
              </span>
              <span style="width:${Math.min(100, k.late * 12)}%">
                Retard ${k.late}
              </span>
            </div>
          </section>

          <section class="indicator-card">
            <h4>Efficacité</h4>
            <div
              class="ring"
              style="--pct:${k.realTime ? Math.min(100, Math.round((k.plannedTime / k.realTime) * 100)) : 0};"
            >
              <span>
                ${k.realTime ? `${Math.round((k.plannedTime / k.realTime) * 100)}%` : 'Non calculé'}
              </span>
            </div>
            <p><strong>Temps prévu :</strong> ${k.plannedTime} min</p>
            <p><strong>Temps réel :</strong> ${k.realTime} min</p>
          </section>
        </div>
      </article>
    `;

    container.querySelectorAll('[data-task]').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedId = String(button.dataset.task);
        refresh();
      });
    });

    const statutSelect = container.querySelector("select[name='statutTache']");
    if (statutSelect && selected) {
      statutSelect.value = selected.task.statutTache || 'En cours';
    }

    const calc = () => {
      const startInput = container.querySelector('#h-start');
      const endInput = container.querySelector('#h-end');
      const totalInput = container.querySelector('#h-total');
      const alertNode = container.querySelector('#time-alert');

      const minutes = calcMinutes(startInput?.value, endInput?.value);

      if (minutes === -1) {
        alertNode.textContent = 'Heure de fin inférieure à l’heure de début.';
        return;
      }

      alertNode.textContent = '';

      if (minutes !== null) {
        totalInput.value = String(minutes);
      }
    };

    container.querySelector('#h-start')?.addEventListener('input', calc);
    container.querySelector('#h-end')?.addEventListener('input', calc);

    container.querySelector('#save-task')?.addEventListener('click', () => {
      if (!selected) return;

      const startInput = container.querySelector('#h-start');
      const endInput = container.querySelector('#h-end');
      const minutes = calcMinutes(startInput.value, endInput.value);

      if (minutes === -1) return;

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