// Navigation
const navButtons = document.querySelectorAll('.sidebar-nav button');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.dataset.section;
        showSection(sectionId);
        setActiveNavButton(sectionId);
    });
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        selectedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function setActiveNavButton(sectionId) {
    navButtons.forEach(button => button.classList.toggle('active-nav', button.dataset.section === sectionId));
}

document.getElementById('change-role').addEventListener('click', () => {
    alert('Fonction de changement de rôle à implémenter.');
});

const dbState = { tab: 'clients' };
const dbData = {
    clients: [
        { idClient:'CL001', client:'Client A', commande:'CMD001', montant:'12500€', dateCommande:'2026-05-02', dateProd:'2026-05-10', dateLiv:'2026-05-16', nbOF:'3', statut:'En production', priorite:'Haute' },
        { idClient:'CL002', client:'Client B', commande:'CMD002', montant:'8400€', dateCommande:'2026-05-01', dateProd:'2026-05-12', dateLiv:'2026-05-20', nbOF:'2', statut:'Planifiée', priorite:'Moyenne' }
    ],
    production: [
        { of:'OF001', commande:'CMD001', client:'Client A', ref:'REF001', designation:'Pièce A', qte:'100', etape:'Préparation', operateur:'Alice', tprevu:'30 min', treel:'34 min', ecart:'+4 min', statut:'En cours', debut:'2026-05-06', fin:'-', localisation:'Zone Préparation' },
        { of:'OF002', commande:'CMD002', client:'Client B', ref:'REF009', designation:'Pièce Support', qte:'60', etape:'Peinture', operateur:'Bob', tprevu:'45 min', treel:'40 min', ecart:'-5 min', statut:'Terminée', debut:'2026-05-05', fin:'2026-05-05', localisation:'Cabine 2' }
    ],
    personnel: [
        { id:'EMP001', nom:'Martin', prenom:'Luc', login:'lmartin', mail:'luc.martin@technocoat.local', role:'Manager', service:'Pilotage', statut:'Actif', derniere:'2026-05-06 07:45', acces:'Niveau 5' },
        { id:'EMP014', nom:'Petit', prenom:'Nina', login:'npetit', mail:'nina.petit@technocoat.local', role:'Préparation', service:'Atelier', statut:'Actif', derniere:'2026-05-06 06:58', acces:'Niveau 2' }
    ],
    stocks: [
        { code:'STK001', designation:'Bouchons silicone', famille:'Masquage', stock:'220', seuil:'150', unite:'pcs', statut:'OK', fournisseur:'FourniTech', mouvement:'2026-05-05', emplacement:'Magasin A1' },
        { code:'STK020', designation:'Poudre RAL 9005', famille:'Peinture', stock:'45', seuil:'60', unite:'kg', statut:'Alerte', fournisseur:'ColorPro', mouvement:'2026-05-06', emplacement:'Peinture P2' }
    ],
    qualite: [
        { id:'QC001', of:'OF001', ref:'REF001', type:'Contrôle visuel', resultat:'Conforme', controleur:'Sonia', date:'2026-05-06', nc:'Non', action:'-', statut:'Validé' },
        { id:'QC007', of:'OF014', ref:'REF031', type:'Contrôle process', resultat:'Non conforme', controleur:'Yanis', date:'2026-05-04', nc:'Oui', action:'Reprise masquage', statut:'En traitement' }
    ],
    rex: [
        { id:'OBS001', date:'2026-05-06', operateur:'Alice', activite:'Préparation', of:'OF001', ref:'REF001', type:'Amélioration', importance:'Moyen', commentaire:'Prévoir kit masquage prêt.', statut:'Ouvert' },
        { id:'OBS004', date:'2026-05-05', operateur:'Bob', activite:'Peinture', of:'OF002', ref:'REF009', type:'Manque consommable', importance:'Élevé', commentaire:'Rupture poudre ponctuelle.', statut:'En cours' }
    ]
};

const dbConfig = {
    clients: { columns:['ID client','Client','Numéro commande','Montant commande','Date commande','Date production prévue','Date livraison demandée','Nombre d’OF','Statut commande','Priorité'], keys:['idClient','client','commande','montant','dateCommande','dateProd','dateLiv','nbOF','statut','priorite'] },
    production: { columns:['Numéro OF','Numéro commande','Client','Référence pièce','Désignation pièce','Quantité','Étape actuelle','Opérateur affecté','Temps prévu','Temps réel','Écart temps','Statut production','Date début','Date fin','Localisation atelier'], keys:['of','commande','client','ref','designation','qte','etape','operateur','tprevu','treel','ecart','statut','debut','fin','localisation'] },
    personnel: { columns:['ID employé','Nom','Prénom','Login','Adresse mail fictive','Rôle','Service / activité','Statut compte','Dernière connexion fictive','Niveau d’accès'], keys:['id','nom','prenom','login','mail','role','service','statut','derniere','acces'] },
    stocks: { columns:['Code article','Désignation','Famille','Stock actuel','Seuil minimum','Unité','Statut stock','Fournisseur fictif','Dernier mouvement','Emplacement'], keys:['code','designation','famille','stock','seuil','unite','statut','fournisseur','mouvement','emplacement'] },
    qualite: { columns:['ID contrôle','Numéro OF','Référence pièce','Type contrôle','Résultat','Contrôleur','Date contrôle','Non-conformité','Action corrective','Statut qualité'], keys:['id','of','ref','type','resultat','controleur','date','nc','action','statut'] },
    rex: { columns:['ID observation','Date','Opérateur','Activité','Numéro OF','Référence pièce','Type observation','Importance','Commentaire','Statut traitement'], keys:['id','date','operateur','activite','of','ref','type','importance','commentaire','statut'] }
};

function badgeClass(v) { const t=(v||'').toLowerCase(); if (t.includes('retard')||t.includes('bloq')||t.includes('non conforme')) return 'danger'; if (t.includes('cours')||t.includes('alerte')||t.includes('élev')) return 'warn'; if (t.includes('termin')||t.includes('valid')||t.includes('ok')||t.includes('conforme')||t.includes('actif')) return 'ok'; return 'info'; }

function populateDbFilters() {
    const clients = [...new Set([...dbData.clients.map(x=>x.client), ...dbData.production.map(x=>x.client)])];
    const ofs = [...new Set([...dbData.production.map(x=>x.of), ...dbData.rex.map(x=>x.of), ...dbData.qualite.map(x=>x.of)])];
    const statuses = [...new Set(Object.values(dbData).flat().map(x=>x.statut).filter(Boolean))];
    const activities = [...new Set([...dbData.rex.map(x=>x.activite), ...dbData.personnel.map(x=>x.service)])];
    const fill=(id, arr)=> { const el=document.getElementById(id); arr.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; el.appendChild(o); }); };
    fill('db-client', clients); fill('db-of', ofs); fill('db-status', statuses); fill('db-activity', activities);
}

function renderDbKpis() {
    const kpis = [
        ['Nombre de clients', new Set(dbData.clients.map(x=>x.client)).size],
        ['Nombre de commandes', dbData.clients.length],
        ['Nombre d’OF', dbData.production.length],
        ['Nombre de références suivies', new Set(dbData.production.map(x=>x.ref)).size],
        ['Nombre d’employés', dbData.personnel.length],
        ['Nombre d’anomalies enregistrées', dbData.rex.length],
        ['Temps total prévu', '75 min'],
        ['Temps total réel', '74 min']
    ];
    document.getElementById('db-kpis').innerHTML = kpis.map(([l,v])=>`<div class="db-kpi"><small>${l}</small><strong>${v}</strong></div>`).join('');
}

function filterRows(rows) {
    const q=document.getElementById('db-search').value.toLowerCase();
    const client=document.getElementById('db-client').value; const of=document.getElementById('db-of').value;
    const statut=document.getElementById('db-status').value; const activity=document.getElementById('db-activity').value;
    const date=document.getElementById('db-date-filter').value;
    return rows.filter(r=>{
        const vals=Object.values(r).join(' ').toLowerCase();
        const okQ=!q || vals.includes(q);
        const okClient=!client || r.client===client;
        const okOf=!of || r.of===of;
        const okStatut=!statut || r.statut===statut;
        const okAct=!activity || r.activite===activity || r.service===activity;
        const d=r.date||r.dateCommande||r.debut||r.mouvement||'';
        const okDate=!date || d===date;
        return okQ&&okClient&&okOf&&okStatut&&okAct&&okDate;
    });
}

function renderDbTable() {
    const tab=dbState.tab, cfg=dbConfig[tab];
    const rows=filterRows(dbData[tab]);
    let html='<table><thead><tr>'+cfg.columns.map(c=>`<th>${c}</th>`).join('')+'</tr></thead><tbody>';
    rows.forEach(r=>{ html+='<tr>'+cfg.keys.map(k=>{ const val=r[k]??''; if(['statut','priorite','resultat','importance','nc'].includes(k)) return `<td><span class="badge ${badgeClass(String(val))}">${val}</span></td>`; return `<td>${val}</td>`; }).join('')+'</tr>'; });
    html += rows.length ? '</tbody></table>' : '</tbody></table><p>Aucune donnée pour ces filtres.</p>';
    document.getElementById('db-table-container').innerHTML=html;
}

function exportCsvCurrentTab() {
    const cfg=dbConfig[dbState.tab];
    const rows=filterRows(dbData[dbState.tab]);
    const csv=[cfg.columns.join(';'), ...rows.map(r=>cfg.keys.map(k=>`"${String(r[k]??'').replaceAll('"','""')}"`).join(';'))].join('\n');
    const blob=new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`base_donnees_${dbState.tab}.csv`; a.click(); URL.revokeObjectURL(a.href);
}

function initDatabasePage() {
    const date = new Date().toLocaleDateString('fr-FR');
    const dateNode = document.getElementById('db-date'); if (dateNode) dateNode.textContent = `Date: ${date}`;
    renderDbKpis(); populateDbFilters(); renderDbTable();
    document.querySelectorAll('.db-tab').forEach(btn=>btn.addEventListener('click', ()=>{ document.querySelectorAll('.db-tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); dbState.tab=btn.dataset.tab; renderDbTable(); }));
    ['db-search','db-client','db-of','db-status','db-activity','db-date-filter'].forEach(id=>document.getElementById(id).addEventListener('input', renderDbTable));
    document.getElementById('db-reset').addEventListener('click', ()=>{ ['db-search','db-client','db-of','db-status','db-activity','db-date-filter'].forEach(id=>document.getElementById(id).value=''); renderDbTable(); });
    document.getElementById('db-export-csv').addEventListener('click', exportCsvCurrentTab);
    document.getElementById('db-export-excel').addEventListener('click', ()=>alert('Export Excel disponible dans une future version.'));
    document.getElementById('db-export-pdf').addEventListener('click', ()=>alert('Export PDF disponible dans une future version.'));
}

initDatabasePage();
showSection('manager');
setActiveNavButton('manager');
