export const initialDatabase = {
  clients: Array.from({ length: 5 }, (_, i) => ({ id: i + 1, nom: `Client ${i + 1}`, secteur: 'Industrie', statut: i % 2 ? 'Actif' : 'Prospect' })),
  commandes: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, numero: `CMD-2026-${String(i + 1).padStart(3, '0')}`, clientId: (i % 5) + 1, statut: i % 2 ? 'En cours' : 'Planifiée', date: `2026-05-${String((i % 9) + 1).padStart(2, '0')}` })),
  affaires: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, code: `AFF-2026-${String(i + 1).padStart(3, '0')}`, commandeId: (i % 8) + 1, priorite: ['Haute', 'Moyenne', 'Basse'][i % 3] })),
  referencesPieces: Array.from({ length: 15 }, (_, i) => ({ id: i + 1, reference: `REF-P-${String(i + 1).padStart(4, '0')}`, affaireId: (i % 8) + 1, matiere: ['Acier', 'Aluminium', 'Inox'][i % 3] })),
  gammes: Array.from({ length: 5 }, (_, i) => ({ id: i + 1, code: `GAM-${String(i + 1).padStart(3, '0')}`, nom: `Gamme ${i + 1}`, version: 'v1' })),
  etapesGamme: Array.from({ length: 25 }, (_, i) => ({ id: i + 1, gammeId: (i % 5) + 1, ordre: (i % 5) + 1, atelier: ['Préparation', 'Accroche', 'Peinture', 'Décroche', 'Qualité'][i % 5] })),
  taches: Array.from({ length: 30 }, (_, i) => ({ id: i + 1, affaireId: (i % 8) + 1, poste: ['Préparation', 'Accroche', 'Peinture', 'Décroche', 'Qualité'][i % 5], tempsPrevuMin: 30 + i * 5 })),
  personnel: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, nom: `Operateur ${i + 1}`, role: ['Préparation', 'Accroche', 'Peinture', 'Décroche', 'Qualité'][i % 5], actif: true })),
  stocks: Array.from({ length: 20 }, (_, i) => ({ id: i + 1, article: `STK-${String(i + 1).padStart(4, '0')}`, designation: `Article stock ${i + 1}`, quantite: 100 - i * 2 })),
  mouvementsStock: Array.from({ length: 15 }, (_, i) => ({ id: i + 1, articleId: (i % 20) + 1, type: i % 2 ? 'Entrée' : 'Sortie', quantite: 5 + i, date: `2026-05-${String((i % 9) + 1).padStart(2, '0')}` })),
  qualitePieces: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, referenceId: (i % 15) + 1, resultat: i % 3 ? 'Conforme' : 'NC', controleur: `Q${(i % 4) + 1}` })),
  controlesEquipements: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, equipement: `EQ-${String(i + 1).padStart(3, '0')}`, statut: i % 3 ? 'Valide' : 'A vérifier', date: `2026-04-${String((i % 9) + 10).padStart(2, '0')}` })),
  logistique: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, affaireId: (i % 8) + 1, mouvement: i % 2 ? 'Expédition' : 'Réception', transporteur: `Transporteur ${((i % 4) + 1)}` })),
  observations: Array.from({ length: 15 }, (_, i) => ({ id: i + 1, affaireId: (i % 8) + 1, auteur: `User ${((i % 6) + 1)}`, texte: `Observation opérationnelle ${i + 1}`, date: `2026-05-${String((i % 9) + 1).padStart(2, '0')}` }))
};
