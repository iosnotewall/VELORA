export interface Product {
  id: string;
  name: string;
  tagline: string;
  color: string;
  goals: string[];
}

export const PRODUCTS: Product[] = [
  { id: 'magnesium', name: 'Magnesium Complex', tagline: 'Muscle, sleep & psychological health', color: '#7B8FC4', goals: ['sleep', 'stress', 'sport'] },
  { id: 'energy_formula', name: 'Energy Formula', tagline: 'Energy & fatigue reduction', color: '#D4A853', goals: ['energy'] },
  { id: 'hormonal_balance', name: 'Hormonal Balance', tagline: 'Hormonal support', color: '#C4857A', goals: ['hormones', 'stress'] },
  { id: 'vitamin_d3k2', name: 'Vitamin D3 + K2', tagline: 'Bone, muscle & immunity', color: '#4A90D9', goals: ['immune', 'sport'] },
  { id: 'omega3', name: 'Omega 3 (Vegan)', tagline: 'Cardiovascular & general health', color: '#5A8A6F', goals: ['immune', 'sport', 'focus'] },
  { id: 'metabolic_support', name: 'Metabolic Support', tagline: 'Glucose, cholesterol & liver', color: '#D4A853', goals: ['metabolism'] },
  { id: 'memory_focus', name: 'Memory & Focus', tagline: 'Focus & concentration', color: '#8B6BB8', goals: ['focus'] },
  { id: 'anti_inflammatory', name: 'Anti-Inflammatory (PEA)', tagline: 'Pain & inflammation relief', color: '#5A8A6F', goals: ['sleep'] },
  { id: 'fertility', name: 'Fertility Support', tagline: 'Fertility & reproductive health', color: '#C4857A', goals: ['hormones'] },
  { id: 'other', name: 'Other supplement', tagline: 'General', color: '#8A8A8A', goals: [] },
];
