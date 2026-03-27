export interface Product {
  id: string;
  name: string;
  tagline: string;
  color: string;
  goals: string[];
}

export const PRODUCTS: Product[] = [
  { id: 'magnesium', name: 'High-Absorption Magnesium', tagline: 'Bisglycinate + Malate for muscle, sleep & mood', color: '#7B8FC4', goals: ['stress', 'energy', 'pain', 'cycle'] },
  { id: 'vegan_omega3', name: 'Vegan Omega-3 (Algae)', tagline: 'Plant-based EPA + DHA from algae', color: '#5A8A6F', goals: ['focus', 'antiaging', 'fertility'] },
  { id: 'omega3_epa', name: 'Omega-3 High in EPA', tagline: 'Cardiovascular & anti-inflammatory support', color: '#4A90D9', goals: ['pain', 'energy'] },
  { id: 'omega3_dha', name: 'Omega-3 High in DHA', tagline: 'Brain, vision & fertility support', color: '#8B6BB8', goals: ['focus', 'fertility'] },
  { id: 'vitamin_d3k2', name: 'Vitamin D3 + K2', tagline: 'Bone, muscle & immune health', color: '#D4A853', goals: ['energy', 'menopause', 'fertility'] },
  { id: 'vitamin_d3k2_spray', name: 'Vitamin D3 + K2 Spray', tagline: 'Sublingual spray for faster absorption', color: '#D4A853', goals: ['energy', 'menopause'] },
  { id: 'vitamin_c', name: 'Vitamin C 500mg', tagline: 'Immune & antioxidant protection', color: '#E8A838', goals: ['antiaging', 'energy'] },
  { id: 'iron_complex', name: 'Iron Replenishment Complex', tagline: 'Restore iron levels with absorption cofactors', color: '#C4857A', goals: ['energy', 'cycle', 'fertility'] },
  { id: 'methyl_b12', name: 'Methylcobalamin B12 Liquid', tagline: 'Energy metabolism & neurological health', color: '#8B6BB8', goals: ['energy', 'focus'] },
  { id: 'pea_relief', name: 'PEA Pain & Inflammation Relief', tagline: 'Natural palmitoylethanolamide for pain', color: '#5A8A6F', goals: ['pain'] },
  { id: 'adaptogen_stress', name: 'Adaptogen Stress Support', tagline: 'Adaptogenic herbs for emotional resilience', color: '#7B8FC4', goals: ['stress'] },
  { id: 'hormonal_balance', name: 'Female Hormonal Balance', tagline: 'Steroid hormone metabolism & cycle regulation', color: '#C4857A', goals: ['cycle', 'metabolism'] },
  { id: 'cellular_antioxidant', name: 'Cellular Antioxidant Complex', tagline: 'Broad-spectrum skin, energy & cellular health', color: '#C9956B', goals: ['antiaging'] },
  { id: 'menopause_comfort', name: 'Menopause Comfort Formula', tagline: 'Hot flashes, mood & bone support', color: '#E87C6F', goals: ['menopause'] },
  { id: 'thyroid_energy', name: 'Thyroid & Energy Support', tagline: 'Iodine, selenium & tyrosine for fatigue', color: '#D4A853', goals: ['energy'] },
  { id: 'energy_formula', name: 'Energy & Anti-Fatigue Formula', tagline: 'Reduce tiredness, boost energy metabolism', color: '#E8A838', goals: ['energy'] },
  { id: 'metabolic_support', name: 'Metabolic Health & Glucose Balance', tagline: 'Blood sugar, cholesterol & liver support', color: '#E8A838', goals: ['metabolism'] },
  { id: 'appetite_control', name: 'Appetite Control & Satiety', tagline: 'Reduce hunger, increase fullness signals', color: '#C4857A', goals: ['metabolism'] },
  { id: 'soluble_fiber', name: 'Soluble Fiber Supplement', tagline: 'Digestive health & gut regularity powder', color: '#81C784', goals: ['digestion', 'metabolism'] },
  { id: 'sleep_recovery', name: 'Sleep & Recovery Night Formula', tagline: 'Restorative sleep powder for deep rest', color: '#7B8FC4', goals: ['stress'] },
  { id: 'memory_nootropic', name: 'Memory & Concentration Nootropic', tagline: 'Cognitive support, focus & recall', color: '#8B6BB8', goals: ['focus'] },
  { id: 'joint_health', name: 'Joint Health & Mobility Complex', tagline: 'Collagen, glucosamine & joint support', color: '#5A8A6F', goals: ['pain', 'antiaging'] },
  { id: 'fertility_optimizer', name: 'Female Fertility Optimizer', tagline: 'Powder for egg quality & hormonal balance', color: '#D4768A', goals: ['fertility'] },
  { id: 'lactation_support', name: 'Postpartum & Lactation Multivitamin', tagline: 'Breastfeeding nutritional support', color: '#E87C6F', goals: ['fertility'] },
  { id: 'prenatal_multi', name: 'Prenatal Pregnancy Multivitamin', tagline: 'Fetal development & maternal health', color: '#E87C6F', goals: ['fertility'] },
  { id: 'preconception_multi', name: 'Pre-Conception Women\'s Multivitamin', tagline: 'Prepare your body for pregnancy', color: '#D4768A', goals: ['fertility'] },
  { id: 'dairy_protein', name: 'Dairy Protein Powder', tagline: 'High-quality protein for muscle & bone', color: '#D4A853', goals: ['energy', 'antiaging'] },
  { id: 'vegan_protein', name: 'Vegan Plant Protein', tagline: '100% plant-based muscle support', color: '#5A8A6F', goals: ['energy', 'antiaging'] },
  { id: 'creatine', name: 'Creatine Monohydrate', tagline: 'Physical performance & strength', color: '#4A90D9', goals: ['energy'] },
  { id: 'creatine_magnesium', name: 'Creatine + Magnesium Recovery', tagline: 'Performance & muscle recovery blend', color: '#4A90D9', goals: ['energy', 'pain'] },
];
