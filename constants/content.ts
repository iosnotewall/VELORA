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
    { id: 'wake_energy', label: 'Wake-up energy', question: 'How did you feel within 30 minutes of waking?', type: 'score', lowLabel: 'Could barely get up', highLabel: 'Alert immediately', icon: 'Sunrise', color: '#D4A853' },
    { id: 'afternoon_crash', label: 'Mitochondrial dip', question: 'When did your energy drop today?', type: 'choice', icon: 'BatteryLow', color: '#E57373', options: [
      { value: 'none', label: 'No noticeable drop', emoji: '✨' },
      { value: 'late_morning', label: '10am–12pm', emoji: '🕙' },
      { value: 'early_afternoon', label: '1pm–3pm', emoji: '🕐' },
      { value: 'late_afternoon', label: 'After 4pm', emoji: '🕓' },
    ] },
    { id: 'sustained_output', label: 'Sustained output', question: 'Could you maintain focus and physical energy for 2+ hours straight?', type: 'score', lowLabel: 'Needed frequent breaks', highLabel: 'Sustained easily', icon: 'Activity', color: '#5A8A6F' },
    { id: 'caffeine_dependency', label: 'Caffeine dependency', question: 'How many caffeinated drinks did you need to function?', type: 'choice', icon: 'Coffee', color: '#8B6914', options: [
      { value: '0', label: 'None needed', emoji: '💪' },
      { value: '1', label: '1 (by choice)', emoji: '☕' },
      { value: '2', label: '2 (needed them)', emoji: '😬' },
      { value: '3+', label: '3+ (survival mode)', emoji: '🆘' },
    ] },
  ],
  sleep: [
    { id: 'sleep_onset', label: 'Sleep onset', question: 'How long did it take you to fall asleep?', type: 'choice', icon: 'Clock', color: '#7B8FC4', options: [
      { value: '<10', label: 'Under 10 min', emoji: '😴' },
      { value: '10-20', label: '10–20 min', emoji: '🙂' },
      { value: '20-45', label: '20–45 min', emoji: '😕' },
      { value: '45+', label: 'Over 45 min', emoji: '😩' },
    ] },
    { id: 'sleep_continuity', label: 'Sleep continuity', question: 'How many times did you wake during the night?', type: 'choice', icon: 'Eye', color: '#C4857A', options: [
      { value: '0', label: 'Slept through completely', emoji: '😴' },
      { value: '1', label: 'Once (fell back quickly)', emoji: '👁️' },
      { value: '2-3', label: '2–3 times', emoji: '😣' },
      { value: '4+', label: '4+ times or long waking', emoji: '😵' },
    ] },
    { id: 'sleep_depth', label: 'Perceived depth', question: 'Rate how deep and restorative your sleep felt', type: 'score', lowLabel: 'Light & restless', highLabel: 'Deep & restorative', icon: 'Moon', color: '#7B8FC4' },
    { id: 'morning_readiness', label: 'Morning readiness', question: 'Could you function immediately upon waking — no brain fog?', type: 'score', lowLabel: 'Groggy for hours', highLabel: 'Clear from the start', icon: 'Sunrise', color: '#FFB74D' },
  ],
  focus: [
    { id: 'deep_work', label: 'Deep work capacity', question: 'What was your longest uninterrupted focus block today?', type: 'choice', icon: 'Target', color: '#4A90D9', options: [
      { value: '<15', label: 'Under 15 min', emoji: '😵‍💫' },
      { value: '15-30', label: '15–30 min', emoji: '😐' },
      { value: '30-60', label: '30–60 min', emoji: '🙂' },
      { value: '60-90', label: '60–90 min', emoji: '🎯' },
      { value: '90+', label: '90+ min (flow state)', emoji: '🔥' },
    ] },
    { id: 'task_switching', label: 'Task switching cost', question: 'How hard was it to switch between tasks without losing your train of thought?', type: 'score', lowLabel: 'Lost track constantly', highLabel: 'Seamless transitions', icon: 'Brain', color: '#8B6BB8' },
    { id: 'word_retrieval', label: 'Word retrieval', question: 'Did you struggle to find the right words or recall names today?', type: 'choice', icon: 'Lightbulb', color: '#FFB74D', options: [
      { value: 'none', label: 'No — sharp recall', emoji: '✨' },
      { value: 'once', label: 'Once or twice', emoji: '🤔' },
      { value: 'several', label: 'Several moments', emoji: '😶‍🌫️' },
      { value: 'frequent', label: 'Frequently', emoji: '🌫️' },
    ] },
    { id: 'afternoon_cognition', label: 'PM clarity', question: 'Was your thinking as sharp at 4pm as it was at 10am?', type: 'score', lowLabel: 'Significantly worse', highLabel: 'Just as sharp', icon: 'Cloud', color: '#8A8A8A' },
  ],
  stress: [
    { id: 'baseline_tension', label: 'Baseline tension', question: 'Rate your resting tension level — jaw, shoulders, chest', type: 'score', lowLabel: 'Tight & clenched', highLabel: 'Fully relaxed', icon: 'Leaf', color: '#7B8FC4' },
    { id: 'stress_triggers', label: 'Trigger response', question: 'When something stressful happened, how quickly did you recover?', type: 'choice', icon: 'Wind', color: '#8B6BB8', options: [
      { value: 'fast', label: 'Recovered in minutes', emoji: '😌' },
      { value: 'moderate', label: 'Took 30+ min', emoji: '😟' },
      { value: 'slow', label: 'Lingered for hours', emoji: '😰' },
      { value: 'none', label: 'No stressful events', emoji: '✨' },
    ] },
    { id: 'sleep_anxiety', label: 'Pre-sleep mind', question: 'Could you quiet your mind before bed, or did thoughts race?', type: 'choice', icon: 'Moon', color: '#5A8A6F', options: [
      { value: 'quiet', label: 'Mind was calm', emoji: '😌' },
      { value: 'some', label: 'Some thoughts, manageable', emoji: '😐' },
      { value: 'racing', label: 'Racing thoughts', emoji: '🌀' },
      { value: 'couldnt', label: 'Couldn\'t stop thinking', emoji: '😣' },
    ] },
    { id: 'emotional_regulation', label: 'Emotional regulation', question: 'Did you overreact to something that normally wouldn\'t bother you?', type: 'score', lowLabel: 'Multiple overreactions', highLabel: 'Emotionally stable', icon: 'Shield', color: '#5A8A6F' },
  ],
  metabolism: [
    { id: 'post_meal_energy', label: 'Post-meal glucose', question: 'After your largest meal, did you crash or stay stable?', type: 'choice', icon: 'Utensils', color: '#FFB74D', options: [
      { value: 'crashed', label: 'Needed to nap', emoji: '😴' },
      { value: 'sluggish', label: 'Felt sluggish for 30+ min', emoji: '😮‍💨' },
      { value: 'mild', label: 'Mild dip, recovered fast', emoji: '🙂' },
      { value: 'stable', label: 'No dip — stayed sharp', emoji: '⚡' },
    ] },
    { id: 'hunger_signal', label: 'Hunger signals', question: 'Were your hunger signals predictable and gradual today?', type: 'choice', icon: 'Activity', color: '#E57373', options: [
      { value: 'erratic', label: 'Sudden, intense cravings', emoji: '🔥' },
      { value: 'somewhat', label: 'Somewhat unpredictable', emoji: '〰️' },
      { value: 'gradual', label: 'Gradual, easy to manage', emoji: '📊' },
      { value: 'barely', label: 'Barely thought about food', emoji: '✨' },
    ] },
    { id: 'sugar_craving', label: 'Sugar cravings', question: 'Rate the intensity of sugar or carb cravings today', type: 'score', lowLabel: 'Intense, hard to resist', highLabel: 'No cravings at all', icon: 'Cookie', color: '#D4A853' },
    { id: 'bloating_gi', label: 'GI comfort', question: 'Any bloating, gas, or digestive discomfort after eating?', type: 'score', lowLabel: 'Very uncomfortable', highLabel: 'Completely comfortable', icon: 'Activity', color: '#81C784' },
  ],
  hormones: [
    { id: 'mood_volatility', label: 'Mood volatility', question: 'How many noticeable mood swings did you have today?', type: 'choice', icon: 'Heart', color: '#C4857A', options: [
      { value: 'none', label: 'Steady all day', emoji: '✨' },
      { value: '1-2', label: '1–2 shifts', emoji: '🔄' },
      { value: '3-4', label: '3–4 shifts', emoji: '😣' },
      { value: '5+', label: 'Constantly shifting', emoji: '🎢' },
    ] },
    { id: 'pms_symptoms', label: 'Cycle symptoms', question: 'Rate cramping, breast tenderness, or PMS severity today', type: 'score', lowLabel: 'Severe symptoms', highLabel: 'No symptoms', icon: 'Thermometer', color: '#E57373' },
    { id: 'water_retention', label: 'Water retention', question: 'Any puffiness, bloating, or visible water retention?', type: 'choice', icon: 'Circle', color: '#D4A853', options: [
      { value: 'none', label: 'None at all', emoji: '✨' },
      { value: 'mild', label: 'Slightly puffy', emoji: '😐' },
      { value: 'noticeable', label: 'Noticeably swollen', emoji: '😮‍💨' },
      { value: 'significant', label: 'Significant retention', emoji: '😣' },
    ] },
    { id: 'skin_breakout', label: 'Skin & breakouts', question: 'Rate your skin clarity — new breakouts, oiliness, dryness', type: 'score', lowLabel: 'Active breakout', highLabel: 'Clear & balanced', icon: 'Sparkles', color: '#FFB74D' },
  ],
  sport: [
    { id: 'recovery_readiness', label: 'Recovery readiness', question: 'Could you train at full intensity right now?', type: 'score', lowLabel: 'Body says no', highLabel: 'Completely ready', icon: 'RotateCcw', color: '#5A8A6F' },
    { id: 'training_load', label: 'Training load', question: 'What did you train today?', type: 'choice', icon: 'Dumbbell', color: '#4A90D9', options: [
      { value: 'rest', label: 'Full rest day', emoji: '🛋️' },
      { value: 'light', label: 'Active recovery / mobility', emoji: '🧘' },
      { value: 'moderate', label: 'Moderate session', emoji: '🏃' },
      { value: 'intense', label: 'High intensity / heavy lifts', emoji: '🔥' },
    ] },
    { id: 'doms', label: 'DOMS severity', question: 'Rate your delayed onset muscle soreness from recent sessions', type: 'score', lowLabel: 'Can barely move', highLabel: 'No soreness', icon: 'Activity', color: '#FFB74D' },
    { id: 'perceived_exertion', label: 'RPE output', question: 'Did today\'s training feel harder or easier than it should?', type: 'choice', icon: 'TrendingUp', color: '#D4A853', options: [
      { value: 'harder', label: 'Felt much harder than expected', emoji: '😩' },
      { value: 'slightly_harder', label: 'Slightly harder', emoji: '😤' },
      { value: 'normal', label: 'Felt about right', emoji: '💪' },
      { value: 'easier', label: 'Felt easier than expected', emoji: '🚀' },
    ] },
  ],
  immune: [
    { id: 'symptom_check', label: 'Symptom check', question: 'Any signs of illness — sore throat, sniffles, fatigue, headache?', type: 'choice', icon: 'Thermometer', color: '#E57373', options: [
      { value: 'none', label: 'Completely clear', emoji: '✨' },
      { value: 'vague', label: 'Something feels off', emoji: '🤔' },
      { value: 'mild', label: 'Mild symptoms present', emoji: '🤧' },
      { value: 'sick', label: 'Actively fighting something', emoji: '🤒' },
    ] },
    { id: 'recovery_speed', label: 'Recovery speed', question: 'If you felt run down recently, are you bouncing back?', type: 'choice', icon: 'RotateCcw', color: '#4A90D9', options: [
      { value: 'fine', label: 'Haven\'t been run down', emoji: '💪' },
      { value: 'fast', label: 'Recovering fast', emoji: '📈' },
      { value: 'slow', label: 'Slow to recover', emoji: '🐢' },
      { value: 'worse', label: 'Getting worse', emoji: '📉' },
    ] },
    { id: 'joint_inflammation', label: 'Joint & inflammation', question: 'Rate any joint stiffness, swelling, or inflammatory pain', type: 'score', lowLabel: 'Significant pain', highLabel: 'No inflammation', icon: 'Flame', color: '#C4857A' },
    { id: 'vitality_rating', label: 'Overall vitality', question: 'Rate your body\'s overall resilience and strength today', type: 'score', lowLabel: 'Fragile & vulnerable', highLabel: 'Robust & strong', icon: 'Shield', color: '#81C784' },
  ],
};

export const DEFAULT_METRICS: GoalMetric[] = [
  { id: 'wake_energy', label: 'Wake-up energy', question: 'How alert were you within 30 minutes of waking?', type: 'score', lowLabel: 'Could barely function', highLabel: 'Immediately alert', icon: 'Sunrise', color: '#FFB74D' },
  { id: 'sleep_quality', label: 'Sleep quality', question: 'Rate how deep and restorative last night\'s sleep was', type: 'score', lowLabel: 'Light & broken', highLabel: 'Deep & restorative', icon: 'Moon', color: '#7B8FC4' },
  { id: 'afternoon_clarity', label: 'PM clarity', question: 'Was your thinking as sharp at 4pm as it was at 10am?', type: 'score', lowLabel: 'Significantly worse', highLabel: 'Just as sharp', icon: 'Brain', color: '#81C784' },
  { id: 'body_signals', label: 'Body signals', question: 'Any unusual tension, soreness, or discomfort today?', type: 'choice', icon: 'Activity', color: '#C4857A', options: [
    { value: 'none', label: 'Body felt great', emoji: '✨' },
    { value: 'mild', label: 'Minor tension', emoji: '😐' },
    { value: 'moderate', label: 'Noticeable discomfort', emoji: '😣' },
    { value: 'significant', label: 'Significant issues', emoji: '😖' },
  ] },
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
