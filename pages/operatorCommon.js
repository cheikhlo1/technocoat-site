import { addRecord, getTable, updateRecord } from '../data/databaseService.js';

export function getOperatorContext(activity) {
  const tasks = getTable('taches').filter((t) => t.activite === activity);
  const affaires = getTable('affaires');
  const clients = getTable('clients');
  const refs = getTable('referencesPieces');
  const operator = getTable('personnel').find((p) => p.activite === activity) || getTable('personnel')[0];
  const rows = tasks.map((task) => ({
    task,
    affaire: affaires.find((a) => a.id === Number(task.affaireId)),
    client: clients.find((c) => c.id === Number(affaires.find((a) => a.id === Number(task.affaireId))?.clientId)),
    reference: refs.find((r) => r.id === Number(task.referenceId))
  }));
  return { rows, operator };
}

export const badge = (value) => `<span class="op-badge">${value || 'N/A'}</span>`;
export const mins = (value) => `${Number(value || 0)} min`;

export function kpiCards(items) {
  return `<section class="table-grid">${items.map((i) => `<article class="card"><h3>${i.label}</h3><p>${i.value}</p></article>`).join('')}</section>`;
}

export function saveTaskUpdate(taskId, form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  updateRecord('taches', taskId, payload);
}

export function saveObservation(selected, activity, form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  addRecord('observations', {
    dateObservation: new Date().toISOString().slice(0, 10),
    operateurId: selected.task.operateurId,
    affaireId: selected.task.affaireId,
    referenceId: selected.task.referenceId,
    activite: activity,
    typeObservation: payload.typeObservation,
    importance: payload.importance,
    commentaire: payload.commentaire,
    statutTraitement: 'Ouverte',
    actionPrevue: '',
    responsableTraitement: '',
    dateCloture: ''
  });
}

export function computeCommonKpi(rows, activity) {
  const today = new Date().toISOString().slice(0, 10);
  const openObs = getTable('observations').filter((o) => o.activite === activity && o.statutTraitement !== 'Clôturée').length;
  const planned = rows.filter((r) => r.task.datePrevue === today).length;
  const done = rows.filter((r) => r.task.statutTache === 'Terminée').length;
  const late = rows.filter((r) => r.task.datePrevue < today && r.task.statutTache !== 'Terminée').length;
  const plannedTime = rows.reduce((s, r) => s + Number(r.task.tempsPrevu || 0), 0);
  const realTime = rows.reduce((s, r) => s + Number(r.task.tempsReel || 0), 0);
  return { planned, done, late, plannedTime, realTime, gap: realTime - plannedTime, openObs, rate: planned ? Math.round((done / planned) * 100) : 0 };
}
