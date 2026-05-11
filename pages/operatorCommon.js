import { addRecord, getTable, updateRecord } from '../data/databaseService.js';

const configs = {
  preparation: {
    title: 'Préparation',
    subtitle: 'Réception, contrôle d’entrée, masquage et préparation avant production',
    needs: ['Consommables de masquage', 'Bouchons', 'Adhésif', 'Chiffons', 'Outillage de préparation', 'Points de vigilance']
  },
  accroche: {
    title: 'Accroche',
    subtitle: 'Mise en place des pièces sur outillages avant traitement',
    needs: ['Crochets', 'Balancelles', 'Outillage d’accroche', 'Mode d’accrochage', 'Points de vigilance']
  },
  peinture: {
    title: 'Peinture',
    subtitle: 'Application peinture, paramètres process et suivi consommation',
    needs: ['Poudre ou peinture', 'Teinte / couleur', 'Paramètres process', 'Température', 'Temps prévu', 'Consommation prévue', 'Points de vigilance']
  },
  decroche: {
    title: 'Décroche',
    subtitle: 'Décrochage, contrôle visuel et mise à disposition après peinture',
    needs: ['Zone de dépose', 'Contrôle visuel', 'Emballage éventuel', 'Mise à disposition logistique', 'Points de vigilance']
  }
};

const states = {};

const badge = (v) => `<span class="op-badge">${v || 'Non défini'}</span>`;

function getEnrichedTasks(activity) {
  const tasks = getTable('taches').filter((t) => t.activite === activity);
  const affaires = getTable('affaires');
  const clients = getTable('clients');
  const refs = getTable('referencesPieces');

  return tasks.map((task) => {
    const affaire = affaires.find((a) => a.id === Number(task.affaireId));
    const client = clients.find((c) => c.id === Number(affaire?.clientId));
    const reference = refs.find((r) => r.id === Number(task.referenceId));
    return { task, affaire, client, reference };
  });
}

function computeKpi(rows, activity) {
  const today = new Date().toISOString().slice(0, 10);
  const openObs = getTable('observations').filter((o) => o.activite === activity && o.statutTraitement !== 'Clôturée').length;
  const plannedToday = rows.filter((r) => r.task.datePrevue === today).length;
  const inProgress = rows.filter((r) => r.task.statutTache === 'En cours').length;
  const done = rows.filter((r) => r.task.statutTache === 'Terminée').length;
  const blocked = rows.filter((r) => ['Bloquée', 'Partiellement terminée'].includes(r.task.statutTache)).length;
  const plannedTime = rows.reduce((s, r) => s + Number(r.task.tempsPrevu || 0), 0);
  const realTime = rows.reduce((s, r) => s + Number(r.task.tempsReel || 0), 0);
  return { plannedToday, inProgress, done, blocked, plannedTime, realTime, gap: realTime - plannedTime, openObs };
}

export function renderOperatorPage(container, activityKey) {
  const cfg = configs[activityKey];
  const operator = getTable('personnel').find((p) => p.activite === cfg.title) || getTable('personnel')[0];
  if (!states[activityKey]) states[activityKey] = { selectedTaskId: null };

  function refresh() {
    const rows = getEnrichedTasks(cfg.title);
    if (!states[activityKey].selectedTaskId && rows.length) states[activityKey].selectedTaskId = rows[0].task.id;
    const selected = rows.find((r) => r.task.id === states[activityKey].selectedTaskId) || null;
    const k = computeKpi(rows, cfg.title);

    container.innerHTML = `
      <article class="card">
        <h3>${cfg.title}</h3>
        <p>${cfg.subtitle}</p>
        <p>Date: ${new Date().toLocaleDateString('fr-FR')} | Opérateur: ${operator?.prenom || ''} ${operator?.nom || ''}</p>
      </article>

      <section class="table-grid">
        <article class="card"><h3>Affaires à traiter aujourd’hui</h3><p>${k.plannedToday}</p></article>
        <article class="card"><h3>Affaires en cours</h3><p>${k.inProgress}</p></article>
        <article class="card"><h3>Affaires terminées</h3><p>${k.done}</p></article>
        <article class="card"><h3>Affaires bloquées</h3><p>${k.blocked}</p></article>
        <article class="card"><h3>Temps prévu total</h3><p>${k.plannedTime} min</p></article>
        <article class="card"><h3>Temps réel renseigné</h3><p>${k.realTime} min</p></article>
        <article class="card"><h3>Écart temps</h3><p>${k.gap} min</p></article>
        <article class="card"><h3>Observations ouvertes</h3><p>${k.openObs}</p></article>
      </section>

      <section class="operator-grid">
        <article class="card">
          <h3>Affaires / tâches à traiter</h3>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>Affaire</th><th>N° OF</th><th>Client</th><th>Référence</th><th>Désignation</th><th>Qté</th><th>Priorité</th><th>Statut</th><th>Temps prévu</th><th>Temps réel</th><th>Localisation</th><th>Action</th></tr></thead>
              <tbody>
                ${rows.map((r) => `<tr><td>${r.affaire?.id || '-'}</td><td>${r.affaire?.numeroOF || '-'}</td><td>${r.client?.nom || '-'}</td><td>${r.reference?.referencePiece || '-'}</td><td>${r.reference?.designationPiece || '-'}</td><td>${r.reference?.quantite || '-'}</td><td>${badge(r.task.priorite)}</td><td>${badge(r.task.statutTache)}</td><td>${r.task.tempsPrevu || 0}</td><td>${r.task.tempsReel || 0}</td><td>${r.affaire?.localisationActuelle || '-'}</td><td><button class="btn secondary op-view" data-id="${r.task.id}">Voir / traiter</button></td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </article>

        <article class="card">
          <h3>Détail affaire sélectionnée</h3>
          ${selected ? `<p>Affaire: ${selected.affaire?.id} | N° OF: ${selected.affaire?.numeroOF}</p>
          <p>Commande: ${selected.affaire?.commandeId} | Client: ${selected.client?.nom}</p>
          <p>Référence: ${selected.reference?.referencePiece} | Désignation: ${selected.reference?.designationPiece} | Quantité: ${selected.reference?.quantite}</p>
          <p>Étape actuelle: ${selected.task.activite} | Prochaine étape: ${selected.task.activite === 'Décroche' ? 'Terminé' : 'Étape suivante'}</p>
          <p>Localisation: ${selected.affaire?.localisationActuelle} | Priorité: ${selected.task.priorite} | Statut: ${selected.task.statutTache}</p>` : '<p>Aucune tâche sélectionnée.</p>'}

          <h3>Besoins pour cette tâche</h3>
          <ul>${cfg.needs.map((n) => `<li>${n}</li>`).join('')}</ul>

          <h3>Déclaration opérateur</h3>
          <form id="op-form">
            <div class="record-form">
              <label class="form-field">Heure de début réelle<input name="heureDebutReelle" type="time" value="${selected?.task.heureDebutReelle || ''}" /></label>
              <label class="form-field">Heure de fin réelle<input name="heureFinReelle" type="time" value="${selected?.task.heureFinReelle || ''}" /></label>
              <label class="form-field">Temps réel passé (min)<input name="tempsReel" type="number" value="${selected?.task.tempsReel || 0}" /></label>
              <label class="form-field">Quantité traitée<input name="quantiteTraitee" type="number" value="${selected?.task.quantiteTraitee || 0}" /></label>
              <label class="form-field">Quantité bloquée<input name="quantiteBloquee" type="number" value="${selected?.task.quantiteBloquee || 0}" /></label>
              <label class="form-field">Statut final<select name="statutTache"><option>En cours</option><option>Terminée</option><option>Bloquée</option><option>Partiellement terminée</option></select></label>
            </div>
            <button class="btn" type="submit">Enregistrer</button>
          </form>

          <h3>Observation / Retour d’expérience</h3>
          <form id="obs-form">
            <div class="record-form">
              <label class="form-field">Type d’observation<select name="typeObservation"><option>Anomalie</option><option>Amélioration</option><option>Information</option><option>Retard</option><option>Manque consommable</option><option>Outillage</option><option>Qualité</option></select></label>
              <label class="form-field">Importance<select name="importance"><option>Faible</option><option>Moyenne</option><option>Critique</option></select></label>
              <label class="form-field">Commentaire libre<input name="commentaire" type="text" /></label>
            </div>
            <button class="btn secondary" type="submit">Enregistrer observation</button>
          </form>
        </article>
      </section>
    `;

    container.querySelectorAll('.op-view').forEach((b) => b.addEventListener('click', () => {
      states[activityKey].selectedTaskId = Number(b.dataset.id);
      refresh();
    }));

    const statusSelect = container.querySelector('#op-form select[name="statutTache"]');
    if (statusSelect && selected) statusSelect.value = selected.task.statutTache || 'En cours';

    container.querySelector('#op-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!selected) return;
      const payload = Object.fromEntries(new FormData(event.target).entries());
      updateRecord('taches', selected.task.id, payload);
      refresh();
    });

    container.querySelector('#obs-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!selected) return;
      const payload = Object.fromEntries(new FormData(event.target).entries());
      addRecord('observations', {
        dateObservation: new Date().toISOString().slice(0, 10),
        operateurId: selected.task.operateurId,
        affaireId: selected.task.affaireId,
        referenceId: selected.task.referenceId,
        activite: cfg.title,
        typeObservation: payload.typeObservation,
        importance: payload.importance,
        commentaire: payload.commentaire,
        statutTraitement: 'Ouverte',
        actionPrevue: '',
        responsableTraitement: '',
        dateCloture: ''
      });
      refresh();
    });
  }

  refresh();
}
