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
