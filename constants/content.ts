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

export const VARIABLE_REWARDS: string[] = [
  "Your future self just said thank you.",
  "That's biology working in your favor.",
  "Consistency compounds. You're proving it.",
  "Most people quit by now. You didn't.",
  "Your cells are celebrating right now.",
  "One more day of building something real.",
  "This is what discipline looks like.",
  "Small act. Massive ripple effect.",
  "You're rewriting your baseline.",
  "Your body remembers every single day you show up.",
  "The compound effect is real. You're living it.",
  "Another deposit in your health bank.",
  "You chose yourself today. That matters.",
  "Quiet consistency beats loud motivation.",
  "This streak isn't just numbers. It's who you're becoming.",
  "Your mitochondria approve this message.",
  "The gap between wanting and doing just got smaller.",
  "You're not just taking supplements. You're building identity.",
  "Day by day, cell by cell. You're transforming.",
  "The hardest part was starting. You've already won that.",
];

export function getVariableReward(day: number): string {
  return VARIABLE_REWARDS[day % VARIABLE_REWARDS.length];
}

export const CURIOSITY_NOTIFICATIONS: Record<string, string[]> = {
  energy: [
    "Low energy today? There's a reason for that. 🌿",
    "Your mitochondria called. They need something.",
    "That afternoon crash? It's preventable.",
    "3pm slump incoming. You know what to do.",
    "Energy isn't random. It's a choice you make at 8am.",
  ],
  sleep: [
    "Tonight's sleep starts with what you do right now.",
    "Your melatonin production needs a head start.",
    "Deep sleep doesn't happen by accident.",
    "Tossing and turning? There's a compound for that.",
    "Your nervous system is asking for help winding down.",
  ],
  stress: [
    "Busy day ahead? Your nervous system needs this.",
    "Cortisol is up. Let's bring it back down.",
    "Feeling reactive? There's a biological reason.",
    "Stress depletes magnesium. Magnesium handles stress.",
    "Your calm isn't gone. It just needs fuel.",
  ],
  focus: [
    "Your brain's best hours are ahead. Don't leave them behind.",
    "Mental fog? Your acetylcholine levels might be low.",
    "Sharp focus requires specific fuel. Daily.",
    "That scattered feeling has a biological fix.",
    "Cognitive clarity isn't luck. It's nutrition.",
  ],
  hormones: [
    "Your hormones need consistency. Today matters.",
    "Hormonal balance isn't automatic. It's built daily.",
    "Your cycle depends on what you do between cycles.",
    "Balance starts with showing up. Even today.",
    "Your endocrine system is listening.",
  ],
  metabolism: [
    "Your metabolism is listening. Give it what it needs.",
    "Blood sugar stability starts before breakfast.",
    "That post-meal crash? It's optional.",
    "Your insulin sensitivity improves with every day.",
    "Metabolic health is built in the boring moments.",
  ],
  sport: [
    "Recovery starts now. Your muscles are waiting.",
    "Performance is built between sessions.",
    "Your VO2 max has opinions about today.",
    "Inflammation slows recovery. You can fix that.",
    "Today's supplement is tomorrow's PR.",
  ],
  immune: [
    "Your immune system runs on what you give it today.",
    "70% of immunity lives in your gut. Feed it.",
    "Vitamin D levels drop fast without daily intake.",
    "Your white blood cells need reinforcements.",
    "Prevention beats cure. Every single time.",
  ],
};

export const SCORE_LABELS: Record<number, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export type MetricType = 'score' | 'choice';

export interface ChoiceOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface GoalMetric {
  id: string;
  label: string;
  question: string;
  type: MetricType;
  lowLabel?: string;
  highLabel?: string;
  options?: ChoiceOption[];
  icon: string;
  color: string;
}

export const GOAL_METRICS: Record<string, GoalMetric[]> = {
  energy: [
    { id: 'energy_level', label: 'Energy level', question: 'How\'s your energy right now?', type: 'score', lowLabel: 'Drained', highLabel: 'Energized', icon: 'Zap', color: '#D4A853' },
    { id: 'afternoon_crash', label: 'Afternoon crash', question: 'Did you experience an energy dip today?', type: 'choice', icon: 'BatteryLow', color: '#E57373', options: [
      { value: 'none', label: 'No crash', emoji: '✨' },
      { value: 'mild', label: 'Mild dip', emoji: '😐' },
      { value: 'noticeable', label: 'Noticeable crash', emoji: '😮‍💨' },
      { value: 'severe', label: 'Severe crash', emoji: '😵' },
    ] },
    { id: 'caffeine', label: 'Caffeine intake', question: 'How much caffeine today?', type: 'choice', icon: 'Coffee', color: '#8B6914', options: [
      { value: '0', label: 'None', emoji: '🚫' },
      { value: '1', label: '1 cup', emoji: '☕' },
      { value: '2', label: '2 cups', emoji: '☕☕' },
      { value: '3+', label: '3+ cups', emoji: '⚡' },
    ] },
    { id: 'stamina', label: 'Physical stamina', question: 'Could you sustain physical activity?', type: 'score', lowLabel: 'Exhausted', highLabel: 'Strong', icon: 'Activity', color: '#5A8A6F' },
  ],
  sleep: [
    { id: 'sleep_hours', label: 'Hours slept', question: 'How many hours did you sleep?', type: 'choice', icon: 'Clock', color: '#7B8FC4', options: [
      { value: '<5', label: 'Under 5h', emoji: '😴' },
      { value: '5-6', label: '5–6 hours', emoji: '😕' },
      { value: '6-7', label: '6–7 hours', emoji: '🙂' },
      { value: '7-8', label: '7–8 hours', emoji: '😊' },
      { value: '8+', label: '8+ hours', emoji: '🌟' },
    ] },
    { id: 'sleep_quality', label: 'Sleep quality', question: 'How would you rate your sleep?', type: 'score', lowLabel: 'Terrible', highLabel: 'Deeply restful', icon: 'Moon', color: '#7B8FC4' },
    { id: 'night_wakings', label: 'Night wakings', question: 'Did you wake up during the night?', type: 'choice', icon: 'Eye', color: '#C4857A', options: [
      { value: 'no', label: 'Slept through', emoji: '😴' },
      { value: 'once', label: 'Once', emoji: '👁️' },
      { value: '2-3', label: '2–3 times', emoji: '😣' },
      { value: 'many', label: 'Many times', emoji: '😵' },
    ] },
    { id: 'morning_freshness', label: 'Morning freshness', question: 'How rested do you feel this morning?', type: 'score', lowLabel: 'Groggy', highLabel: 'Refreshed', icon: 'Sunrise', color: '#FFB74D' },
  ],
  focus: [
    { id: 'mental_clarity', label: 'Mental clarity', question: 'How clear is your thinking today?', type: 'score', lowLabel: 'Foggy', highLabel: 'Crystal clear', icon: 'Brain', color: '#8B6BB8' },
    { id: 'focus_duration', label: 'Focus span', question: 'How long could you focus without distraction?', type: 'choice', icon: 'Target', color: '#4A90D9', options: [
      { value: '<15', label: 'Under 15 min', emoji: '😵‍💫' },
      { value: '15-30', label: '15–30 min', emoji: '😐' },
      { value: '30-60', label: '30–60 min', emoji: '🙂' },
      { value: '60+', label: '1 hour+', emoji: '🎯' },
    ] },
    { id: 'brain_fog', label: 'Brain fog', question: 'Any brain fog today?', type: 'choice', icon: 'Cloud', color: '#8A8A8A', options: [
      { value: 'none', label: 'None', emoji: '✨' },
      { value: 'mild', label: 'Mild', emoji: '🌥️' },
      { value: 'moderate', label: 'Moderate', emoji: '☁️' },
      { value: 'heavy', label: 'Heavy', emoji: '🌫️' },
    ] },
    { id: 'memory', label: 'Memory & recall', question: 'How\'s your recall and memory?', type: 'score', lowLabel: 'Forgetful', highLabel: 'Sharp', icon: 'Lightbulb', color: '#FFB74D' },
  ],
  stress: [
    { id: 'stress_level', label: 'Stress level', question: 'How stressed are you feeling right now?', type: 'score', lowLabel: 'Overwhelmed', highLabel: 'Calm', icon: 'Leaf', color: '#7B8FC4' },
    { id: 'anxiety_moments', label: 'Anxious moments', question: 'Any anxious moments today?', type: 'choice', icon: 'Wind', color: '#8B6BB8', options: [
      { value: 'none', label: 'None at all', emoji: '😌' },
      { value: 'few', label: 'A few moments', emoji: '😟' },
      { value: 'several', label: 'Several', emoji: '😰' },
      { value: 'constant', label: 'Constant', emoji: '😣' },
    ] },
    { id: 'breathing', label: 'Breathing quality', question: 'How does your breathing feel?', type: 'choice', icon: 'Wind', color: '#5A8A6F', options: [
      { value: 'tight', label: 'Shallow & tight', emoji: '😤' },
      { value: 'normal', label: 'Normal', emoji: '😐' },
      { value: 'relaxed', label: 'Deep & relaxed', emoji: '😌' },
    ] },
    { id: 'reactivity', label: 'Emotional reactivity', question: 'How reactive are you emotionally?', type: 'score', lowLabel: 'Very reactive', highLabel: 'Grounded', icon: 'Shield', color: '#5A8A6F' },
  ],
  metabolism: [
    { id: 'cravings', label: 'Cravings intensity', question: 'How intense are your cravings today?', type: 'score', lowLabel: 'Intense', highLabel: 'None', icon: 'Cookie', color: '#D4A853' },
    { id: 'post_meal', label: 'Post-meal feeling', question: 'How did you feel after your last meal?', type: 'choice', icon: 'Utensils', color: '#FFB74D', options: [
      { value: 'crashed', label: 'Crashed', emoji: '😴' },
      { value: 'sluggish', label: 'Sluggish', emoji: '😮‍💨' },
      { value: 'stable', label: 'Stable', emoji: '🙂' },
      { value: 'energized', label: 'Energized', emoji: '⚡' },
    ] },
    { id: 'hunger_stability', label: 'Hunger patterns', question: 'How stable is your hunger today?', type: 'choice', icon: 'Activity', color: '#E57373', options: [
      { value: 'erratic', label: 'All over the place', emoji: '📈📉' },
      { value: 'somewhat', label: 'Somewhat stable', emoji: '〰️' },
      { value: 'stable', label: 'Very stable', emoji: '➡️' },
    ] },
    { id: 'digestion', label: 'Digestion', question: 'How\'s your digestion feeling?', type: 'score', lowLabel: 'Uncomfortable', highLabel: 'Great', icon: 'Activity', color: '#81C784' },
  ],
  hormones: [
    { id: 'mood_stability', label: 'Mood stability', question: 'How stable is your mood today?', type: 'score', lowLabel: 'All over the place', highLabel: 'Very stable', icon: 'Heart', color: '#C4857A' },
    { id: 'cycle_symptoms', label: 'Hormonal symptoms', question: 'Any hormonal symptoms today?', type: 'choice', icon: 'Thermometer', color: '#E57373', options: [
      { value: 'none', label: 'None', emoji: '✨' },
      { value: 'mild', label: 'Mild', emoji: '😐' },
      { value: 'moderate', label: 'Moderate', emoji: '😣' },
      { value: 'severe', label: 'Severe', emoji: '😖' },
    ] },
    { id: 'bloating', label: 'Bloating', question: 'Any bloating or discomfort?', type: 'choice', icon: 'Circle', color: '#D4A853', options: [
      { value: 'none', label: 'None', emoji: '✨' },
      { value: 'mild', label: 'Mild', emoji: '😐' },
      { value: 'noticeable', label: 'Noticeable', emoji: '😮‍💨' },
      { value: 'significant', label: 'Significant', emoji: '😣' },
    ] },
    { id: 'skin_clarity', label: 'Skin clarity', question: 'How\'s your skin looking?', type: 'score', lowLabel: 'Breaking out', highLabel: 'Clear & glowing', icon: 'Sparkles', color: '#FFB74D' },
  ],
  sport: [
    { id: 'recovery', label: 'Recovery', question: 'How recovered do you feel?', type: 'score', lowLabel: 'Very sore', highLabel: 'Fully recovered', icon: 'RotateCcw', color: '#5A8A6F' },
    { id: 'training_today', label: 'Training intensity', question: 'What was your training today?', type: 'choice', icon: 'Dumbbell', color: '#4A90D9', options: [
      { value: 'rest', label: 'Rest day', emoji: '🛋️' },
      { value: 'light', label: 'Light session', emoji: '🚶' },
      { value: 'moderate', label: 'Moderate', emoji: '🏃' },
      { value: 'intense', label: 'Intense', emoji: '🔥' },
    ] },
    { id: 'soreness', label: 'Muscle soreness', question: 'How sore are your muscles?', type: 'score', lowLabel: 'Very sore', highLabel: 'No soreness', icon: 'Activity', color: '#FFB74D' },
    { id: 'performance', label: 'Performance', question: 'Rate your performance output', type: 'score', lowLabel: 'Struggled', highLabel: 'Peak', icon: 'TrendingUp', color: '#D4A853' },
  ],
  immune: [
    { id: 'overall_health', label: 'Overall health', question: 'How healthy do you feel overall?', type: 'score', lowLabel: 'Under the weather', highLabel: 'Strong', icon: 'Shield', color: '#4A90D9' },
    { id: 'symptoms', label: 'Symptoms', question: 'Any cold or flu symptoms?', type: 'choice', icon: 'Thermometer', color: '#E57373', options: [
      { value: 'none', label: 'None', emoji: '✨' },
      { value: 'slight', label: 'Slight', emoji: '🤧' },
      { value: 'moderate', label: 'Moderate', emoji: '🤒' },
      { value: 'unwell', label: 'Feeling unwell', emoji: '😷' },
    ] },
    { id: 'inflammation', label: 'Inflammation', question: 'Any inflammation or pain?', type: 'choice', icon: 'Flame', color: '#C4857A', options: [
      { value: 'none', label: 'None', emoji: '✨' },
      { value: 'mild', label: 'Mild', emoji: '😐' },
      { value: 'moderate', label: 'Moderate', emoji: '😣' },
      { value: 'significant', label: 'Significant', emoji: '😖' },
    ] },
    { id: 'resilience', label: 'Resilience', question: 'How resilient do you feel?', type: 'score', lowLabel: 'Fragile', highLabel: 'Robust', icon: 'Heart', color: '#81C784' },
  ],
};

export const DEFAULT_METRICS: GoalMetric[] = [
  { id: 'energy', label: 'Energy', question: 'How is your energy today?', type: 'score', lowLabel: 'Low', highLabel: 'High', icon: 'Zap', color: '#FFB74D' },
  { id: 'sleep', label: 'Sleep', question: 'How did you sleep?', type: 'score', lowLabel: 'Poorly', highLabel: 'Great', icon: 'Moon', color: '#7B8FC4' },
  { id: 'mood', label: 'Mood', question: 'How\'s your mood?', type: 'score', lowLabel: 'Low', highLabel: 'Great', icon: 'Smile', color: '#81C784' },
];

export const NOTIFICATION_MODE_OPTIONS = [
  { id: 'specific' as const, label: 'Set times', sub: 'Choose exact times for reminders', icon: 'Clock' as const },
  { id: 'random' as const, label: 'Random daily', sub: 'One surprise reminder per day', icon: 'Shuffle' as const },
  { id: 'hourly' as const, label: 'Random hourly', sub: 'Gentle nudges throughout the day', icon: 'Timer' as const },
];

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
