import { renderKpiCard, renderStatusBadge, renderPriorityBadge, renderEmptyState, renderProgressBar, renderDonutChart } from '../components/charts.js';
import { renderDetailBlock } from '../components/ui.js';
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

export const badge = (value) => (/haute|moyenne|basse|urgent/i.test(String(value || '')) ? renderPriorityBadge(value || 'N/A') : renderStatusBadge(value || 'N/A'));
export const mins = (value) => `${Number(value || 0)} min`;

export function kpiCards(items) {
  return `<section class="table-grid logistic-kpi-grid">${items.map((i) => renderKpiCard(i.label, i.value, i.unit || '')).join('')}</section>`;
}

export function renderOperatorDetailBlocks(blocks = []) {
  if (!blocks.length) return renderEmptyState('Aucune donnée disponible pour le moment.');
  return `<div class='prep-detail-grid'>${blocks.map((b) => renderDetailBlock(b.title, b.rows)).join('')}</div>`;
}

export function renderOperatorIndicators({ titleA = "Nombre d’affaires", valueA = 0, progressLabel = 'Prévues / Réalisées', progressValue = 0, progressMax = 100, efficiencyLabel = 'Efficacité', efficiencyValue = 0 }) {
  return `<div class='table-grid'>${renderKpiCard(titleA, valueA)}${renderProgressBar(progressLabel, progressValue, progressMax)}${renderDonutChart(efficiencyLabel, efficiencyValue, 100)}</div>`;
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
