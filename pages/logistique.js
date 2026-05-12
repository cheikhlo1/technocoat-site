export function renderLogistiquePage(container) {
  container.innerHTML = `
    <article class="card">
      <h3>Logistique</h3>
      <p>Réception, conditionnement, mise en palette et expédition des pièces.</p>
    </article>

    <section class="table-grid">
      <article class="card kpi">
        <h4>Réception</h4>
        <p>Enregistrements des arrivées pièces et contrôles de conformité.</p>
      </article>
      <article class="card kpi">
        <h4>Livraison / Expédition</h4>
        <p>Préparation BL, chargement et suivi des envois client.</p>
      </article>
      <article class="card kpi">
        <h4>Conditionnement & palettes</h4>
        <p>Suivi des palettes en préparation et mise à disposition atelier/client.</p>
      </article>
    </section>

    <article class="card">
      <h4>Etat de la page</h4>
      <p>Page en cours de développement.</p>
    </article>
  `;
}
