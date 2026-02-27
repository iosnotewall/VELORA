import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Sparkles, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import { sendChatStreaming, hasApiKey } from '@/services/openai';
import type { ChatMessage } from '@/services/openai';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOALS, GOAL_METRICS, SCIENCE_CONTENT, MILESTONES } from '@/constants/content';

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isError?: boolean;
  isStreaming?: boolean;
}

function buildUserContext(state: {
  goal: string;
  userName: string;
  currentStreak: number;
  totalDaysTaken: number;
  products: string[];
  dailyScores: Array<{ date: string; energy: number; sleep: number; mood: number; goalScores?: Record<string, number> }>;
  frequency: number;
  friction: string;
  commitmentLevel: string;
}): string {
  const goalData = GOALS.find(g => g.id === state.goal);
  const metrics = GOAL_METRICS[state.goal] || [];
  const science = SCIENCE_CONTENT[state.goal];
  const milestones = MILESTONES[state.goal];

  const recentScores = state.dailyScores.slice(-7);

  let dataBlock = 'No check-in data yet.';
  if (recentScores.length > 0) {
    const lines = recentScores.map(s => {
      let line = `${s.date}: energy=${s.energy}/5, sleep=${s.sleep}/5, mood=${s.mood}/5`;
      if (s.goalScores) {
        const extras = Object.entries(s.goalScores)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ');
        if (extras) line += ` | ${extras}`;
      }
      return line;
    });
    dataBlock = lines.join('\n');
  }

  const trendNote = buildTrendNote(recentScores);

  return `USER PROFILE:
Name: ${state.userName || 'User'}
Goal: ${goalData?.label ?? 'General wellness'} — ${goalData?.sub ?? ''}
Streak: ${state.currentStreak} days | Total tracked: ${state.totalDaysTaken} days
Supplements: ${state.products.join(', ') || 'Not specified'}
Pre-app consistency: ${state.frequency}/7 days per week
Main barrier: ${state.friction || 'Not specified'}
Commitment: ${state.commitmentLevel || 'Not specified'}
Tracked metrics: ${metrics.map(m => m.label).join(', ')}

LAST 7 DAYS:
${dataBlock}
${trendNote}

SCIENCE (for their goal):
${science?.text ?? 'General supplement consistency.'}
Key compounds: ${science?.ingredients?.join(', ') ?? 'Various'}

MILESTONES:
Day 7: ${milestones?.d7 ?? 'Initial absorption'}
Day 21: ${milestones?.d21 ?? 'Tissue saturation'}
Day 30: ${milestones?.d30 ?? 'Baseline shift'}`;
}

function buildTrendNote(scores: Array<{ energy: number; sleep: number; mood: number }>): string {
  if (scores.length < 3) return '';

  const recent3 = scores.slice(-3);
  const older = scores.slice(0, -3);
  if (older.length === 0) return '';

  const avgRecent = (key: 'energy' | 'sleep' | 'mood') =>
    recent3.reduce((sum, s) => sum + s[key], 0) / recent3.length;
  const avgOlder = (key: 'energy' | 'sleep' | 'mood') =>
    older.reduce((sum, s) => sum + s[key], 0) / older.length;

  const trends: string[] = [];
  const keys: Array<'energy' | 'sleep' | 'mood'> = ['energy', 'sleep', 'mood'];
  for (const key of keys) {
    const diff = avgRecent(key) - avgOlder(key);
    if (diff > 0.5) trends.push(`${key} trending UP`);
    else if (diff < -0.5) trends.push(`${key} trending DOWN`);
  }

  return trends.length > 0 ? `\nTRENDS: ${trends.join(', ')}` : '';
}

const SYSTEM_PROMPT = `You are Velora — a sharp, warm supplement wellness advisor inside a health app. You have access to the user's real tracking data below.

VOICE:
- Talk like a knowledgeable friend, not a textbook. Short sentences. Conversational.
- Reference their ACTUAL data when relevant — specific numbers, trends, streak length.
- When they're struggling, acknowledge it in one sentence, then give one clear action.
- When they're doing well, tell them WHY it's working biologically in one sentence.

FORMAT RULES (critical):
- MAX 3-4 sentences per response. Never more unless they explicitly ask for detail.
- No markdown headers. No bullet lists. No asterisks. Just clean, flowing text.
- One paragraph usually. Two if needed. Never three.
- Be specific: "your sleep dropped from 4.2 to 3.0 this week" not "your sleep seems worse"

KNOWLEDGE:
- Ground advice in mechanisms (e.g. "magnesium is a GABA agonist — it literally quiets neurons")
- Reference timelines honestly ("most people feel magnesium benefits around day 14-21")
- If their data shows a clear pattern, call it out directly
- Never diagnose. For serious concerns, one sentence: "worth mentioning to your doctor"
- Stay in your lane: supplements, consistency, wellness habits.`;

const SUGGESTED_PROMPTS = [
  "Why don't I feel results yet?",
  "My sleep got worse this week",
  "Best time to take my stack?",
  "I keep skipping days",
];

function MessageBubble({ message }: { message: DisplayMessage }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: Platform.OS !== 'web', damping: 20, stiffness: 200 }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const isUser = message.role === 'user';

  return (
    <Animated.View
      style={[
        msgStyles.wrapper,
        isUser ? msgStyles.wrapperUser : msgStyles.wrapperAssistant,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {!isUser && (
        <View style={msgStyles.avatarContainer}>
          <View style={msgStyles.avatar}>
            <Sparkles size={14} color={Colors.navy} strokeWidth={2} />
          </View>
        </View>
      )}
      <View style={[
        msgStyles.bubble,
        isUser ? msgStyles.bubbleUser : msgStyles.bubbleAssistant,
        message.isError && msgStyles.bubbleError,
      ]}>
        <Text style={[
          msgStyles.text,
          isUser ? msgStyles.textUser : msgStyles.textAssistant,
          message.isError && msgStyles.textError,
        ]}>
          {message.content}
          {message.isStreaming && <Text style={msgStyles.cursor}>|</Text>}
        </Text>
      </View>
    </Animated.View>
  );
}

const MemoizedBubble = React.memo(MessageBubble, (prev, next) => {
  return prev.message.content === next.message.content &&
    prev.message.isStreaming === next.message.isStreaming;
});

export default function AdvisorScreen() {
  const insets = useSafeAreaInsets();
  const appState = useAppState();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [keyReady, setKeyReady] = useState(false);
  const flatListRef = useRef<FlatList<DisplayMessage>>(null);
  const inputRef = useRef<TextInput>(null);
  const chatHistory = useRef<ChatMessage[]>([]);

  useEffect(() => {
    (async () => {
      const exists = await hasApiKey();
      console.log('[Advisor] API key available:', exists);
      setKeyReady(exists);
    })();
  }, []);

  const userContext = useMemo(() => buildUserContext({
    goal: appState.goal,
    userName: appState.userName,
    currentStreak: appState.currentStreak,
    totalDaysTaken: appState.totalDaysTaken,
    products: appState.products,
    dailyScores: appState.dailyScores,
    frequency: appState.frequency,
    friction: appState.friction,
    commitmentLevel: appState.commitmentLevel,
  }), [
    appState.goal, appState.userName, appState.currentStreak,
    appState.totalDaysTaken, appState.products, appState.dailyScores,
    appState.frequency, appState.friction, appState.commitmentLevel,
  ]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isStreaming) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    chatHistory.current.push({ role: 'user', content: messageText });

    const streamingId = `assistant-${Date.now()}`;
    const streamingMsg: DisplayMessage = {
      id: streamingId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, streamingMsg]);

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + userContext },
      ...chatHistory.current,
    ];

    try {
      const finalText = await sendChatStreaming(fullMessages, (partialText) => {
        setMessages(prev =>
          prev.map(m => m.id === streamingId
            ? { ...m, content: partialText }
            : m
          )
        );
        scrollToEnd();
      });

      setMessages(prev =>
        prev.map(m => m.id === streamingId
          ? { ...m, content: finalText, isStreaming: false }
          : m
        )
      );

      chatHistory.current.push({ role: 'assistant', content: finalText });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      console.log('[Advisor] Error:', errMsg);

      chatHistory.current.pop();

      setMessages(prev =>
        prev.map(m => m.id === streamingId
          ? { ...m, content: errMsg, isStreaming: false, isError: true }
          : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, userContext, scrollToEnd]);

  const handleSuggestion = useCallback((prompt: string) => {
    handleSend(prompt);
  }, [handleSend]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToEnd();
    }
  }, [messages.length, scrollToEnd]);

  const renderMessage = useCallback(({ item }: { item: DisplayMessage }) => (
    <MemoizedBubble message={item} />
  ), []);

  const keyExtractor = useCallback((item: DisplayMessage) => item.id, []);

  const goalData = GOALS.find(g => g.id === appState.goal);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Sparkles size={18} color={Colors.navy} strokeWidth={2} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Velora</Text>
          <Text style={styles.headerSub}>
            {goalData ? `${goalData.label} advisor` : 'Wellness advisor'}
          </Text>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setMessages([]);
              chatHistory.current = [];
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={styles.resetButton}
            testID="reset-chat"
          >
            <RotateCcw size={16} color={Colors.mediumGray} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Sparkles size={32} color={Colors.navy} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              {appState.userName ? `Hi ${appState.userName}` : 'Hi there'}
            </Text>
            <Text style={styles.emptyBody}>
              I can see your tracking data and give you specific, science-backed advice for your {goalData?.label?.toLowerCase() ?? 'wellness'} goals.
            </Text>

            <View style={styles.suggestionsContainer}>
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.suggestionPill}
                  onPress={() => handleSuggestion(prompt)}
                  activeOpacity={0.7}
                  testID={`suggestion-${i}`}
                >
                  <Text style={styles.suggestionText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
          />
        )}

        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about your supplements..."
              placeholderTextColor={Colors.mediumGray}
              multiline
              maxLength={500}
              returnKeyType="default"
              testID="chat-input"
            />
            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              style={[
                styles.sendButton,
                (input.trim() && !isStreaming) && styles.sendButtonActive,
              ]}
              activeOpacity={0.7}
              testID="send-button"
            >
              <Send
                size={18}
                color={(input.trim() && !isStreaming) ? Colors.white : Colors.mediumGray}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const msgStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row' as const,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  wrapperUser: {
    justifyContent: 'flex-end' as const,
  },
  wrapperAssistant: {
    justifyContent: 'flex-start' as const,
  },
  avatarContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: Colors.softBlue,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  bubble: {
    maxWidth: '78%' as const,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: Colors.navy,
    borderBottomRightRadius: 6,
  },
  bubbleAssistant: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  bubbleError: {
    backgroundColor: Colors.warningBg,
    borderWidth: 1,
    borderColor: '#F5C6BB',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  textUser: {
    fontFamily: Fonts.dmRegular,
    color: Colors.white,
  },
  textAssistant: {
    fontFamily: Fonts.dmRegular,
    color: Colors.darkGray,
  },
  textError: {
    color: Colors.warning,
    fontFamily: Fonts.dmRegular,
  },
  cursor: {
    color: Colors.mediumGray,
    fontWeight: '300' as const,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    backgroundColor: Colors.cream,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.softBlue,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontFamily: Fonts.playfairBold,
    fontSize: 18,
    color: Colors.navy,
  },
  headerSub: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: Colors.mediumGray,
    marginTop: 1,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  chatArea: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    alignItems: 'center' as const,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.softBlue,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: Fonts.playfairBold,
    fontSize: 24,
    color: Colors.navy,
    textAlign: 'center' as const,
    marginBottom: 10,
  },
  emptyBody: {
    fontFamily: Fonts.dmRegular,
    fontSize: 15,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: '100%' as const,
    gap: 8,
  },
  suggestionPill: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontFamily: Fonts.dmMedium,
    fontSize: 14,
    color: Colors.navy,
  },
  messagesList: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: Colors.cream,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    backgroundColor: Colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: Fonts.dmRegular,
    fontSize: 15,
    color: Colors.navy,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  sendButtonActive: {
    backgroundColor: Colors.navy,
  },
});
