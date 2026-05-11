import { initialDatabase } from './database.js';

const STORAGE_KEY = 'technocoat_database';

let database = null;

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

export function loadDatabase() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    database = JSON.parse(raw);
    return clone(database);
  }
  database = clone(initialDatabase);
  saveDatabase();
  return clone(database);
}

export function saveDatabase() {
  if (!database) {
    database = clone(initialDatabase);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

export function resetDatabase() {
  database = clone(initialDatabase);
  saveDatabase();
  return clone(database);
}

export function getTable(tableName) {
  if (!database) loadDatabase();
  return clone(database[tableName] || []);
}

export function generateId(tableName) {
  const table = getTable(tableName);
  return table.length ? Math.max(...table.map((item) => Number(item.id) || 0)) + 1 : 1;
}

export function addRecord(tableName, record) {
  if (!database) loadDatabase();
  const nextRecord = { id: generateId(tableName), ...record };
  database[tableName] = database[tableName] || [];
  database[tableName].push(nextRecord);
  saveDatabase();
  return clone(nextRecord);
}

export function updateRecord(tableName, id, updatedRecord) {
  if (!database) loadDatabase();
  database[tableName] = (database[tableName] || []).map((item) =>
    item.id === id ? { ...item, ...updatedRecord, id } : item
  );
  saveDatabase();
}

export function deleteRecord(tableName, id) {
  if (!database) loadDatabase();
  database[tableName] = (database[tableName] || []).filter((item) => item.id !== id);
  saveDatabase();
}

export function filterRecords(tableName, filters = {}) {
  const table = getTable(tableName);
  return table.filter((record) =>
    Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      return String(record[key] ?? '').toLowerCase().includes(String(value).toLowerCase());
    })
  );
}

export function exportTableToCSV(tableName, filteredData) {
  const rows = filteredData || getTable(tableName);
  if (!rows.length) return '';

  const headers = Object.keys(rows[0]);
  const lines = [headers.join(';')];

  rows.forEach((row) => {
    const values = headers.map((header) => `"${String(row[header] ?? '').replaceAll('"', '""')}"`);
    lines.push(values.join(';'));
  });

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${tableName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return csvContent;
}
