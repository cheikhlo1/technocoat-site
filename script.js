const appData = {
  clients: [
    { id: 'CLI-001', nom: 'AeroNord Industries', secteur: 'Aéronautique', contact: 'Claire Martin', email: 'claire.martin@aeronord-fictif.fr', telephone: '01 42 10 11 12', statut: 'Actif' },
    { id: 'CLI-002', nom: 'RailTech Composants', secteur: 'Ferroviaire', contact: 'Nicolas Petit', email: 'nicolas.petit@railtech-fictif.fr', telephone: '03 20 45 17 80', statut: 'Actif' },
    { id: 'CLI-003', nom: 'MediSteel Equipements', secteur: 'Médical', contact: 'Sarah Lopez', email: 'sarah.lopez@medisteel-fictif.fr', telephone: '04 91 65 23 44', statut: 'En suivi' },
    { id: 'CLI-004', nom: 'AgriMeca France', secteur: 'Agro-équipement', contact: 'Julien Robert', email: 'julien.robert@agrimeca-fictif.fr', telephone: '05 61 14 98 77', statut: 'Actif' },
    { id: 'CLI-005', nom: 'UrbanMobilité Groupe', secteur: 'Mobilité urbaine', contact: 'Emma Leroy', email: 'emma.leroy@urbanmobilite-fictif.fr', telephone: '01 75 54 63 90', statut: 'Prospect chaud' }
  ],
  commandes: [
    { id: 'CMD-001', numeroCommande: 'TC-2026-001', clientId: 'CLI-001', dateCommande: '2026-05-01', dateLivraisonDemandee: '2026-05-20', montant: 18450, priorite: 'Haute', statut: 'Validée' },
    { id: 'CMD-002', numeroCommande: 'TC-2026-002', clientId: 'CLI-002', dateCommande: '2026-05-02', dateLivraisonDemandee: '2026-05-22', montant: 9750, priorite: 'Moyenne', statut: 'Planifiée' },
    { id: 'CMD-003', numeroCommande: 'TC-2026-003', clientId: 'CLI-003', dateCommande: '2026-05-03', dateLivraisonDemandee: '2026-05-25', montant: 12680, priorite: 'Haute', statut: 'En production' },
    { id: 'CMD-004', numeroCommande: 'TC-2026-004', clientId: 'CLI-004', dateCommande: '2026-05-03', dateLivraisonDemandee: '2026-05-28', montant: 7420, priorite: 'Basse', statut: 'Validée' },
    { id: 'CMD-005', numeroCommande: 'TC-2026-005', clientId: 'CLI-005', dateCommande: '2026-05-04', dateLivraisonDemandee: '2026-05-30', montant: 21340, priorite: 'Urgente', statut: 'En préparation' },
    { id: 'CMD-006', numeroCommande: 'TC-2026-006', clientId: 'CLI-001', dateCommande: '2026-05-05', dateLivraisonDemandee: '2026-06-02', montant: 8890, priorite: 'Moyenne', statut: 'Planifiée' },
    { id: 'CMD-007', numeroCommande: 'TC-2026-007', clientId: 'CLI-003', dateCommande: '2026-05-05', dateLivraisonDemandee: '2026-06-04', montant: 15670, priorite: 'Haute', statut: 'Validée' },
    { id: 'CMD-008', numeroCommande: 'TC-2026-008', clientId: 'CLI-002', dateCommande: '2026-05-06', dateLivraisonDemandee: '2026-06-06', montant: 6340, priorite: 'Moyenne', statut: 'Validée' }
  ],
  ordresFabrication: [
    { id: 'OF-001', numeroOF: 'OF260501', commandeId: 'CMD-001', clientId: 'CLI-001', dateReception: '2026-05-02', dateProductionPrevue: '2026-05-08', dateLivraisonDemandee: '2026-05-20', priorite: 'Haute', statutGlobal: 'En cours', localisationActuelle: 'Préparation', referencesIds: ['REF-001', 'REF-002'] },
    { id: 'OF-002', numeroOF: 'OF260502', commandeId: 'CMD-002', clientId: 'CLI-002', dateReception: '2026-05-03', dateProductionPrevue: '2026-05-09', dateLivraisonDemandee: '2026-05-22', priorite: 'Moyenne', statutGlobal: 'Planifié', localisationActuelle: 'Réception', referencesIds: ['REF-003', 'REF-004'] },
    { id: 'OF-003', numeroOF: 'OF260503', commandeId: 'CMD-003', clientId: 'CLI-003', dateReception: '2026-05-03', dateProductionPrevue: '2026-05-10', dateLivraisonDemandee: '2026-05-25', priorite: 'Haute', statutGlobal: 'En cours', localisationActuelle: 'Peinture', referencesIds: ['REF-005', 'REF-006'] },
    { id: 'OF-004', numeroOF: 'OF260504', commandeId: 'CMD-004', clientId: 'CLI-004', dateReception: '2026-05-04', dateProductionPrevue: '2026-05-11', dateLivraisonDemandee: '2026-05-28', priorite: 'Basse', statutGlobal: 'En cours', localisationActuelle: 'Accroche', referencesIds: ['REF-007', 'REF-008'] },
    { id: 'OF-005', numeroOF: 'OF260505', commandeId: 'CMD-005', clientId: 'CLI-005', dateReception: '2026-05-04', dateProductionPrevue: '2026-05-12', dateLivraisonDemandee: '2026-05-30', priorite: 'Urgente', statutGlobal: 'Bloqué', localisationActuelle: 'Préparation', referencesIds: ['REF-009', 'REF-010'] },
    { id: 'OF-006', numeroOF: 'OF260506', commandeId: 'CMD-006', clientId: 'CLI-001', dateReception: '2026-05-05', dateProductionPrevue: '2026-05-14', dateLivraisonDemandee: '2026-06-02', priorite: 'Moyenne', statutGlobal: 'Planifié', localisationActuelle: 'Revue technique', referencesIds: ['REF-011', 'REF-012'] },
    { id: 'OF-007', numeroOF: 'OF260507', commandeId: 'CMD-007', clientId: 'CLI-003', dateReception: '2026-05-06', dateProductionPrevue: '2026-05-15', dateLivraisonDemandee: '2026-06-04', priorite: 'Haute', statutGlobal: 'En cours', localisationActuelle: 'Qualité', referencesIds: ['REF-013', 'REF-014'] },
    { id: 'OF-008', numeroOF: 'OF260508', commandeId: 'CMD-008', clientId: 'CLI-002', dateReception: '2026-05-06', dateProductionPrevue: '2026-05-16', dateLivraisonDemandee: '2026-06-06', priorite: 'Moyenne', statutGlobal: 'Terminé', localisationActuelle: 'Logistique', referencesIds: ['REF-015'] }
  ],
  referencesPieces: [
    { id: 'REF-001', ofId: 'OF-001', reference: 'AN-PLT-01', designation: 'Platine support', quantite: 80, gammeId: 'GAM-001', statut: 'En cours', localisation: 'Préparation', priorite: 'Haute' },
    { id: 'REF-002', ofId: 'OF-001', reference: 'AN-BRA-02', designation: 'Bras articulé', quantite: 40, gammeId: 'GAM-002', statut: 'En cours', localisation: 'Préparation', priorite: 'Haute' },
    { id: 'REF-003', ofId: 'OF-002', reference: 'RT-SUP-07', designation: 'Support rail', quantite: 120, gammeId: 'GAM-003', statut: 'Planifié', localisation: 'Réception', priorite: 'Moyenne' },
    { id: 'REF-004', ofId: 'OF-002', reference: 'RT-ENC-03', designation: 'Encadrement technique', quantite: 60, gammeId: 'GAM-004', statut: 'Planifié', localisation: 'Réception', priorite: 'Moyenne' },
    { id: 'REF-005', ofId: 'OF-003', reference: 'MS-CPR-11', designation: 'Capot protection', quantite: 95, gammeId: 'GAM-005', statut: 'En peinture', localisation: 'Peinture', priorite: 'Haute' },
    { id: 'REF-006', ofId: 'OF-003', reference: 'MS-PLQ-04', designation: 'Plaque latérale', quantite: 95, gammeId: 'GAM-005', statut: 'En peinture', localisation: 'Peinture', priorite: 'Haute' },
    { id: 'REF-007', ofId: 'OF-004', reference: 'AM-ARM-06', designation: 'Armature basse', quantite: 50, gammeId: 'GAM-006', statut: 'En accroche', localisation: 'Accroche', priorite: 'Basse' },
    { id: 'REF-008', ofId: 'OF-004', reference: 'AM-FIX-09', designation: 'Fixation centrale', quantite: 100, gammeId: 'GAM-006', statut: 'En accroche', localisation: 'Accroche', priorite: 'Basse' },
    { id: 'REF-009', ofId: 'OF-005', reference: 'UM-CHS-01', designation: 'Châssis urbain', quantite: 30, gammeId: 'GAM-007', statut: 'Bloqué', localisation: 'Préparation', priorite: 'Urgente' },
    { id: 'REF-010', ofId: 'OF-005', reference: 'UM-BRD-08', designation: 'Bride latérale', quantite: 90, gammeId: 'GAM-007', statut: 'Bloqué', localisation: 'Préparation', priorite: 'Urgente' },
    { id: 'REF-011', ofId: 'OF-006', reference: 'AN-TRV-05', designation: 'Traverse haute', quantite: 70, gammeId: 'GAM-001', statut: 'Planifié', localisation: 'Méthodes', priorite: 'Moyenne' },
    { id: 'REF-012', ofId: 'OF-006', reference: 'AN-BAQ-13', designation: 'Bague liaison', quantite: 140, gammeId: 'GAM-008', statut: 'Planifié', localisation: 'Méthodes', priorite: 'Moyenne' },
    { id: 'REF-013', ofId: 'OF-007', reference: 'MS-COL-14', designation: 'Colonne support', quantite: 55, gammeId: 'GAM-005', statut: 'Contrôle', localisation: 'Qualité', priorite: 'Haute' },
    { id: 'REF-014', ofId: 'OF-007', reference: 'MS-PLT-12', designation: 'Plateau médical', quantite: 55, gammeId: 'GAM-005', statut: 'Contrôle', localisation: 'Qualité', priorite: 'Haute' },
    { id: 'REF-015', ofId: 'OF-008', reference: 'RT-LNK-10', designation: 'Lien de fixation', quantite: 200, gammeId: 'GAM-004', statut: 'Terminé', localisation: 'Logistique', priorite: 'Moyenne' }
  ],
  gammes: [
    { id: 'GAM-001', nom: 'Gamme standard platines', referencePiece: 'AN-PLT-01', etapes: ['Réception', 'Revue technique', 'Préparation', 'Accroche', 'Peinture', 'Décroche', 'Qualité si nécessaire', 'Logistique'], tempsPrevuTotal: 185, commentaireMethode: 'Masquage renforcé sur perçages.' },
    { id: 'GAM-002', nom: 'Gamme bras articulés', referencePiece: 'AN-BRA-02', etapes: ['Réception', 'Préparation', 'Accroche', 'Peinture', 'Décroche', 'Qualité si nécessaire', 'Logistique'], tempsPrevuTotal: 160, commentaireMethode: 'Prévoir outillage spécifique axe.' },
    { id: 'GAM-003', nom: 'Gamme supports rail', referencePiece: 'RT-SUP-07', etapes: ['Réception', 'Revue technique', 'Préparation', 'Accroche', 'Peinture', 'Décroche', 'Logistique'], tempsPrevuTotal: 150, commentaireMethode: 'Contrôle d épaisseur après peinture.' },
    { id: 'GAM-004', nom: 'Gamme encadrements', referencePiece: 'RT-ENC-03', etapes: ['Réception', 'Préparation', 'Accroche', 'Peinture', 'Décroche', 'Qualité si nécessaire', 'Logistique'], tempsPrevuTotal: 170, commentaireMethode: 'Utiliser crochets longs uniquement.' },
    { id: 'GAM-005', nom: 'Gamme médicale', referencePiece: 'MS-CPR-11', etapes: ['Réception', 'Revue technique', 'Préparation', 'Accroche', 'Peinture', 'Décroche', 'Qualité si nécessaire', 'Logistique'], tempsPrevuTotal: 210, commentaireMethode: 'Exigence visuelle élevée sur faces visibles.' },
    { id: 'GAM-006', nom: 'Gamme agri standard', referencePiece: 'AM-ARM-06', etapes: ['Réception', 'Préparation', 'Accroche', 'Peinture', 'Décroche', 'Logistique'], tempsPrevuTotal: 145, commentaireMethode: 'Séparer pièces lourdes/légères.' },
    { id: 'GAM-007', nom: 'Gamme mobilité urgente', referencePiece: 'UM-CHS-01', etapes: ['Réception', 'Revue technique', 'Préparation', 'Accroche', 'Peinture', 'Décroche', 'Qualité si nécessaire', 'Logistique'], tempsPrevuTotal: 220, commentaireMethode: 'Flux prioritaire sous 48h.' },
    { id: 'GAM-008', nom: 'Gamme bagues', referencePiece: 'AN-BAQ-13', etapes: ['Réception', 'Préparation', 'Peinture', 'Décroche', 'Qualité si nécessaire', 'Logistique'], tempsPrevuTotal: 120, commentaireMethode: 'Contrôle visuel systématique.' }
  ],
  taches: Array.from({ length: 25 }, (_, i) => {
    const etapes = ['Préparation', 'Accroche', 'Peinture', 'Décroche', 'Qualité', 'Logistique'];
    const operateurs = ['OP-001', 'OP-002', 'OP-003', 'OP-004', 'OP-005', 'OP-006', 'OP-007', 'OP-008', 'OP-009', 'OP-010'];
    const refs = ['REF-001', 'REF-002', 'REF-003', 'REF-004', 'REF-005', 'REF-006', 'REF-007', 'REF-008', 'REF-009', 'REF-010', 'REF-011', 'REF-012', 'REF-013', 'REF-014', 'REF-015'];
    const ofs = ['OF-001', 'OF-002', 'OF-003', 'OF-004', 'OF-005', 'OF-006', 'OF-007', 'OF-008'];
    return {
      id: `TCH-${String(i + 1).padStart(3, '0')}`,
      ofId: ofs[i % ofs.length],
      referencePieceId: refs[i % refs.length],
      etape: etapes[i % etapes.length],
      operateurId: operateurs[i % operateurs.length],
      datePrevue: `2026-05-${String(7 + (i % 12)).padStart(2, '0')}`,
      tempsPrevu: 25 + (i % 6) * 10,
      tempsReel: 22 + (i % 7) * 11,
      statut: i % 5 === 0 ? 'Bloqué' : i % 3 === 0 ? 'Terminé' : 'En cours',
      priorite: i % 4 === 0 ? 'Haute' : 'Moyenne',
      commentaire: 'Tâche fictive de suivi atelier.'
    };
  }),
  operateurs: [
    { id: 'OP-001', nom: 'Durand', prenom: 'Alice', login: 'adurand', email: 'alice.durand@technocoat.local', role: 'Manager', activite: 'Manager', statutCompte: 'Actif' },
    { id: 'OP-002', nom: 'Petit', prenom: 'Nina', login: 'npetit', email: 'nina.petit@technocoat.local', role: 'Responsable méthode', activite: 'Méthodes', statutCompte: 'Actif' },
    { id: 'OP-003', nom: 'Bernard', prenom: 'Hugo', login: 'hbernard', email: 'hugo.bernard@technocoat.local', role: 'Préparation', activite: 'Préparation', statutCompte: 'Actif' },
    { id: 'OP-004', nom: 'Morel', prenom: 'Lina', login: 'lmorel', email: 'lina.morel@technocoat.local', role: 'Accroche', activite: 'Accroche', statutCompte: 'Actif' },
    { id: 'OP-005', nom: 'Roux', prenom: 'Sami', login: 'sroux', email: 'sami.roux@technocoat.local', role: 'Peinture', activite: 'Peinture', statutCompte: 'Actif' },
    { id: 'OP-006', nom: 'Michel', prenom: 'Noa', login: 'nmichel', email: 'noa.michel@technocoat.local', role: 'Décroche', activite: 'Décroche', statutCompte: 'Actif' },
    { id: 'OP-007', nom: 'Garcia', prenom: 'Inès', login: 'igarcia', email: 'ines.garcia@technocoat.local', role: 'Qualité', activite: 'Qualité', statutCompte: 'Actif' },
    { id: 'OP-008', nom: 'Faure', prenom: 'Tom', login: 'tfaure', email: 'tom.faure@technocoat.local', role: 'Logistique', activite: 'Logistique', statutCompte: 'Actif' },
    { id: 'OP-009', nom: 'Lemoine', prenom: 'Jade', login: 'jlemoine', email: 'jade.lemoine@technocoat.local', role: 'Administrateur', activite: 'Paramètres', statutCompte: 'Actif' },
    { id: 'OP-010', nom: 'Colin', prenom: 'Marc', login: 'mcolin', email: 'marc.colin@technocoat.local', role: 'Préparation', activite: 'Préparation', statutCompte: 'Suspendu' }
  ],
  stocks: Array.from({ length: 20 }, (_, i) => {
    const familles = ['Préparation', 'Accroche', 'Peinture', 'Qualité', 'Logistique', 'Général'];
    return {
      id: `STK-${String(i + 1).padStart(3, '0')}`,
      codeArticle: `ART-${100 + i}`,
      designation: `Article fictif ${i + 1}`,
      famille: familles[i % familles.length],
      stockActuel: 20 + i * 3,
      seuilMinimum: 18 + (i % 5) * 4,
      unite: i % 2 === 0 ? 'pcs' : 'kg',
      statut: (20 + i * 3) < (18 + (i % 5) * 4) ? 'Alerte' : 'OK',
      emplacement: `Zone ${String.fromCharCode(65 + (i % 5))}-${1 + (i % 4)}`,
      fournisseur: `Fournisseur fictif ${1 + (i % 6)}`
    };
  }),
  observations: Array.from({ length: 10 }, (_, i) => {
    const types = ['Anomalie', 'Amélioration', 'Information', 'Retard', 'Manque consommable', 'Outillage', 'Qualité'];
    const activites = ['Préparation', 'Accroche', 'Peinture', 'Décroche', 'Qualité', 'Logistique'];
    return {
      id: `OBS-${String(i + 1).padStart(3, '0')}`,
      date: `2026-05-${String(2 + i).padStart(2, '0')}`,
      operateurId: `OP-00${1 + (i % 8)}`,
      ofId: `OF-00${1 + (i % 8)}`,
      referencePieceId: `REF-${String(1 + (i % 15)).padStart(3, '0')}`,
      activite: activites[i % activites.length],
      type: types[i % types.length],
      importance: i % 3 === 0 ? 'Élevée' : 'Moyenne',
      commentaire: 'Observation fictive pour amélioration continue.',
      statutTraitement: i % 2 === 0 ? 'Ouvert' : 'En cours'
    };
  }),
  controlesQualite: Array.from({ length: 8 }, (_, i) => {
    const types = ['Contrôle visuel', 'Contrôle dimensionnel', 'Contrôle bain', 'Contrôle équipement', 'Contrôle process'];
    return {
      id: `CQ-${String(i + 1).padStart(3, '0')}`,
      date: `2026-05-${String(4 + i).padStart(2, '0')}`,
      typeControle: types[i % types.length],
      ofId: `OF-00${1 + (i % 8)}`,
      referencePieceId: `REF-${String(1 + (i % 15)).padStart(3, '0')}`,
      controleurId: `OP-00${7 + (i % 2)}`,
      resultat: i % 3 === 0 ? 'Non conforme' : 'Conforme',
      commentaire: 'Contrôle fictif enregistré.',
      statut: i % 3 === 0 ? 'Action requise' : 'Validé'
    };
  }),
  mouvementsLogistiques: Array.from({ length: 8 }, (_, i) => {
    const types = ['Réception pièces brutes', 'Mise à disposition produits finis', 'Expédition', 'Réception matière', 'Livraison client'];
    return {
      id: `MVL-${String(i + 1).padStart(3, '0')}`,
      date: `2026-05-${String(5 + i).padStart(2, '0')}`,
      typeMouvement: types[i % types.length],
      ofId: `OF-00${1 + (i % 8)}`,
      clientId: `CLI-00${1 + (i % 5)}`,
      referencePieceId: `REF-${String(1 + (i % 15)).padStart(3, '0')}`,
      quantite: 20 + i * 5,
      statut: i % 2 === 0 ? 'Terminé' : 'Planifié',
      commentaire: 'Mouvement logistique fictif.'
    };
  })
};

function getClientById(id) { return appData.clients.find((item) => item.id === id); }
function getCommandeById(id) { return appData.commandes.find((item) => item.id === id); }
function getOFById(id) { return appData.ordresFabrication.find((item) => item.id === id); }
function getReferenceById(id) { return appData.referencesPieces.find((item) => item.id === id); }
function getOperateurById(id) { return appData.operateurs.find((item) => item.id === id); }
function getTachesByActivite(activite) {
  const operateursActivite = appData.operateurs.filter((item) => item.activite === activite).map((item) => item.id);
  return appData.taches.filter((item) => operateursActivite.includes(item.operateurId));
}
function getTachesByOperateur(operateurId) { return appData.taches.filter((item) => item.operateurId === operateurId); }
function getStocksByFamille(famille) { return appData.stocks.filter((item) => item.famille === famille); }
function getObservationsByActivite(activite) { return appData.observations.filter((item) => item.activite === activite); }
function getReferencesByOF(ofId) { return appData.referencesPieces.filter((item) => item.ofId === ofId); }


function formatDateFr(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

function getManagerDataset(filters = {}) {
  const search = (filters.search || '').toLowerCase();
  const byOF = appData.ordresFabrication.filter((of) => {
    const client = getClientById(of.clientId);
    const textPool = `${of.numeroOF} ${of.statutGlobal} ${of.localisationActuelle} ${client?.nom || ''}`.toLowerCase();
    const bySearch = !search || textPool.includes(search);
    const byClient = !filters.clientId || of.clientId === filters.clientId;
    const byStatut = !filters.statutOF || of.statutGlobal === filters.statutOF;
    const byPriorite = !filters.priorite || of.priorite === filters.priorite;
    const byActivite = !filters.activite || of.localisationActuelle === filters.activite;
    const byPeriode = !filters.periode || of.dateProductionPrevue.startsWith(filters.periode);
    return bySearch && byClient && byStatut && byPriorite && byActivite && byPeriode;
  });

  const ofIds = new Set(byOF.map((x) => x.id));
  const references = appData.referencesPieces.filter((r) => ofIds.has(r.ofId));
  const taches = appData.taches.filter((t) => ofIds.has(t.ofId));
  const observations = appData.observations.filter((o) => ofIds.has(o.ofId));
  return { byOF, references, taches, observations };
}

function computeManagerKpis(dataset) {
  const { byOF, references, taches, observations } = dataset;
  const ouvertsObs = observations.filter((o) => o.statutTraitement !== 'Traité' && o.statutTraitement !== 'Clos').length;
  const stockCritiques = appData.stocks.filter((s) => s.stockActuel <= s.seuilMinimum).length;
  const ecartMoyen = taches.length ? Math.round(taches.reduce((acc, t) => acc + (t.tempsReel - t.tempsPrevu), 0) / taches.length) : 0;
  const today='2026-05-06';
  const ofRetard = byOF.filter((of)=> of.dateLivraisonDemandee < today && of.statutGlobal !== 'Terminé').length;
  return [
    ['👥', 'Clients', appData.clients.length, 'neutral'],['📦','Commandes',appData.commandes.length,'neutral'],['🏭','OF total',byOF.length,'neutral'],
    ['🔄','OF en cours',byOF.filter((x)=>x.statutGlobal==='En cours').length,'warn'],['✅','OF terminés',byOF.filter((x)=>x.statutGlobal==='Terminé').length,'good'],['⏰','OF en retard',ofRetard,'danger'],
    ['🧩','Références suivies',references.length,'neutral'],['🛠','Tâches ouvertes',taches.filter((x)=>x.statut!=='Terminé').length,'warn'],['✔️','Tâches terminées',taches.filter((x)=>x.statut==='Terminé').length,'good'],
    ['⚠️','Obs ouvertes',ouvertsObs,'danger'],['📉','Alertes stock',stockCritiques,'danger'],['⏱','Écart moyen',`${ecartMoyen} min`,ecartMoyen>10?'danger':ecartMoyen>0?'warn':'good']
  ];
}

function renderManagerPage() {
  const today = new Date().toLocaleDateString('fr-FR');
  const activities = ['Préparation','Accroche','Peinture','Décroche','Qualité','Logistique'];
  const totalCA = appData.commandes.reduce((a,c)=>a+c.montant,0);
  const ofTotal = appData.ordresFabrication.length;
  const ofCours = appData.ordresFabrication.filter((x)=>x.statutGlobal==='En cours').length;
  const ofTermines = appData.ordresFabrication.filter((x)=>x.statutGlobal==='Terminé').length;
  const ofBloques = appData.ordresFabrication.filter((x)=>x.statutGlobal==='Bloqué').length;
  const ofUrgents = appData.ordresFabrication.filter((x)=>x.priorite==='Urgente'||x.priorite==='Haute').length;
  const tachesOuvertes = appData.taches.filter((x)=>x.statut!=='Terminé').length;
  const tachesTerminees = appData.taches.filter((x)=>x.statut==='Terminé').length;
  const alertesStock = appData.stocks.filter((s)=>s.stockActuel<=s.seuilMinimum).length;
  const obsOuvertes = appData.observations.filter((o)=>o.statutTraitement!=='Traité').length;
  const ncOuvertes = appData.controlesQualite.filter((c)=>c.resultat==='Non conforme' && c.statut!=='Validé').length;
  const retards = appData.ordresFabrication.filter((x)=>x.dateLivraisonDemandee<'2026-05-06'&&x.statutGlobal!=='Terminé').length;
  const ecartTotal = appData.taches.reduce((a,t)=>a+(t.tempsReel-t.tempsPrevu),0);
  const ecartMoyen = Math.round(ecartTotal / appData.taches.length);
  const tauxRealisation = Math.round((ofTermines/ofTotal)*100);

  contentNode.innerHTML = `<section class="executive-header card"><div><h2 class="page-title">Tableau de bord Manager</h2><p class="page-subtitle">Vision globale de la performance atelier</p><div class="manager-meta"><span>Date : ${today}</span><span>Utilisateur : John Doe</span><span>Rôle : Manager</span></div></div><div class="exec-actions"><button class="detail-btn">Exporter</button><button class="detail-btn">Voir les alertes</button><button class="detail-btn">Analyse détaillée</button></div></section>
  <section class="big-kpi-grid">
    <article class="big-kpi neutral"><small>💶 Commandes en cours</small><strong>${appData.commandes.length} · ${totalCA.toLocaleString('fr-FR')} €</strong><p>+12% vs semaine précédente</p></article>
    <article class="big-kpi warn"><small>🏭 OF en cours</small><strong>${ofCours}</strong><p>Charge atelier en hausse</p></article>
    <article class="big-kpi good"><small>📈 Taux de réalisation</small><strong>${tauxRealisation}%</strong><p>Progression stable</p></article>
    <article class="big-kpi ${ecartMoyen>10?'danger':'warn'}"><small>⏱ Écart prévu/réel</small><strong>${ecartMoyen} min</strong><p>${ecartMoyen>10?'Écart à réduire':'Écart maîtrisé'}</p></article>
  </section>
  <section class="kpi-grid compact"><article class="kpi-card good"><small>OF terminés</small><strong>${ofTermines}</strong></article><article class="kpi-card danger"><small>OF bloqués</small><strong>${ofBloques}</strong></article><article class="kpi-card warn"><small>OF urgents</small><strong>${ofUrgents}</strong></article><article class="kpi-card warn"><small>Tâches ouvertes</small><strong>${tachesOuvertes}</strong></article><article class="kpi-card good"><small>Tâches terminées</small><strong>${tachesTerminees}</strong></article><article class="kpi-card danger"><small>Alertes stock</small><strong>${alertesStock}</strong></article><article class="kpi-card danger"><small>Observations ouvertes</small><strong>${obsOuvertes}</strong></article><article class="kpi-card danger"><small>NC ouvertes</small><strong>${ncOuvertes}</strong></article><article class="kpi-card warn"><small>Retards livraison</small><strong>${retards}</strong></article><article class="kpi-card neutral"><small>Charge moyenne</small><strong>${Math.round((tachesOuvertes/appData.operateurs.length)*100)}%</strong></article><article class="kpi-card warn"><small>Taux anomalies</small><strong>${Math.round((obsOuvertes/appData.taches.length)*100)}%</strong></article><article class="kpi-card warn"><small>Taux retard</small><strong>${Math.round((retards/ofTotal)*100)}%</strong></article></section>
  <section class="manager-tabs"><button class="manager-tab active" data-tab="synth">Synthèse</button><button class="manager-tab" data-tab="alertes">Alertes</button><button class="manager-tab" data-tab="perf">Performance</button><button class="manager-tab" data-tab="charge">Charge atelier</button><button class="manager-tab" data-tab="temps">Temps & écarts</button><button class="manager-tab" data-tab="stocks">Stocks critiques</button><button class="manager-tab" data-tab="rex">REX / observations</button><button class="manager-tab" data-tab="analyse">Analyse & export</button></section>
  <section id="manager-tab-content"></section>
  <section class="card"><h3>Accès rapide</h3><div class="quick-links"><button class="detail-btn" data-nav="production">Voir Production / OF</button><button class="detail-btn" data-nav="preparation">Voir Préparation</button><button class="detail-btn" data-nav="peinture">Voir Peinture</button><button class="detail-btn" data-nav="qualite">Voir Qualité</button><button class="detail-btn" data-nav="stock">Voir Stock</button><button class="detail-btn" data-nav="base-donnees">Voir Base de données</button></div></section>`;

  function tabContent(tab) {
    const node=document.getElementById('manager-tab-content');
    if(tab==='synth'){node.innerHTML=`<div class="triple-grid"><article class="card"><h3>Résumé atelier</h3><p>Atelier avec ${ofCours} OF en cours, ${ofBloques} OF bloqués et ${alertesStock} alertes stock.</p></article><article class="card"><h3>3 priorités du jour</h3><ul><li>Surveiller OF urgents en préparation.</li><li>Sécuriser stocks critiques peinture.</li><li>Réduire les écarts temps élevés.</li></ul></article><article class="card"><h3>3 risques / 3 actions</h3><ul><li>Risque: retard livraison → Action: suivi OF bloqués.</li><li>Risque: rupture stock → Action: commande fournisseur.</li><li>Risque: non-qualité → Action: revue contrôle process.</li></ul></article></div>`;}
    if(tab==='alertes'){const cards=[];if(ofBloques)cards.push(['critique',`${ofBloques} OF bloqués`,`Production`,`OF prioritaires`]);if(ofUrgents)cards.push(['attention',`${ofUrgents} OF urgents`,`Préparation`,`Flux atelier`]);if(retards)cards.push(['critique',`${retards} retards livraison`,`Logistique`,`OF en retard`]);if(alertesStock)cards.push(['attention',`${alertesStock} stocks critiques`,`Stock`,`Articles bas`]);if(obsOuvertes)cards.push(['information',`${obsOuvertes} observations ouvertes`,`REX`,`Suivi opérateur`]);if(ncOuvertes)cards.push(['critique',`${ncOuvertes} NC ouvertes`,`Qualité`,`Contrôles`]);node.innerHTML=`<div class="alert-grid">${cards.map((c)=>`<article class="alert-card ${c[0]}"><small>${c[0]}</small><h4>${c[1]}</h4><p>${c[2]} · ${c[3]}</p><button class="detail-btn">Voir détail</button></article>`).join('')}</div>`;}
    if(tab==='perf'){const t1=tauxRealisation,t2=Math.round((tachesTerminees/appData.taches.length)*100),t3=Math.round((retards/ofTotal)*100),t4=Math.max(0,100-Math.round((ncOuvertes/appData.controlesQualite.length)*100));node.innerHTML=`<div class="perf-grid"><article class="kpi-card good"><small>Taux OF terminés</small><strong>${t1}%</strong><div class="progress"><div style="width:${t1}%"></div></div></article><article class="kpi-card good"><small>Taux tâches terminées</small><strong>${t2}%</strong><div class="progress"><div style="width:${t2}%"></div></div></article><article class="kpi-card warn"><small>Taux retard</small><strong>${t3}%</strong><div class="progress"><div style="width:${t3}%"></div></div></article><article class="kpi-card ${t4>80?'good':'warn'}"><small>Taux conformité qualité</small><strong>${t4}%</strong><div class="progress"><div style="width:${t4}%"></div></div></article><article class="kpi-card neutral"><small>Productivité simulée</small><strong>${Math.round((tachesTerminees/tachesOuvertes)*100)}%</strong></article><article class="kpi-card neutral"><small>Évolution semaine</small><strong>+7%</strong></article></div>`;}
    if(tab==='charge'){node.innerHTML=`<article class="card">${activities.map((a)=>{const t=getTachesByActivite(a).filter(x=>x.statut!=='Terminé');const tp=t.reduce((s,x)=>s+x.tempsPrevu,0);const tr=t.reduce((s,x)=>s+x.tempsReel,0);const load=Math.min(100,Math.round((tr/(tp||1))*100));const st=load>110?'Critique':load>90?'Chargé':'Normal';return `<div class="charge-row"><span><strong>${a}</strong> · ${t.length} tâches ouvertes · ${tp}m/${tr}m · ${st}</span><div class="progress"><div style="width:${Math.min(load,100)}%"></div></div></div>`;}).join('')}</article>`;}
    if(tab==='temps'){node.innerHTML=`<article class="card"><div class="table-wrap"><table><thead><tr><th>OF</th><th>Référence</th><th>Activité</th><th>Opérateur</th><th>Prévu</th><th>Réel</th><th>Écart</th><th>Niveau</th></tr></thead><tbody>${appData.taches.filter(t=>t.tempsReel-t.tempsPrevu>=10).map((t)=>{const e=t.tempsReel-t.tempsPrevu; const lvl=e>20?'critique':e>12?'à surveiller':'maîtrisé'; const cls=e>20?'red':e>12?'orange':'green';const of=getOFById(t.ofId);const r=getReferenceById(t.referencePieceId);const op=getOperateurById(t.operateurId);return `<tr><td>${of?.numeroOF||'-'}</td><td>${r?.reference||'-'}</td><td>${t.etape}</td><td>${op?.prenom||''} ${op?.nom||''}</td><td>${t.tempsPrevu}</td><td>${t.tempsReel}</td><td>+${e}</td><td><span class="badge ${cls}">${lvl}</span></td></tr>`;}).join('')}</tbody></table></div></article>`;}
    if(tab==='stocks'){node.innerHTML=`<article class="card"><div class="table-wrap"><table><thead><tr><th>Famille</th><th>Article</th><th>Stock</th><th>Seuil</th><th>Statut</th><th>Action suggérée</th></tr></thead><tbody>${appData.stocks.filter(s=>s.stockActuel<=s.seuilMinimum).map((s)=>{const crit=s.stockActuel<=s.seuilMinimum*0.7;return `<tr><td>${s.famille}</td><td>${s.designation}</td><td>${s.stockActuel}</td><td>${s.seuilMinimum}</td><td><span class="badge ${crit?'red':'orange'}">${crit?'Critique':'Bas'}</span></td><td>${crit?'Préparer commande fournisseur':'Vérifier consommation atelier'}</td></tr>`;}).join('')}</tbody></table></div></article>`;}
    if(tab==='rex'){const open=appData.observations.filter(o=>o.statutTraitement!=='Traité');const crit=open.filter(o=>o.importance==='Élevée').length;node.innerHTML=`<div class="triple-grid"><article class="card"><h3>Résumé REX</h3><p>Ouvertes: ${open.length} · Critiques: ${crit} · Traitées fictives: ${appData.observations.length-open.length}</p><p>Causes principales: Anomalie, Retard, Qualité.</p></article><article class="card"><div class="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Activité</th><th>OF</th><th>Importance</th><th>Statut</th></tr></thead><tbody>${open.map((o)=>{const of=getOFById(o.ofId);return `<tr><td>${formatDateFr(o.date)}</td><td>${o.type}</td><td>${o.activite}</td><td>${of?.numeroOF||'-'}</td><td>${o.importance}</td><td>${o.statutTraitement}</td></tr>`;}).join('')}</tbody></table></div></article></div>`;}
    if(tab==='analyse'){node.innerHTML=`<article class="card"><h3>Analyse & export</h3><div class="filters-grid"><input type="month"/><select><option>Client</option>${appData.clients.map(c=>`<option>${c.nom}</option>`).join('')}</select><select><option>Activité</option>${activities.map(a=>`<option>${a}</option>`).join('')}</select><select><option>Priorité</option><option>Urgente</option><option>Haute</option><option>Moyenne</option></select><select><option>Statut</option><option>En cours</option><option>Bloqué</option><option>Terminé</option></select><button class="detail-btn" onclick="alert('Export CSV simulé')">Export CSV</button><button class="detail-btn" onclick="alert('Export Excel simulé')">Export Excel</button><button class="detail-btn" onclick="alert('Export PDF simulé')">Export PDF</button></div><p class="page-subtitle">Les exports sont simulés dans cette maquette.</p></article>`;}
  }
  function activateTab(tab){document.querySelectorAll('.manager-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));tabContent(tab);}  
  document.querySelectorAll('.manager-tab').forEach(b=>b.addEventListener('click',()=>activateTab(b.dataset.tab)));
  document.querySelectorAll('[data-nav]').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.nav;renderPage(key);setActiveButton(key);}));
  activateTab('synth');
}

const pages = {
  manager: { title: 'Manager', subtitle: 'Vue globale des indicateurs de pilotage atelier.', description: 'Synthèse fictive des OF, délais, qualité et charge atelier.', metrics: ['OF en cours : 12', 'Tâches terminées : 38', 'Alertes stock : 2'] },
  production: { title: 'Production / OF', subtitle: 'Suivi des ordres de fabrication et des priorités.', description: 'Liste simplifiée des OF actifs et de leur avancement.', metrics: ['OF en attente : 5', 'OF terminés : 27', 'Retards : 1'] },
  'responsable-methode': { title: 'Responsable méthode', subtitle: 'Préparation des gammes et standards de fabrication.', description: 'Structure métier prête pour intégrer les gammes par référence.', metrics: ['Gammes actives : 18', 'Révisions en cours : 3', 'Écarts process : 0'] },
  preparation: { title: 'Préparation', subtitle: 'Tâches opérateur et préparation des pièces.', description: 'Suivi fictif des besoins masquage et outillage.', metrics: ['Tâches du jour : 9', 'Temps prévu : 6h20', 'Blocages : 1'] },
  accroche: { title: 'Accroche', subtitle: 'Organisation des balancelles et accroche des pièces.', description: 'Zone de suivi des priorités et consommables accroche.', metrics: ['OF à accrocher : 4', 'Crochets dispo : 160', 'Retards : 0'] },
  peinture: { title: 'Peinture', subtitle: 'Pilotage cabine et consommation peinture.', description: 'Indicateurs fictifs sur cadence, qualité et consommables.', metrics: ['OF en cabine : 3', 'Conso poudre : 42 kg', 'Alertes qualité : 1'] },
  decroche: { title: 'Décroche', subtitle: 'Suivi des pièces en sortie et transfert.', description: 'Visualisation simplifiée de la décroche et du flux aval.', metrics: ['Lots à décrocher : 6', 'Transferts prêts : 4', 'Anomalies : 0'] },
  qualite: { title: 'Qualité', subtitle: 'Contrôles qualité et suivi des non-conformités.', description: 'Emplacement réservé aux contrôles visuels et dimensionnels.', metrics: ['Contrôles prévus : 14', 'NC ouvertes : 2', 'NC clôturées : 5'] },
  logistique: { title: 'Logistique', subtitle: 'Expéditions, livraisons et coordination flux.', description: 'Synthèse fictive du stock global et des livraisons.', metrics: ['Expéditions du jour : 3', 'Réceptions : 2', 'Urgences : 1'] },
  stock: { title: 'Stock', subtitle: 'Stock central et alertes de réapprovisionnement.', description: 'Base propre pour le suivi des niveaux par activité.', metrics: ['Articles suivis : 124', 'Articles en alerte : 7', 'Ruptures : 0'] },
  'base-donnees': { title: 'Base de données', subtitle: 'Page de simulation des données futures.', description: 'Aucune base réelle : uniquement un espace de préparation fonctionnelle.', metrics: ['Tables simulées : 11', 'Données fictives : actives', 'Connexion réelle : non'] },
  parametres: { title: 'Paramètres / Utilisateurs', subtitle: 'Gestion visuelle des profils et préférences.', description: 'Préparation des rôles sans authentification réelle.', metrics: ['Utilisateurs fictifs : 10', 'Rôles configurés : 9', 'Demandes accès : 2'] }
};

const contentNode = document.getElementById('page-content');
const navButtons = document.querySelectorAll('.sidebar-nav button');

function renderPage(pageKey) {
  if (pageKey === 'manager') {
    renderManagerPage();
    return;
  }
  const page = pages[pageKey];
  if (!page) return;
  contentNode.innerHTML = `<h2 class="page-title">${page.title}</h2><p class="page-subtitle">${page.subtitle}</p><article class="card"><h3>Carte de présentation</h3><p>${page.description}</p><div class="badges"><span class="badge orange">Priorité atelier</span><span class="badge green">Suivi terminé</span><span class="badge red">Alerte active</span></div></article><article class="card"><h3>Données fictives</h3><ul>${page.metrics.map((metric) => `<li>${metric}</li>`).join('')}</ul></article><article class="todo-box"><strong>À développer :</strong> contenu détaillé métier, tableaux OF et formulaires opérateurs.</article>`;
}

function setActiveButton(pageKey) {
  navButtons.forEach((button) => button.classList.toggle('active-nav', button.dataset.section === pageKey));
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const pageKey = button.dataset.section;
    renderPage(pageKey);
    setActiveButton(pageKey);
  });
});

document.getElementById('change-role').addEventListener('click', () => {
  window.alert('Simulation : changement de rôle à développer.');
});

console.log('appData chargé :', {
  clients: appData.clients.length,
  commandes: appData.commandes.length,
  ordresFabrication: appData.ordresFabrication.length,
  referencesPieces: appData.referencesPieces.length
});

renderPage('manager');
setActiveButton('manager');
