const safe = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function renderStatusBadge(value = 'Non renseigné') {
  const status = String(value || 'Non renseigné');
  const tone = /clôtur|termin|conforme|valid/i.test(status) ? 'success' : /cours|analyse|attente/i.test(status) ? 'warning' : /bloqu|non conforme|retard|critique/i.test(status) ? 'danger' : 'neutral';
  return `<span class="status-badge ${tone}">${safe(status)}</span>`;
}

export function renderPriorityBadge(value = 'Moyenne') {
  const priority = String(value || 'Moyenne');
  const tone = /haute|urgent/i.test(priority) ? 'danger' : /moyenne/i.test(priority) ? 'warning' : 'neutral';
  return `<span class="priority-badge ${tone}">${safe(priority)}</span>`;
}

export function renderSeverityBadge(value = 'Moyenne') {
  const severity = String(value || 'Moyenne');
  const tone = /critique|élevée/i.test(severity) ? 'danger' : /moyenne/i.test(severity) ? 'warning' : /faible/i.test(severity) ? 'success' : 'neutral';
  return `<span class="severity-badge ${tone}">${safe(severity)}</span>`;
}

export function renderEmptyState(message = 'Aucune donnée disponible pour le moment.') {
  return `<div class="empty-state"><p>${safe(message)}</p></div>`;
}

export function renderActionButton(label = 'Action', variant = 'secondary', attrs = '') {
  return `<button class="action-button ${safe(variant)}" type="button" ${attrs}>${safe(label)}</button>`;
}

export function renderAlertCard(title = 'Alerte', message = '', tone = 'warning') {
  return `<article class="alert-card ${safe(tone)}"><h5>${safe(title)}</h5><p>${safe(message || 'Aucun détail disponible.')}</p></article>`;
}

export function renderDetailBlock(title = 'Détail', rows = []) {
  const body = Array.isArray(rows) && rows.length ? rows.map((r) => `<p><strong>${safe(r.label || '')} :</strong> ${safe(r.value || '-')}</p>`).join('') : '<p>Aucune donnée disponible pour le moment.</p>';
  return `<article class="detail-block"><h5>${safe(title)}</h5>${body}</article>`;
}

window.TechnoUI = { renderStatusBadge, renderPriorityBadge, renderSeverityBadge, renderEmptyState, renderActionButton, renderAlertCard, renderDetailBlock };
