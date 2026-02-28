export const GOALS = [
  { id: 'energy', label: 'Energy & Performance', sub: 'Beat fatigue, boost vitality', icon: 'Zap' as const, feeling: 'energized' },
  { id: 'stress', label: 'Stress, Anxiety & Sleep', sub: 'Calm your mind, rest deeply', icon: 'Moon' as const, feeling: 'calm and rested' },
  { id: 'pain', label: 'Pain & Inflammation', sub: 'Joints, chronic pain relief', icon: 'Shield' as const, feeling: 'pain-free and mobile' },
  { id: 'menopause', label: 'Menopause & Perimenopause', sub: 'Navigate the transition with ease', icon: 'Sun' as const, feeling: 'balanced and comfortable' },
  { id: 'metabolism', label: 'Fat Loss & Metabolism', sub: 'Weight, glucose & appetite control', icon: 'Flame' as const, feeling: 'metabolically balanced' },
  { id: 'digestion', label: 'Digestion & Gut Health', sub: 'Bloating, regularity, comfort', icon: 'Leaf' as const, feeling: 'digestively comfortable' },
  { id: 'focus', label: 'Memory & Concentration', sub: 'Think sharper, remember more', icon: 'Brain' as const, feeling: 'focused and sharp' },
  { id: 'cycle', label: 'Menstrual Cycle', sub: 'PMS, cramps, hormonal balance', icon: 'Heart' as const, feeling: 'hormonally balanced' },
  { id: 'fertility', label: 'Fertility & Pregnancy', sub: 'Conception, prenatal, postpartum', icon: 'Star' as const, feeling: 'your fertility journey' },
  { id: 'antiaging', label: 'Anti-Aging', sub: 'Cellular health, skin, longevity', icon: 'Sparkles' as const, feeling: 'youthful and radiant' },
] as const;

export type GoalId = typeof GOALS[number]['id'];

export const SCIENCE_CONTENT: Record<string, { text: string; ingredients: string[] }> = {
  energy: {
    text: "Your cells produce energy through mitochondria — tiny powerhouses that rely on magnesium, B-vitamins, and iron to function. Women are especially prone to iron deficiency, which directly impacts oxygen delivery to every cell. Bioavailable supplement forms ensure your body can actually absorb and use what it needs.",
    ingredients: ['Energy & Anti-Fatigue Formula', 'High-Absorption Magnesium', 'Iron Replenishment Complex', 'Thyroid & Energy Support'],
  },
  stress: {
    text: "Cortisol — your stress hormone — depletes magnesium with every spike. The more stressed you are, the more you need it. Adaptogenic herbs help regulate the HPA axis, while magnesium supports GABA production — the neurotransmitter that literally quiets your neurons for better sleep and calm.",
    ingredients: ['Adaptogen Stress Support', 'High-Absorption Magnesium', 'Sleep & Recovery Night Formula'],
  },
  pain: {
    text: "Chronic pain and inflammation involve complex pathways including COX enzymes and cytokines. PEA (palmitoylethanolamide) is a naturally occurring fatty acid amide your body produces — supplementing it supports your endocannabinoid system for natural pain modulation. Joint compounds like collagen and glucosamine rebuild cartilage tissue over time.",
    ingredients: ['PEA Pain & Inflammation Relief', 'Joint Health & Mobility Complex', 'Omega-3 High in EPA'],
  },
  menopause: {
    text: "During perimenopause and menopause, declining estrogen affects everything from bone density to thermoregulation. Specific phytoestrogens and adaptogens can ease hot flashes, mood swings, and sleep disruption. Vitamin D3+K2 becomes critical for bone health as estrogen's protective effect diminishes.",
    ingredients: ['Menopause Comfort Formula', 'High-Absorption Magnesium', 'Vitamin D3 + K2', 'Cellular Antioxidant Complex'],
  },
  metabolism: {
    text: "Blood glucose regulation is the foundation of metabolic health in women. Consistent supplementation with specific plant compounds improves insulin sensitivity and reduces post-meal glucose spikes — the root of weight gain. Appetite-regulating supplements work on satiety hormones like GLP-1 and leptin.",
    ingredients: ['Metabolic Health & Glucose Balance', 'Appetite Control & Satiety', 'Soluble Fiber Supplement'],
  },
  digestion: {
    text: "Your gut microbiome contains trillions of bacteria that influence everything from nutrient absorption to immune function and mood. Soluble fiber acts as a prebiotic, feeding beneficial bacteria and promoting regular transit. Women's hormonal fluctuations directly impact gut motility, making consistent fiber intake especially important.",
    ingredients: ['Soluble Fiber Supplement', 'High-Absorption Magnesium'],
  },
  focus: {
    text: "Cognitive performance relies on acetylcholine synthesis and cerebral blood flow. Specific nootropic compounds — when taken consistently — cross the blood-brain barrier and measurably improve reaction time and working memory. Omega-3 DHA is a structural component of brain cell membranes.",
    ingredients: ['Memory & Concentration Nootropic', 'Omega-3 High in DHA', 'Methylcobalamin B12 Liquid'],
  },
  cycle: {
    text: "Hormonal synthesis requires specific micronutrients as cofactors. Without them, your body can't produce estrogen and progesterone at optimal ratios. Clinical-grade compounds support steroidogenic enzyme function and restore balance throughout your cycle, reducing PMS severity and regulating flow.",
    ingredients: ['Female Hormonal Balance', 'High-Absorption Magnesium', 'Iron Replenishment Complex', 'Vitamin D3 + K2'],
  },
  fertility: {
    text: "Egg quality, implantation, and early fetal development all depend on optimal micronutrient status. Folate, iron, DHA, and specific antioxidants are critical from pre-conception through pregnancy and into breastfeeding. Each stage has different nutritional demands that targeted supplementation addresses.",
    ingredients: ['Female Fertility Optimizer', 'Pre-Conception Women\'s Multivitamin', 'Prenatal Pregnancy Multivitamin', 'Omega-3 High in DHA'],
  },
  antiaging: {
    text: "Aging at the cellular level is driven by oxidative stress, telomere shortening, and mitochondrial decline. Broad-spectrum antioxidants neutralize free radicals that damage DNA and collagen. Omega-3 fatty acids reduce chronic low-grade inflammation — the silent driver of premature aging in skin, joints, and organs.",
    ingredients: ['Cellular Antioxidant Complex', 'Vegan Omega-3 (Algae)', 'Vitamin C 500mg'],
  },
};

export const GAP_INSIGHTS: Record<string, string> = {
  low: "Most people feel this way before building a consistent routine. The science shows it takes 21 days of consistency to feel real change.",
  mid: "You're already on the right track. Consistency will take you from 'sometimes' to 'always' within 30 days.",
  high: "Impressive. Let's make sure you never lose this momentum — even on your hardest days.",
};

export const MILESTONES: Record<string, { d7: string; d21: string; d30: string }> = {
  energy: {
    d7: "Your cells are beginning to absorb the magnesium and iron.",
    d21: "Morning energy arrives faster. Afternoon crashes soften.",
    d30: "Sustained energy is your new normal.",
  },
  stress: {
    d7: "Cortisol response begins to regulate. Sleep onset may improve.",
    d21: "You feel less reactive. Sleep deepens. More grounded.",
    d30: "Stress still exists — but you handle it differently. Sleep is restorative.",
  },
  pain: {
    d7: "PEA is beginning to accumulate in your system.",
    d21: "Inflammation markers shifting. Joint stiffness easing.",
    d30: "Noticeable reduction in chronic pain and improved mobility.",
  },
  menopause: {
    d7: "Your body is starting to respond to the phytoestrogens.",
    d21: "Hot flashes less frequent. Mood more stable.",
    d30: "A new hormonal equilibrium is establishing itself.",
  },
  metabolism: {
    d7: "Insulin sensitivity is beginning to improve.",
    d21: "Post-meal energy crashes are softening. Cravings ease.",
    d30: "Your metabolic baseline has shifted. Appetite more predictable.",
  },
  digestion: {
    d7: "Gut bacteria are responding to the increased fiber.",
    d21: "Bloating reduces. Transit becomes more regular.",
    d30: "Digestive comfort is your new baseline.",
  },
  focus: {
    d7: "Subtle clarity in the morning.",
    d21: "Longer periods of deep focus without effort.",
    d30: "Your cognitive baseline has shifted upward.",
  },
  cycle: {
    d7: "Inflammation markers beginning to shift.",
    d21: "Cycle symptoms less intense. Mood more stable.",
    d30: "A new hormonal rhythm is establishing itself.",
  },
  fertility: {
    d7: "Key micronutrients are building up in your tissues.",
    d21: "Egg quality markers improving. Hormones stabilizing.",
    d30: "Your body is better prepared for conception and beyond.",
  },
  antiaging: {
    d7: "Antioxidants are beginning to neutralize oxidative stress.",
    d21: "Skin hydration improving. Inflammation markers dropping.",
    d30: "Cellular renewal is accelerating. You look and feel younger.",
  },
};

export const NOTIFICATION_EXAMPLES: Record<string, string> = {
  energy: "You have 14 hours of energy ahead. What you do now decides how you feel at 4pm.",
  stress: "Your cortisol is highest right now. One capsule changes how the next 8 hours feel.",
  pain: "Your joints are stiffest in the morning. This is the exact moment supplementation matters most.",
  menopause: "Women who supplement consistently report 47% fewer hot flashes by week 3. Today is day by day.",
  metabolism: "Your insulin sensitivity peaks in the morning. This is the window to support your metabolism.",
  digestion: "Your gut bacteria reset overnight. What you feed them first thing shapes your entire day.",
  focus: "Your brain burns 20% of your energy. Give it the fuel before your sharpest hours begin.",
  cycle: "Your hormones are rebuilding right now. Consistent support reduces PMS severity by up to 40%.",
  fertility: "Egg quality takes 90 days to improve. Every single morning counts toward your baby.",
  antiaging: "Your cells repaired overnight. Antioxidants taken now protect 8 hours of cellular renewal.",
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
    "Low energy today? There's a reason for that.",
    "Your mitochondria called. They need something.",
    "That afternoon crash? It's preventable.",
    "3pm slump incoming. You know what to do.",
    "Energy isn't random. It's a choice you make at 8am.",
  ],
  stress: [
    "Busy day ahead? Your nervous system needs this.",
    "Cortisol is up. Let's bring it back down.",
    "Feeling reactive? There's a biological reason.",
    "Stress depletes magnesium. Magnesium handles stress.",
    "Tonight's sleep starts with what you do right now.",
  ],
  pain: [
    "Stiff this morning? Your joints need daily support.",
    "Inflammation doesn't rest. Neither should your protocol.",
    "That nagging pain? PEA can help your body handle it.",
    "Your joints remember every day you show up for them.",
    "Pain management is a marathon, not a sprint.",
  ],
  menopause: [
    "Hot flashes less intense with consistent supplementation.",
    "Your bones need extra support during this transition.",
    "Mood swings? Your hormones are asking for help.",
    "Perimenopause is a process. Consistency smooths it.",
    "Your body is changing. Give it the tools to adapt.",
  ],
  metabolism: [
    "Your metabolism is listening. Give it what it needs.",
    "Blood sugar stability starts before breakfast.",
    "That post-meal crash? It's optional.",
    "Your insulin sensitivity improves with every day.",
    "Metabolic health is built in the boring moments.",
  ],
  digestion: [
    "Your gut microbiome is hungry. Feed it fiber.",
    "Bloating isn't normal. It's a signal.",
    "70% of your immune system lives in your gut.",
    "Regularity is built daily, not weekly.",
    "Your gut-brain axis is listening.",
  ],
  focus: [
    "Your brain's best hours are ahead. Don't leave them behind.",
    "Mental fog? Your acetylcholine levels might be low.",
    "Sharp focus requires specific fuel. Daily.",
    "That scattered feeling has a biological fix.",
    "Cognitive clarity isn't luck. It's nutrition.",
  ],
  cycle: [
    "Your hormones need consistency. Today matters.",
    "Hormonal balance isn't automatic. It's built daily.",
    "Your cycle depends on what you do between cycles.",
    "Balance starts with showing up. Even today.",
    "Your endocrine system is listening.",
  ],
  fertility: [
    "Egg quality improves with consistent micronutrient support.",
    "Your future baby needs you to show up today.",
    "Fertility is a 90-day game. Every day counts.",
    "Folate, iron, DHA — your body is stocking up.",
    "Preparation is the best gift you can give.",
  ],
  antiaging: [
    "Free radicals are damaging your cells right now.",
    "Your skin's collagen production depends on what you take.",
    "Aging is optional at the cellular level.",
    "Antioxidants work best when taken consistently.",
    "Your cells are renewing. Give them the building blocks.",
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
  stress: [
    { id: 'baseline_tension', label: 'Baseline tension', question: 'Rate your resting tension level — jaw, shoulders, chest', type: 'score', lowLabel: 'Tight & clenched', highLabel: 'Fully relaxed', icon: 'Leaf', color: '#7B8FC4' },
    { id: 'stress_triggers', label: 'Trigger response', question: 'When something stressful happened, how quickly did you recover?', type: 'choice', icon: 'Wind', color: '#8B6BB8', options: [
      { value: 'fast', label: 'Recovered in minutes', emoji: '😌' },
      { value: 'moderate', label: 'Took 30+ min', emoji: '😟' },
      { value: 'slow', label: 'Lingered for hours', emoji: '😰' },
      { value: 'none', label: 'No stressful events', emoji: '✨' },
    ] },
    { id: 'sleep_onset', label: 'Sleep onset', question: 'How long did it take you to fall asleep?', type: 'choice', icon: 'Clock', color: '#7B8FC4', options: [
      { value: '<10', label: 'Under 10 min', emoji: '😴' },
      { value: '10-20', label: '10–20 min', emoji: '🙂' },
      { value: '20-45', label: '20–45 min', emoji: '😕' },
      { value: '45+', label: 'Over 45 min', emoji: '😩' },
    ] },
    { id: 'emotional_regulation', label: 'Emotional regulation', question: 'Did you overreact to something that normally wouldn\'t bother you?', type: 'score', lowLabel: 'Multiple overreactions', highLabel: 'Emotionally stable', icon: 'Shield', color: '#5A8A6F' },
  ],
  pain: [
    { id: 'pain_level', label: 'Pain intensity', question: 'Rate your overall pain level today', type: 'score', lowLabel: 'Severe, debilitating', highLabel: 'No pain at all', icon: 'Activity', color: '#E57373' },
    { id: 'joint_stiffness', label: 'Joint stiffness', question: 'How stiff were your joints upon waking?', type: 'choice', icon: 'Shield', color: '#5A8A6F', options: [
      { value: 'none', label: 'Moved freely', emoji: '✨' },
      { value: 'mild', label: 'Mild stiffness, gone in minutes', emoji: '🙂' },
      { value: 'moderate', label: 'Stiff for 30+ min', emoji: '😕' },
      { value: 'severe', label: 'Stiff most of the day', emoji: '😣' },
    ] },
    { id: 'mobility', label: 'Mobility', question: 'Could you perform daily activities without pain limiting you?', type: 'score', lowLabel: 'Very limited', highLabel: 'Full range of motion', icon: 'Activity', color: '#5A8A6F' },
    { id: 'inflammation_signs', label: 'Inflammation signs', question: 'Any swelling, redness, or warmth in joints today?', type: 'choice', icon: 'Flame', color: '#E87C6F', options: [
      { value: 'none', label: 'No signs', emoji: '✨' },
      { value: 'mild', label: 'Slight swelling', emoji: '😐' },
      { value: 'moderate', label: 'Noticeable inflammation', emoji: '😮‍💨' },
      { value: 'severe', label: 'Significant swelling/heat', emoji: '😣' },
    ] },
  ],
  menopause: [
    { id: 'hot_flashes', label: 'Hot flashes', question: 'How many hot flashes did you experience today?', type: 'choice', icon: 'Flame', color: '#E87C6F', options: [
      { value: 'none', label: 'None', emoji: '✨' },
      { value: '1-2', label: '1–2 mild ones', emoji: '🙂' },
      { value: '3-5', label: '3–5 moderate', emoji: '😮‍💨' },
      { value: '6+', label: '6+ or severe', emoji: '😣' },
    ] },
    { id: 'mood_stability', label: 'Mood stability', question: 'Rate your emotional stability today', type: 'score', lowLabel: 'Very volatile', highLabel: 'Steady and calm', icon: 'Heart', color: '#C4857A' },
    { id: 'sleep_quality_meno', label: 'Night sweats & sleep', question: 'Did night sweats or temperature changes disrupt your sleep?', type: 'choice', icon: 'Moon', color: '#7B8FC4', options: [
      { value: 'none', label: 'Slept through fine', emoji: '😴' },
      { value: 'mild', label: 'Woke once, fell back', emoji: '😐' },
      { value: 'moderate', label: 'Multiple disruptions', emoji: '😕' },
      { value: 'severe', label: 'Barely slept', emoji: '😩' },
    ] },
    { id: 'bone_joint', label: 'Bone & joint comfort', question: 'Any new aches, stiffness, or bone discomfort?', type: 'score', lowLabel: 'Significant discomfort', highLabel: 'Feeling strong', icon: 'Shield', color: '#5A8A6F' },
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
  digestion: [
    { id: 'bloating', label: 'Bloating', question: 'How bloated did you feel today?', type: 'choice', icon: 'Activity', color: '#81C784', options: [
      { value: 'none', label: 'No bloating at all', emoji: '✨' },
      { value: 'mild', label: 'Slight after meals', emoji: '😐' },
      { value: 'moderate', label: 'Noticeable discomfort', emoji: '😮‍💨' },
      { value: 'severe', label: 'Painful bloating', emoji: '😣' },
    ] },
    { id: 'regularity', label: 'Regularity', question: 'How was your bowel regularity today?', type: 'choice', icon: 'Clock', color: '#5A8A6F', options: [
      { value: 'regular', label: 'Regular and comfortable', emoji: '✨' },
      { value: 'slightly_off', label: 'Slightly off', emoji: '😐' },
      { value: 'irregular', label: 'Irregular or strained', emoji: '😕' },
      { value: 'problematic', label: 'Very problematic', emoji: '😣' },
    ] },
    { id: 'gut_comfort', label: 'Gut comfort', question: 'Rate your overall digestive comfort today', type: 'score', lowLabel: 'Very uncomfortable', highLabel: 'Completely comfortable', icon: 'Leaf', color: '#81C784' },
    { id: 'food_tolerance', label: 'Food tolerance', question: 'Did any foods cause discomfort that normally wouldn\'t?', type: 'choice', icon: 'Utensils', color: '#FFB74D', options: [
      { value: 'none', label: 'Tolerated everything fine', emoji: '✨' },
      { value: 'mild', label: 'One food caused mild issues', emoji: '🤔' },
      { value: 'several', label: 'Multiple sensitivities', emoji: '😕' },
      { value: 'many', label: 'Most foods caused issues', emoji: '😣' },
    ] },
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
  cycle: [
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
  fertility: [
    { id: 'supplement_timing', label: 'Supplement timing', question: 'Did you take your fertility supplements at the recommended time?', type: 'choice', icon: 'Clock', color: '#D4768A', options: [
      { value: 'perfect', label: 'Perfect timing', emoji: '✨' },
      { value: 'close', label: 'Within 1 hour', emoji: '🙂' },
      { value: 'off', label: 'Significantly off schedule', emoji: '😕' },
      { value: 'missed', label: 'Missed entirely', emoji: '😣' },
    ] },
    { id: 'energy_fertility', label: 'Overall energy', question: 'Rate your energy and vitality today', type: 'score', lowLabel: 'Exhausted', highLabel: 'Full of energy', icon: 'Zap', color: '#D4A853' },
    { id: 'stress_level', label: 'Stress level', question: 'Rate your stress and anxiety level today', type: 'score', lowLabel: 'Very stressed', highLabel: 'Calm and relaxed', icon: 'Leaf', color: '#7B8FC4' },
    { id: 'body_signals', label: 'Body signals', question: 'Any unusual symptoms — nausea, tenderness, cramping?', type: 'choice', icon: 'Activity', color: '#C4857A', options: [
      { value: 'none', label: 'Feeling normal', emoji: '✨' },
      { value: 'mild', label: 'Mild symptoms', emoji: '😐' },
      { value: 'moderate', label: 'Noticeable symptoms', emoji: '😮‍💨' },
      { value: 'significant', label: 'Significant symptoms', emoji: '😣' },
    ] },
  ],
  antiaging: [
    { id: 'skin_quality', label: 'Skin quality', question: 'Rate your skin\'s glow, hydration, and firmness today', type: 'score', lowLabel: 'Dull and dry', highLabel: 'Glowing and firm', icon: 'Sparkles', color: '#C9956B' },
    { id: 'energy_vitality', label: 'Vitality', question: 'Rate your overall sense of vitality and youthfulness', type: 'score', lowLabel: 'Feeling old and tired', highLabel: 'Vibrant and youthful', icon: 'Zap', color: '#D4A853' },
    { id: 'recovery_speed', label: 'Recovery speed', question: 'How quickly do you bounce back from physical exertion?', type: 'choice', icon: 'RotateCcw', color: '#5A8A6F', options: [
      { value: 'fast', label: 'Recover quickly', emoji: '✨' },
      { value: 'normal', label: 'Normal recovery', emoji: '🙂' },
      { value: 'slow', label: 'Slow to recover', emoji: '😕' },
      { value: 'very_slow', label: 'Very slow, lingering fatigue', emoji: '😣' },
    ] },
    { id: 'joint_flexibility', label: 'Joint flexibility', question: 'Rate your joint comfort and flexibility today', type: 'score', lowLabel: 'Stiff and creaky', highLabel: 'Flexible and comfortable', icon: 'Activity', color: '#81C784' },
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
