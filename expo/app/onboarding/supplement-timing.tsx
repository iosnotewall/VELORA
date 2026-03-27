import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Sparkles, ChevronRight, Check, Wand2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppState } from '@/hooks/useAppState';
import type { SupplementTime } from '@/hooks/useAppState';
import { PRODUCTS } from '@/constants/products';
import { GOALS } from '@/constants/content';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const useNative = Platform.OS !== 'web';

const BG_COLOR = '#FDFBF7';
const TEXT_PRIMARY = '#1A1F3C';
const TEXT_SECONDARY = '#6B6B7B';
const TEXT_TERTIARY = '#9A9AAA';
const CARD_BG = '#FFFFFF';
const CARD_BORDER = '#EEEAE4';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const SUPPLEMENT_TIMING_GUIDE: Record<string, { bestTime: string; reason: string }> = {
  magnesium: { bestTime: '21:00', reason: 'Best absorbed in the evening, supports sleep quality' },
  iron_complex: { bestTime: '07:00', reason: 'Take on an empty stomach in the morning for best absorption' },
  vitamin_d3k2: { bestTime: '08:00', reason: 'Take with breakfast — fat-soluble, needs food' },
  vitamin_d3k2_spray: { bestTime: '08:00', reason: 'Morning with breakfast for optimal absorption' },
  omega3_epa: { bestTime: '12:00', reason: 'Take with lunch — needs dietary fat to absorb' },
  omega3_dha: { bestTime: '12:00', reason: 'Take with your largest meal for best absorption' },
  vegan_omega3: { bestTime: '12:00', reason: 'Best with lunch, needs fat for absorption' },
  adaptogen_stress: { bestTime: '08:00', reason: 'Morning intake sets your cortisol rhythm for the day' },
  sleep_recovery: { bestTime: '21:30', reason: '30 minutes before bed for optimal sleep support' },
  energy_formula: { bestTime: '07:30', reason: 'First thing in the morning to kickstart your energy' },
  thyroid_energy: { bestTime: '07:00', reason: 'Empty stomach, 30 min before breakfast' },
  memory_nootropic: { bestTime: '09:00', reason: 'Morning for peak cognitive performance all day' },
  methyl_b12: { bestTime: '08:00', reason: 'Morning — B12 can disrupt sleep if taken late' },
  vitamin_c: { bestTime: '08:00', reason: 'Morning with food to boost absorption' },
  pea_relief: { bestTime: '08:00', reason: 'Twice daily — morning and evening with meals' },
  hormonal_balance: { bestTime: '08:00', reason: 'Consistent morning timing helps hormone regulation' },
  menopause_comfort: { bestTime: '08:00', reason: 'Morning with breakfast for steady levels' },
  metabolic_support: { bestTime: '12:00', reason: 'Before your largest meal for glucose support' },
  appetite_control: { bestTime: '11:30', reason: '30 minutes before lunch to support satiety' },
  soluble_fiber: { bestTime: '07:30', reason: 'Before breakfast on a semi-empty stomach' },
  cellular_antioxidant: { bestTime: '08:00', reason: 'Morning with food for optimal protection' },
  fertility_optimizer: { bestTime: '08:00', reason: 'Morning with breakfast, consistency is key' },
  prenatal_multi: { bestTime: '08:00', reason: 'With breakfast to minimize nausea' },
  preconception_multi: { bestTime: '08:00', reason: 'Morning with food for best absorption' },
  joint_health: { bestTime: '08:00', reason: 'Morning with food — collagen needs vitamin C' },
  creatine: { bestTime: '08:00', reason: 'Any consistent time — morning works great' },
  creatine_magnesium: { bestTime: '20:00', reason: 'Evening for recovery and muscle support' },
  dairy_protein: { bestTime: '10:00', reason: 'Mid-morning or post-workout' },
  vegan_protein: { bestTime: '10:00', reason: 'Mid-morning or post-workout' },
  lactation_support: { bestTime: '08:00', reason: 'Morning with breakfast' },
};

const DEFAULT_TIMING = { bestTime: '08:00', reason: 'Morning with breakfast for consistent routine' };

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

function parseTimeToHourMin(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map(Number);
  return { hour: h, minute: m };
}

function WheelPicker({
  items,
  selectedIndex,
  onSelect,
  formatItem,
  goalColor,
}: {
  items: number[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  formatItem: (item: number) => string;
  goalColor: string;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (!isScrolling && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [selectedIndex, isScrolling]);

  const handleScrollEnd = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    if (clampedIndex !== selectedIndex) {
      Haptics.selectionAsync();
      onSelect(clampedIndex);
    }
    setIsScrolling(false);
  }, [items.length, selectedIndex, onSelect]);

  return (
    <View style={wheelStyles.container}>
      <View style={[wheelStyles.highlight, { borderColor: goalColor + '30' }]} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={() => setIsScrolling(true)}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
        style={{ height: PICKER_HEIGHT }}
      >
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(index);
                scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
              }}
              style={wheelStyles.item}
              activeOpacity={0.7}
            >
              <Text style={[
                wheelStyles.itemText,
                isSelected && { color: TEXT_PRIMARY, fontSize: 22 },
                !isSelected && { color: TEXT_TERTIARY },
              ]}>
                {formatItem(item)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

interface AssistantMessage {
  id: string;
  text: string;
  isTyping?: boolean;
}

function TypingDots({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: useNative }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: useNative }),
          Animated.delay(600 - delay),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={typingStyles.container}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            typingStyles.dot,
            { backgroundColor: color },
            { opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] }) },
            {
              transform: [{
                translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }),
              }],
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function SupplementTimingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, products, customProducts, userName, updateState } = useAppState();
  const goalColor = Colors.category[goal] || Colors.blue;
  const goalData = GOALS.find(g => g.id === goal);
  const displayName = userName ? userName.split(' ')[0] : '';

  const allProducts = useMemo(() => {
    const matched = products
      .map(id => PRODUCTS.find(p => p.id === id))
      .filter((p): p is typeof PRODUCTS[number] => !!p);
    const custom = customProducts.map(cp => ({
      id: cp.id,
      name: cp.name,
      tagline: cp.tagline,
      color: cp.color,
      goals: [goal],
    }));
    return [...matched, ...custom];
  }, [products, customProducts, goal]);

  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
  const [suggestedTimes, setSuggestedTimes] = useState<SupplementTime[]>([]);
  const [acceptedSuggestion, setAcceptedSuggestion] = useState(false);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const pickerAnim = useRef(new Animated.Value(0)).current;
  const helpAnim = useRef(new Animated.Value(0)).current;
  const assistantAnim = useRef(new Animated.Value(0)).current;
  const messageAnims = useRef<Animated.Value[]>([]).current;
  const suggestionsAnim = useRef(new Animated.Value(0)).current;
  const acceptAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(titleAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(pickerAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(300),
      Animated.timing(helpAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();
  }, []);

  const handleDontKnow = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAssistant(true);

    Animated.timing(assistantAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }).start();

    const suggestions: SupplementTime[] = allProducts.map(p => {
      const guide = SUPPLEMENT_TIMING_GUIDE[p.id] || DEFAULT_TIMING;
      return {
        productId: p.id,
        productName: p.name,
        time: guide.bestTime,
      };
    });

    if (suggestions.length === 0) {
      suggestions.push({
        productId: 'default',
        productName: 'Your supplements',
        time: '08:00',
      });
    }

    setSuggestedTimes(suggestions);

    const greeting = displayName
      ? `Hey ${displayName}! I'm here to help.`
      : "Hey! I'm here to help.";

    const productNames = allProducts.length > 0
      ? allProducts.map(p => p.name).join(', ')
      : 'your supplements';

    const msgs: { text: string; delay: number }[] = [
      { text: greeting, delay: 500 },
      { text: `Based on ${goalData?.label || 'your goal'} and what you're taking...`, delay: 2000 },
      { text: `I've analyzed ${productNames} for optimal absorption timing.`, delay: 3800 },
    ];

    const uniqueTimes = [...new Set(suggestions.map(s => {
      const { hour, minute } = parseTimeToHourMin(s.time);
      return formatTime(hour, minute);
    }))];

    if (uniqueTimes.length <= 3) {
      msgs.push({
        text: `Here's your personalized schedule — ${uniqueTimes.join(', ')}.`,
        delay: 5500,
      });
    } else {
      msgs.push({
        text: "Here's your personalized supplement schedule:",
        delay: 5500,
      });
    }

    msgs.forEach((msg, i) => {
      const anim = new Animated.Value(0);
      messageAnims.push(anim);

      setTimeout(() => {
        setAssistantMessages(prev => [
          ...prev.filter(m => !m.isTyping),
          { id: `msg-${i}`, text: msg.text },
        ]);

        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: useNative,
          damping: 15,
          stiffness: 200,
        }).start();

        if (i < msgs.length - 1) {
          setTimeout(() => {
            setAssistantMessages(prev => [...prev, { id: `typing-${i}`, text: '', isTyping: true }]);
          }, 300);
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, msg.delay);
    });

    setTimeout(() => {
      Animated.spring(suggestionsAnim, {
        toValue: 1,
        useNativeDriver: useNative,
        damping: 14,
        stiffness: 180,
      }).start();
    }, msgs[msgs.length - 1].delay + 600);
  }, [allProducts, displayName, goalData]);

  const handleAcceptSuggestions = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAcceptedSuggestion(true);

    updateState({ supplementTimes: suggestedTimes });

    Animated.spring(acceptAnim, {
      toValue: 1,
      useNativeDriver: useNative,
      damping: 12,
      stiffness: 150,
    }).start();

    setTimeout(() => {
      router.push('/onboarding/sim-notification' as any);
    }, 1200);
  }, [suggestedTimes, updateState, router]);

  const handleSetManualTime = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const timeStr = `${selectedHour.toString().padStart(2, '0')}:${MINUTES[selectedMinute].toString().padStart(2, '0')}`;
    const times: SupplementTime[] = allProducts.length > 0
      ? allProducts.map(p => ({ productId: p.id, productName: p.name, time: timeStr }))
      : [{ productId: 'default', productName: 'Your supplements', time: timeStr }];

    updateState({ supplementTimes: times, routineTime: timeStr });
    router.push('/onboarding/sim-notification' as any);
  }, [selectedHour, selectedMinute, allProducts, updateState, router]);

  const fadeSlide = (anim: Animated.Value, dist = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  if (showAssistant) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          style={styles.assistantScroll}
          contentContainerStyle={[styles.assistantContent, { paddingBottom: Math.max(insets.bottom, 20) + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.assistantHeader, { opacity: assistantAnim }]}>
            <View style={[styles.avatarContainer, { borderColor: goalColor + '30' }]}>
              <View style={[styles.avatar, { backgroundColor: goalColor + '12' }]}>
                <Sparkles size={24} color={goalColor} strokeWidth={2} />
              </View>
              <View style={[styles.avatarBadge, { backgroundColor: goalColor }]}>
                <Text style={styles.avatarBadgeText}>AI</Text>
              </View>
            </View>
            <Text style={styles.assistantName}>Volera Assistant</Text>
            <Text style={styles.assistantSub}>Supplement timing expert</Text>
          </Animated.View>

          <View style={styles.messagesContainer}>
            {assistantMessages.filter(m => !m.isTyping).map((msg, i) => {
              const anim = messageAnims[i] || new Animated.Value(1);
              return (
                <Animated.View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    {
                      opacity: anim,
                      transform: [{
                        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
                      }, {
                        scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }),
                      }],
                    },
                  ]}
                >
                  <Text style={styles.messageText}>{msg.text}</Text>
                </Animated.View>
              );
            })}

            {assistantMessages.some(m => m.isTyping) && (
              <View style={styles.messageBubble}>
                <TypingDots color={goalColor} />
              </View>
            )}
          </View>

          {suggestedTimes.length > 0 && !acceptedSuggestion && (
            <Animated.View style={[styles.suggestionsCard, {
              opacity: suggestionsAnim,
              transform: [{
                translateY: suggestionsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
              }],
            }]}>
              <Text style={styles.suggestionsTitle}>Your personalized schedule</Text>

              {suggestedTimes.map((st, i) => {
                const { hour, minute } = parseTimeToHourMin(st.time);
                const product = PRODUCTS.find(p => p.id === st.productId);
                const color = product?.color || goalColor;
                const guide = SUPPLEMENT_TIMING_GUIDE[st.productId];

                return (
                  <View key={st.productId + i} style={styles.suggestionRow}>
                    <View style={[styles.suggestionDot, { backgroundColor: color }]} />
                    <View style={styles.suggestionInfo}>
                      <Text style={styles.suggestionName} numberOfLines={1}>{st.productName}</Text>
                      {guide && <Text style={styles.suggestionReason}>{guide.reason}</Text>}
                    </View>
                    <View style={[styles.suggestionTime, { backgroundColor: color + '10' }]}>
                      <Text style={[styles.suggestionTimeText, { color }]}>
                        {formatTime(hour, minute)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Animated.View>
          )}

          {acceptedSuggestion && (
            <Animated.View style={[styles.acceptedContainer, {
              opacity: acceptAnim,
              transform: [{ scale: acceptAnim }],
            }]}>
              <View style={[styles.acceptedCircle, { backgroundColor: Colors.success + '12' }]}>
                <Check size={28} color={Colors.success} strokeWidth={2.5} />
              </View>
              <Text style={styles.acceptedText}>Schedule saved!</Text>
              <Text style={styles.acceptedSub}>We'll remind you at the right times.</Text>
            </Animated.View>
          )}
        </ScrollView>

        {suggestedTimes.length > 0 && !acceptedSuggestion && (
          <Animated.View style={[styles.assistantFooter, {
            paddingBottom: Math.max(insets.bottom, 20),
            opacity: suggestionsAnim,
          }]}>
            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: goalColor }]}
              onPress={handleAcceptSuggestions}
              activeOpacity={0.85}
            >
              <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.acceptButtonText}>Use this schedule</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.mainContent}>
        <Animated.View style={fadeSlide(titleAnim)}>
          <View style={[styles.clockIcon, { backgroundColor: goalColor + '10', borderColor: goalColor + '20' }]}>
            <Clock size={26} color={goalColor} strokeWidth={2} />
          </View>
        </Animated.View>

        <Animated.Text style={[styles.title, fadeSlide(titleAnim)]}>
          When do you take{'\n'}your supplements?
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, fadeSlide(titleAnim)]}>
          We'll send reminders at the perfect time.
        </Animated.Text>

        <Animated.View style={[styles.pickerCard, fadeSlide(pickerAnim)]}>
          <View style={styles.pickerRow}>
            <WheelPicker
              items={HOURS}
              selectedIndex={selectedHour}
              onSelect={setSelectedHour}
              formatItem={(h) => {
                const hr = h % 12 || 12;
                return hr.toString();
              }}
              goalColor={goalColor}
            />

            <Text style={styles.pickerColon}>:</Text>

            <WheelPicker
              items={MINUTES}
              selectedIndex={selectedMinute}
              onSelect={setSelectedMinute}
              formatItem={(m) => m.toString().padStart(2, '0')}
              goalColor={goalColor}
            />

            <View style={styles.ampmContainer}>
              <TouchableOpacity
                onPress={() => {
                  if (selectedHour >= 12) {
                    setSelectedHour(selectedHour - 12);
                  }
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.ampmButton,
                  selectedHour < 12 && { backgroundColor: goalColor + '15' },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.ampmText,
                  selectedHour < 12 && { color: goalColor },
                ]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (selectedHour < 12) {
                    setSelectedHour(selectedHour + 12);
                  }
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.ampmButton,
                  selectedHour >= 12 && { backgroundColor: goalColor + '15' },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.ampmText,
                  selectedHour >= 12 && { color: goalColor },
                ]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.selectedTimeLabel}>
            {formatTime(selectedHour, MINUTES[selectedMinute])}
          </Text>
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Animated.View style={fadeSlide(helpAnim, 12)}>
          <TouchableOpacity
            onPress={handleDontKnow}
            activeOpacity={0.7}
            style={[styles.helpButton, { borderColor: goalColor + '25' }]}
          >
            <View style={[styles.helpIconWrap, { backgroundColor: goalColor + '10' }]}>
              <Wand2 size={16} color={goalColor} strokeWidth={2} />
            </View>
            <View style={styles.helpTextWrap}>
              <Text style={[styles.helpTitle, { color: goalColor }]}>
                Not sure? Let AI pick for you
              </Text>
              <Text style={styles.helpSub}>
                We'll analyze your stack and find the best times
              </Text>
            </View>
            <ChevronRight size={16} color={goalColor} strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={fadeSlide(pickerAnim, 20)}>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: goalColor }]}
            onPress={handleSetManualTime}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Set this time</Text>
            <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const wheelStyles = StyleSheet.create({
  container: {
    width: 70,
    height: PICKER_HEIGHT,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  highlight: {
    position: 'absolute' as const,
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 1,
    pointerEvents: 'none' as const,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  itemText: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: TEXT_TERTIARY,
  },
});

const typingStyles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center' as const,
  },
  clockIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: TEXT_PRIMARY,
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    color: TEXT_SECONDARY,
    lineHeight: 24,
    marginBottom: 32,
  },
  pickerCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  pickerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
  },
  pickerColon: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  ampmContainer: {
    marginLeft: 12,
    gap: 6,
  },
  ampmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5F3EF',
  },
  ampmText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    color: TEXT_TERTIARY,
  },
  selectedTimeLabel: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: TEXT_SECONDARY,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 28,
    paddingTop: 12,
    gap: 16,
  },
  helpButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  helpIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  helpTextWrap: {
    flex: 1,
  },
  helpTitle: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    marginBottom: 2,
  },
  helpSub: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: TEXT_TERTIARY,
  },
  ctaButton: {
    height: 58,
    borderRadius: 100,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaText: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  assistantScroll: {
    flex: 1,
  },
  assistantContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  assistantHeader: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative' as const,
    marginBottom: 14,
    borderWidth: 2,
    borderRadius: 32,
    padding: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarBadge: {
    position: 'absolute' as const,
    bottom: -2,
    right: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: BG_COLOR,
  },
  avatarBadgeText: {
    fontFamily: Fonts.heading,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  assistantName: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  assistantSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: TEXT_TERTIARY,
  },
  messagesContainer: {
    gap: 10,
    marginBottom: 20,
  },
  messageBubble: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderTopLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  suggestionsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionsTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  suggestionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 14,
  },
  suggestionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 13,
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  suggestionReason: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: TEXT_TERTIARY,
    lineHeight: 15,
  },
  suggestionTime: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  suggestionTimeText: {
    fontFamily: Fonts.heading,
    fontSize: 12,
  },
  acceptedContainer: {
    alignItems: 'center' as const,
    marginTop: 24,
    gap: 12,
  },
  acceptedCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  acceptedText: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: TEXT_PRIMARY,
  },
  acceptedSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  assistantFooter: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: BG_COLOR + 'F2',
    borderTopWidth: 1,
    borderTopColor: CARD_BORDER,
  },
  acceptButton: {
    height: 58,
    borderRadius: 100,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  acceptButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
