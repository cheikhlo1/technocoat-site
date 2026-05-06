:root {
  --navy: #1f3552;
  --navy-strong: #172a42;
  --bg: #f2f5f9;
  --surface: #ffffff;
  --muted: #5c6775;
  --text: #182432;
  --border: #d9e0ea;
  --orange: #f39c12;
  --green: #1f9d58;
  --red: #d64545;
  --shadow: 0 8px 24px rgba(17, 24, 39, 0.08);
  --radius: 12px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Segoe UI", Roboto, Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
}

.app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 285px;
  background: linear-gradient(180deg, var(--navy) 0%, var(--navy-strong) 100%);
  color: #fff;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1.4rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}

.sidebar-header h1 {
  margin: 0;
  font-size: 1.2rem;
}

.sidebar-header p {
  margin: 0.35rem 0 0;
  font-size: 0.83rem;
  color: #d5deea;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.85rem;
}

.sidebar-nav button {
  border: 1px solid transparent;
  background: transparent;
  color: #eef4ff;
  text-align: left;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 10px;
  padding: 0.72rem 0.8rem;
  cursor: pointer;
  transition: 0.2s ease;
}

.sidebar-nav button:hover,
.sidebar-nav button.active-nav {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.2);
}

.main-content {
  margin-left: 285px;
  width: calc(100% - 285px);
}

.top-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1rem 1.5rem;
}

.user-panel {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

#change-role {
  border: none;
  border-radius: 10px;
  padding: 0.55rem 0.95rem;
  background: var(--navy);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.page-content {
  padding: 1.6rem;
}

.page-title {
  margin: 0;
  font-size: 1.8rem;
}

.page-subtitle {
  margin: 0.4rem 0 1.2rem;
  color: var(--muted);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1rem;
  margin-bottom: 1rem;
}

.badges {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  color: #fff;
}

.badge.orange {
  background: var(--orange);
}

.badge.green {
  background: var(--green);
}

.badge.red {
  background: var(--red);
}

.todo-box {
  border: 1px dashed #b7c3d3;
  border-radius: 10px;
  padding: 0.9rem;
  color: #394a5d;
  background: #f9fbfd;
}

/* Dashboard Manager */

.manager-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  color: var(--muted);
  font-weight: 600;
}

.executive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.exec-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.exec-actions .detail-btn {
  margin-top: 0;
}

.big-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.9rem;
  margin: 0.8rem 0;
}

.big-kpi {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.big-kpi strong {
  font-size: 1.4rem;
  display: block;
  margin: 0.25rem 0;
}

.big-kpi p {
  margin: 0;
  color: var(--muted);
  font-size: 0.86rem;
}

.big-kpi.good {
  border-left: 6px solid var(--green);
}

.big-kpi.warn {
  border-left: 6px solid var(--orange);
}

.big-kpi.danger {
  border-left: 6px solid var(--red);
}

.big-kpi.neutral {
  border-left: 6px solid #2d6cdf;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.8rem;
  margin: 1rem 0;
}

.kpi-grid.compact .kpi-card {
  padding: 0.65rem 0.8rem;
}

.kpi-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.85rem;
  box-shadow: var(--shadow);
}

.kpi-card small {
  display: block;
  color: var(--muted);
  margin-bottom: 0.35rem;
}

.kpi-card strong {
  font-size: 1.3rem;
}

.kpi-card.good {
  border-left: 5px solid var(--green);
}

.kpi-card.warn {
  border-left: 5px solid var(--orange);
}

.kpi-card.danger {
  border-left: 5px solid var(--red);
}

.kpi-card.neutral {
  border-left: 5px solid #2d6cdf;
}

.kpi-click {
  cursor: pointer;
  text-align: left;
  background: #fff;
}

.kpi-click:hover {
  transform: translateY(-1px);
}

.manager-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.6rem 0 1rem;
}

.manager-tab {
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
}

.manager-tab.active {
  background: var(--navy);
  color: #fff;
  border-color: var(--navy);
}

.triple-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.8rem;
}

.alert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.8rem;
}

.alert-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.8rem;
  box-shadow: var(--shadow);
}

.alert-card.critique {
  border-left: 6px solid var(--red);
}

.alert-card.attention {
  border-left: 6px solid var(--orange);
}

.alert-card.information {
  border-left: 6px solid #2d6cdf;
}

.detail-btn {
  margin-top: 0.6rem;
  border: none;
  background: var(--navy);
  color: #fff;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

/* Filtres, tableaux et graphiques */

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.7rem;
}

.filters-grid input,
.filters-grid select,
.filters-grid button {
  padding: 0.55rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
}

.filters-grid button {
  background: var(--navy);
  color: #fff;
  font-weight: 600;
}

.table-wrap {
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid var(--border);
  padding: 0.5rem;
  text-align: left;
  font-size: 0.9rem;
}

table tbody tr:nth-child(even) {
  background: #f8fbff;
}

.charge-row {
  margin-bottom: 0.8rem;
}

.charge-row span {
  display: block;
  font-size: 0.9rem;
}

.progress {
  height: 8px;
  background: #e5eaf1;
  border-radius: 999px;
  margin-top: 0.35rem;
}

.progress div {
  height: 100%;
  background: #2d6cdf;
  border-radius: 999px;
}

.perf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.8rem;
  margin-top: 1rem;
}

.mini-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-top: 1rem;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 140px;
  padding: 0.5rem;
  background: #f7f9fc;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.bar {
  width: 12px;
  border-radius: 4px 4px 0 0;
}

.bar.prog {
  background: #94a3b8;
}

.bar.real {
  background: #23486b;
}

.bar.info {
  background: #60a5fa;
}

.bar.good {
  background: #1f9d58;
}

.bar-col span {
  font-size: 0.72rem;
  color: var(--muted);
}

@media (max-width: 960px) {
  .sidebar {
    position: static;
    width: 100%;
    height: auto;
  }

  .main-content {
    margin-left: 0;
    width: 100%;
  }

  .app {
    flex-direction: column;
  }

  .executive-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .mini-charts {
    grid-template-columns: 1fr;
  }
}