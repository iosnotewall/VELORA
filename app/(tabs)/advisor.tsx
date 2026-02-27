import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Animated, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Sparkles, AlertCircle, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMutation } from '@tanstack/react-query';
import { useAppState } from '@/hooks/useAppState';
import { sendChat, hasApiKey, setApiKey } from '@/services/openai';
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
}



function buildSystemPrompt(state: {
  goal: string;
  userName: string;
  currentStreak: number;
  totalDaysTaken: number;
  products: string[];
  dailyScores: Array<{ date: string; energy: number; sleep: number; mood: number }>;
  frequency: number;
  friction: string;
  commitmentLevel: string;
}): string {
  const goalData = GOALS.find(g => g.id === state.goal);
  const metrics = GOAL_METRICS[state.goal] || [];
  const science = SCIENCE_CONTENT[state.goal];
  const milestones = MILESTONES[state.goal];

  const recentScores = state.dailyScores.slice(-7);
  const scoresSummary = recentScores.length > 0
    ? recentScores.map(s => `${s.date}: energy=${s.energy}/5, sleep=${s.sleep}/5, mood=${s.mood}/5`).join('\n')
    : 'No check-in data yet.';

  const metricNames = metrics.map(m => m.label).join(', ');

  return `You are Velora — a warm, science-grounded supplement wellness advisor inside a health tracking app. You speak with quiet authority, like a knowledgeable friend who also happens to read clinical studies.

PERSONALITY:
- Empathetic but not saccharine. Direct but not cold.
- Reference specific science (cite mechanisms, not just "studies show")
- When the user is struggling, acknowledge it genuinely before advising
- Keep responses concise — 2-4 short paragraphs max. Mobile-friendly.
- Use occasional line breaks for readability. No markdown headers or bullet lists unless asked.

USER CONTEXT:
- Name: ${state.userName || 'there'}
- Goal: ${goalData?.label ?? 'General wellness'} — "${goalData?.sub ?? ''}"
- Current streak: ${state.currentStreak} days
- Total days tracked: ${state.totalDaysTaken}
- Supplements: ${state.products.join(', ') || 'Not specified'}
- Consistency level before app: ${state.frequency}/7 days per week
- Main friction: ${state.friction || 'Not specified'}
- Commitment: ${state.commitmentLevel || 'Not specified'}
- They track these metrics daily: ${metricNames}

RECENT CHECK-IN DATA (last 7 days):
${scoresSummary}

SCIENCE CONTEXT FOR THEIR GOAL:
${science?.text ?? 'General supplement consistency and bioavailability.'}
Key ingredients: ${science?.ingredients?.join(', ') ?? 'Various'}

MILESTONE EXPECTATIONS:
Day 7: ${milestones?.d7 ?? 'Initial absorption phase'}
Day 21: ${milestones?.d21 ?? 'Tissue saturation begins'}
Day 30: ${milestones?.d30 ?? 'Baseline shift expected'}

RULES:
- Always ground advice in biology/science. Cite mechanisms (e.g., "magnesium is a cofactor for 300+ enzymatic reactions").
- If they report declining scores, investigate — ask about sleep, stress, diet changes.
- If they're doing well, reinforce with WHY it's working biologically.
- Never diagnose or replace medical advice. Say "consider discussing with your doctor" for serious concerns.
- If asked about something outside supplements/wellness, gently redirect.
- Reference their actual data when relevant ("your sleep scores have been trending down this week").
- Be encouraging about streaks but honest about science timelines.`;
}

const SUGGESTED_PROMPTS = [
  "Why aren't I feeling results yet?",
  "My sleep has been getting worse",
  "When should I take my supplements?",
  "I keep forgetting to take them",
];

function MessageBubble({ message, isLast }: { message: DisplayMessage; isLast: boolean }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
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
        </Text>
      </View>
    </Animated.View>
  );
}

export default function AdvisorScreen() {
  const insets = useSafeAreaInsets();
  const appState = useAppState();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [keyReady, setKeyReady] = useState(false);
  const flatListRef = useRef<FlatList<DisplayMessage>>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      const exists = await hasApiKey();
      console.log('[Advisor] API key available:', exists);
      setKeyReady(exists);
    })();
  }, []);

  const chatHistory = useRef<ChatMessage[]>([]);

  const systemPrompt = useMemo(() => buildSystemPrompt({
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

  const sendMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      chatHistory.current.push({ role: 'user', content: userMessage });

      const fullMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.current,
      ];

      const response = await sendChat(fullMessages);
      chatHistory.current.push({ role: 'assistant', content: response });
      return response;
    },
    onError: (error: Error) => {
      console.log('[Advisor] Send error:', error.message);
      chatHistory.current.pop();
    },
  });

  const handleSend = useCallback((text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || sendMutation.isPending) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    sendMutation.mutate(messageText, {
      onSuccess: (response) => {
        const assistantMsg: DisplayMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      },
      onError: (error: Error) => {
        const errorMsg: DisplayMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: error.message,
          timestamp: Date.now(),
          isError: true,
        };
        setMessages(prev => [...prev, errorMsg]);
      },
    });
  }, [input, sendMutation, systemPrompt]);

  const handleSuggestion = useCallback((prompt: string) => {
    handleSend(prompt);
  }, [handleSend]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToEnd();
    }
  }, [messages.length, scrollToEnd]);

  const renderMessage = useCallback(({ item, index }: { item: DisplayMessage; index: number }) => (
    <MessageBubble message={item} isLast={index === messages.length - 1} />
  ), [messages.length]);

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
              I'm your personal supplement advisor. I can see your tracking data and help with science-backed guidance for your {goalData?.label?.toLowerCase() ?? 'wellness'} goals.
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

        {sendMutation.isPending && (
          <View style={styles.typingIndicator}>
            <View style={msgStyles.avatar}>
              <Sparkles size={12} color={Colors.navy} strokeWidth={2} />
            </View>
            <View style={styles.typingDots}>
              <ActivityIndicator size="small" color={Colors.mediumGray} />
              <Text style={styles.typingText}>Thinking...</Text>
            </View>
          </View>
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
              disabled={!input.trim() || sendMutation.isPending}
              style={[
                styles.sendButton,
                (input.trim() && !sendMutation.isPending) && styles.sendButtonActive,
              ]}
              activeOpacity={0.7}
              testID="send-button"
            >
              <Send
                size={18}
                color={(input.trim() && !sendMutation.isPending) ? Colors.white : Colors.mediumGray}
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
  typingIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  typingText: {
    fontFamily: Fonts.dmRegular,
    fontSize: 13,
    color: Colors.mediumGray,
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
