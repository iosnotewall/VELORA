export const GOALS = [
  { id: 'energy', label: 'Energy & Vitality', sub: 'Beat daily fatigue', icon: 'Zap' as const, feeling: 'energized' },
  { id: 'sleep', label: 'Sleep & Recovery', sub: 'Rest deeply, wake rested', icon: 'Moon' as const, feeling: 'well-rested' },
  { id: 'focus', label: 'Focus & Memory', sub: 'Think sharper, longer', icon: 'Brain' as const, feeling: 'focused' },
  { id: 'stress', label: 'Stress & Anxiety', sub: 'Calm your nervous system', icon: 'Leaf' as const, feeling: 'calm' },
  { id: 'metabolism', label: 'Metabolism', sub: 'Weight & glucose control', icon: 'Flame' as const, feeling: 'metabolically balanced' },
  { id: 'hormones', label: 'Hormonal Balance', sub: 'Cycles, menopause, PMS', icon: 'Heart' as const, feeling: 'hormonally balanced' },
  { id: 'sport', label: 'Sport & Performance', sub: 'Train harder, recover faster', icon: 'Dumbbell' as const, feeling: 'at peak performance' },
  { id: 'immune', label: 'Immune System', sub: 'Stay strong year-round', icon: 'Shield' as const, feeling: 'strong and healthy' },
] as const;

export type GoalId = typeof GOALS[number]['id'];

export const SCIENCE_CONTENT: Record<string, { text: string; ingredients: string[] }> = {
  energy: {
    text: "Your cells produce energy through mitochondria — tiny powerhouses that rely on magnesium and B-vitamins to function. Without consistent intake, mitochondrial efficiency drops, and you feel it as that mid-afternoon crash. Bioavailable supplement forms ensure your body can actually absorb and use what it needs.",
    ingredients: ['Energy Formula', 'Magnesium Complex', 'Vitamin D3 + K2'],
  },
  sleep: {
    text: "Melatonin production, muscle relaxation, and nervous system downregulation all require magnesium. Most people are deficient without knowing it. Consistent supplementation raises baseline levels over 2-3 weeks, gradually shifting your sleep architecture toward deeper, more restorative cycles.",
    ingredients: ['Magnesium Complex', 'Anti-Inflammatory (PEA)'],
  },
  stress: {
    text: "Cortisol — your stress hormone — depletes magnesium with every spike. The more stressed you are, the more you need it. Consistent magnesium supplementation helps regulate the HPA axis, the system that controls your stress response.",
    ingredients: ['Magnesium Complex', 'Hormonal Balance'],
  },
  focus: {
    text: "Cognitive performance relies on acetylcholine synthesis and cerebral blood flow. Specific adaptogens and phospholipids — when taken consistently — cross the blood-brain barrier and measurably improve reaction time and working memory.",
    ingredients: ['Memory & Focus', 'Omega 3 (Vegan)'],
  },
  hormones: {
    text: "Hormonal synthesis requires specific micronutrients as cofactors. Without them, your body can't produce estrogen and progesterone at optimal ratios. Clinical-grade compounds shown in trials support steroidogenic enzyme function and restore balance.",
    ingredients: ['Hormonal Balance', 'Vitamin D3 + K2'],
  },
  metabolism: {
    text: "Blood glucose regulation is the foundation of metabolic health. Consistent supplementation with chromium, berberine, and specific plant compounds improves insulin sensitivity and reduces post-meal glucose spikes — the root of weight gain.",
    ingredients: ['Metabolic Support'],
  },
  sport: {
    text: "Muscle protein synthesis, VO2 max, and recovery all depend on micronutrient sufficiency. Deficiencies — even small ones — measurably reduce performance output. Consistent omega-3 and magnesium intake is the baseline every athlete needs.",
    ingredients: ['Omega 3 (Vegan)', 'Magnesium Complex'],
  },
  immune: {
    text: "Your immune system runs on vitamin D, zinc, and omega-3 fatty acids. Modern indoor lifestyles leave 70% of Europeans deficient in D3. Consistent daily supplementation at clinical doses — not the tiny RDA amounts — makes a statistically significant difference in infection frequency and severity.",
    ingredients: ['Vitamin D3 + K2', 'Omega 3 (Vegan)'],
  },
};

export const GAP_INSIGHTS: Record<string, string> = {
  low: "Most people feel this way before building a consistent routine. The science shows it takes 21 days of consistency to feel real change.",
  mid: "You're already on the right track. Consistency will take you from 'sometimes' to 'always' within 30 days.",
  high: "Impressive. Let's make sure you never lose this momentum — even on your hardest days.",
};

export const MILESTONES: Record<string, { d7: string; d21: string; d30: string }> = {
  energy: {
    d7: "Your cells are beginning to absorb the magnesium.",
    d21: "Morning energy arrives faster. Afternoon crashes soften.",
    d30: "Sustained energy is your new normal.",
  },
  sleep: {
    d7: "Sleep onset may feel slightly easier.",
    d21: "Deeper sleep cycles, fewer night wakings.",
    d30: "You wake rested. Consistently.",
  },
  stress: {
    d7: "Cortisol response begins to regulate.",
    d21: "You feel less reactive. More grounded.",
    d30: "Stress still exists — but you handle it differently.",
  },
  focus: {
    d7: "Subtle clarity in the morning.",
    d21: "Longer periods of deep focus without effort.",
    d30: "Your cognitive baseline has shifted upward.",
  },
  hormones: {
    d7: "Inflammation markers beginning to shift.",
    d21: "Cycle symptoms less intense. Mood more stable.",
    d30: "A new hormonal rhythm is establishing itself.",
  },
  metabolism: {
    d7: "Insulin sensitivity is beginning to improve.",
    d21: "Post-meal energy crashes are softening.",
    d30: "Your metabolic baseline has shifted.",
  },
  sport: {
    d7: "Recovery between sessions begins to improve.",
    d21: "Performance output measurably improves.",
    d30: "Your body is operating at a new level.",
  },
  immune: {
    d7: "Vitamin D levels are beginning to rise.",
    d21: "Your immune response is strengthening.",
    d30: "A robust, consistent immune baseline.",
  },
};

export const NOTIFICATION_EXAMPLES: Record<string, string> = {
  energy: "Low energy this morning? Here's why it matters today.",
  sleep: "Tonight's sleep starts with what you do right now.",
  stress: "Busy day ahead? Your nervous system needs this.",
  focus: "Your brain's best hours are ahead. Don't leave them behind.",
  hormones: "Your hormones need consistency. Today matters.",
  metabolism: "Your metabolism is listening. Give it what it needs.",
  sport: "Recovery starts now. Your muscles are waiting.",
  immune: "Your immune system runs on what you give it today.",
};

export const ROUTINE_TIMES = [
  { id: 'morning', label: 'Morning', time: '08:00', icon: 'Sunrise' as const, range: '07:00 – 09:00' },
  { id: 'midmorning', label: 'Mid-morning', time: '10:00', icon: 'Sun' as const, range: '09:00 – 11:00' },
  { id: 'afternoon', label: 'Afternoon', time: '13:00', icon: 'CloudSun' as const, range: '12:00 – 14:00' },
  { id: 'evening', label: 'Evening', time: '21:00', icon: 'Moon' as const, range: '20:00 – 22:00' },
] as const;

export function getDayInsight(day: number): string {
  if (day <= 7) return `Day ${day} — your body is beginning to absorb. It's not magic, it's biology. Keep going.`;
  if (day <= 14) return `Two weeks in. Your supplements are accumulating in your tissue. The effects are building.`;
  if (day <= 21) return `You're in the window. Most people who make it to day 21 feel it within 48 hours.`;
  return `Day ${day}. You're close. Don't stop when it starts working.`;
}

export const FREQUENCY_OPTIONS = [
  { id: 'rarely', label: 'Almost never', sub: '0–1 days per week', value: 1, icon: 'XCircle' as const },
  { id: 'sometimes', label: 'Sometimes', sub: '2–3 days per week', value: 3, icon: 'CircleDot' as const },
  { id: 'most', label: 'Most days', sub: '4–5 days per week', value: 5, icon: 'TrendingUp' as const },
  { id: 'daily', label: 'Every day', sub: '6–7 days per week', value: 7, icon: 'Star' as const },
];

export const FRICTION_OPTIONS = [
  { id: 'busy', label: 'Busy mornings', icon: 'Clock' as const },
  { id: 'forget', label: 'I just forget', icon: 'Brain' as const },
  { id: 'routine', label: 'No clear routine', icon: 'RefreshCw' as const },
  { id: 'motivation', label: 'Lack of motivation', icon: 'BatteryLow' as const },
  { id: 'unsure', label: 'Not sure if they work', icon: 'HelpCircle' as const },
];

export const COMMITMENT_OPTIONS = [
  { id: 'somewhat', label: 'Somewhat', icon: 'CircleDot' as const, value: 1 },
  { id: 'fairly', label: 'Fairly committed', icon: 'ThumbsUp' as const, value: 2 },
  { id: 'very', label: 'Very committed', icon: 'Target' as const, value: 3 },
  { id: 'extremely', label: 'Extremely committed', icon: 'Flame' as const, value: 4 },
];

export const REVIEWS_DATA = [
  { name: 'Maria L.', text: 'I finally feel the energy I paid for. This app made me actually stick with my supplements.', stars: 5 },
  { name: 'Ana S.', text: 'After 3 weeks I noticed my sleep improved so much. The daily reminders kept me going.', stars: 5 },
  { name: 'Carmen R.', text: "I used to forget every other day. Now I'm on a 45-day streak and feeling amazing.", stars: 5 },
];
