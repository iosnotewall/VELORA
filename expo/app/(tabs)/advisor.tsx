import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Animated,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Sparkles, Plus, ChevronLeft, Trash2, Clock, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import { sendChatStreaming, hasApiKey, trimHistory } from '@/services/openai';
import type { ChatMessage } from '@/services/openai';
import {
  getSessionIndex, loadSession, saveSession, deleteSession,
  createSessionId, deriveTitle,
} from '@/services/chatSessions';
import type { ChatSession, SessionMessage, SessionSummary } from '@/services/chatSessions';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOALS, GOAL_METRICS, SCIENCE_CONTENT, MILESTONES } from '@/constants/content';

interface DisplayMessage extends SessionMessage {
  isError?: boolean;
  isStreaming?: boolean;
}

type ScreenView = 'welcome' | 'chat' | 'history';

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

  const recentScores = state.dailyScores.slice(-14);

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

  return `USER PROFILE (live data — refreshed at conversation start):
Name: ${state.userName || 'User'}
Biological sex: Female (all advice is personalized to female biology)
Goal: ${goalData?.label ?? 'General wellness'} — ${goalData?.sub ?? ''}
Current streak: ${state.currentStreak} days | Total days tracked: ${state.totalDaysTaken}
Supplements: ${state.products.join(', ') || 'Not specified'}
Pre-app consistency: ${state.frequency}/7 days per week
Main barrier: ${state.friction || 'Not specified'}
Commitment level: ${state.commitmentLevel || 'Not specified'}
Tracked metrics: ${metrics.map(m => m.label).join(', ')}

LAST 14 DAYS OF CHECK-INS:
${dataBlock}
${trendNote}

SCIENCE (for their goal — ${goalData?.label ?? 'general'}):
${science?.text ?? 'General supplement consistency.'}
Key compounds: ${science?.ingredients?.join(', ') ?? 'Various'}

MILESTONE TIMELINE:
Day 7: ${milestones?.d7 ?? 'Initial absorption'}
Day 21: ${milestones?.d21 ?? 'Tissue saturation'}
Day 30: ${milestones?.d30 ?? 'Baseline shift'}`;
}

function buildTrendNote(scores: Array<{ energy: number; sleep: number; mood: number }>): string {
  if (scores.length < 3) return '\nNOT ENOUGH DATA FOR TRENDS — do NOT fabricate or guess trends.';

  const recent3 = scores.slice(-3);
  const older = scores.slice(0, -3);
  if (older.length === 0) return '\nONLY 3 DATA POINTS — too early to identify trends. Do NOT guess.';

  const avg = (arr: typeof scores, key: 'energy' | 'sleep' | 'mood') =>
    +(arr.reduce((sum, s) => sum + s[key], 0) / arr.length).toFixed(2);

  const keys: Array<'energy' | 'sleep' | 'mood'> = ['energy', 'sleep', 'mood'];
  const lines: string[] = [];

  for (const key of keys) {
    const recentAvg = avg(recent3, key);
    const olderAvg = avg(older, key);
    const diff = +(recentAvg - olderAvg).toFixed(2);

    if (diff > 0.5) {
      lines.push(`${key}: ${olderAvg} → ${recentAvg} (UP by ${diff})`);
    } else if (diff < -0.5) {
      lines.push(`${key}: ${olderAvg} → ${recentAvg} (DOWN by ${Math.abs(diff)})`);
    } else {
      lines.push(`${key}: ${olderAvg} → ${recentAvg} (STABLE, change of ${diff})`);
    }
  }

  return `\nCOMPUTED TRENDS (older avg → recent 3-day avg):\n${lines.join('\n')}\nIMPORTANT: Only reference these exact numbers. If a metric is STABLE, do NOT say it dropped or improved.`;
}

const SYSTEM_PROMPT = `You are Velora — a sharp, warm supplement wellness advisor inside a health app designed exclusively for women. You have access to the user's real tracking data below.

IMPORTANT — FEMALE BIOLOGY FOCUS:
- ALL advice is personalized to female biology, hormonal cycles, and women's health.
- Consider menstrual cycle phases, hormonal fluctuations, perimenopause/menopause when relevant.
- Reference female-specific mechanisms: estrogen/progesterone ratios, iron loss during menstruation, bone density changes, etc.
- Be aware of how female hormones affect supplement absorption, energy, mood, and sleep throughout the month.

VOICE:
- Talk like a knowledgeable friend, not a textbook. Short sentences. Conversational.
- Reference their ACTUAL data when relevant — specific numbers, trends, streak length.
- When they're struggling, acknowledge it in one sentence, then give one clear action.
- When they're doing well, tell them WHY it's working biologically in one sentence.

FORMAT RULES (critical):
- MAX 4-5 sentences per response. Never more unless they explicitly ask for detail.
- No markdown headers. No bullet lists. No asterisks. Just clean, flowing text.
- One paragraph usually. Two if needed. Never three.
- Be specific with real numbers ONLY when the data actually shows a change.

DATA INTEGRITY (critical — never violate):
- ONLY state what the COMPUTED TRENDS section explicitly shows. Never invent numbers.
- If a metric is marked STABLE, do NOT say it "dropped" or "improved". Say it's been consistent.
- If the user says something got worse but data shows STABLE, gently note: "your data actually shows it's been steady at X."
- If there's not enough data, say so. Never fabricate trends.
- Double-check: before saying "X went from A to B", verify A ≠ B. If A = B, that is NOT a change.

KNOWLEDGE:
- Ground advice in mechanisms (e.g. "magnesium is a GABA agonist — it literally quiets neurons")
- Reference timelines honestly ("most people feel magnesium benefits around day 14-21")
- If their data shows a clear pattern, call it out directly
- Consider female-specific nutrient needs: higher iron requirements, calcium/D3 for bone health, folate for reproductive health
- Never diagnose. For serious concerns, one sentence: "worth mentioning to your doctor"
- Stay in your lane: supplements, consistency, wellness habits.

CONTEXT AWARENESS:
- You receive fresh user data at the start of each conversation.
- Always use the most recent data. If data contradicts what the user says, gently note it.
- If they have no check-in data yet, focus on what to expect and how to start tracking.`;

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

function formatSessionDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export default function AdvisorScreen() {
  const insets = useSafeAreaInsets();
  const appState = useAppState();

  const [view, setView] = useState<ScreenView>('welcome');
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [keyReady, setKeyReady] = useState(false);
  const flatListRef = useRef<FlatList<DisplayMessage>>(null);
  const inputRef = useRef<TextInput>(null);
  const chatHistoryRef = useRef<ChatMessage[]>([]);

  const welcomeFade = useRef(new Animated.Value(1)).current;
  const welcomeSlide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const exists = await hasApiKey();
      console.log('[Advisor] API key available:', exists);
      setKeyReady(exists);
    })();
  }, []);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    const index = await getSessionIndex();
    setSessions(index);
    setSessionsLoading(false);
    console.log('[Advisor] Loaded', index.length, 'sessions');
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

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

  const startNewChat = useCallback(() => {
    const sessionId = createSessionId();
    const now = Date.now();
    const session: ChatSession = {
      id: sessionId,
      title: 'New conversation',
      createdAt: now,
      updatedAt: now,
      messages: [],
      contextSnapshot: userContext,
    };
    setActiveSession(session);
    setMessages([]);
    chatHistoryRef.current = [];
    setView('chat');
    console.log('[Advisor] Started new chat with fresh context, session:', sessionId);
  }, [userContext]);

  const openSession = useCallback(async (sessionId: string) => {
    const session = await loadSession(sessionId);
    if (!session) {
      console.log('[Advisor] Failed to load session:', sessionId);
      return;
    }

    setActiveSession({
      ...session,
      contextSnapshot: userContext,
    });

    const displayMsgs: DisplayMessage[] = session.messages.map(m => ({
      ...m,
      isError: false,
      isStreaming: false,
    }));
    setMessages(displayMsgs);

    chatHistoryRef.current = session.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    setView('chat');
    console.log('[Advisor] Opened session:', sessionId, 'with', session.messages.length, 'messages + fresh context');
  }, [userContext]);

  const goBackToWelcome = useCallback(async () => {
    if (activeSession && activeSession.messages.length > 0) {
      await saveSession(activeSession);
    }
    setActiveSession(null);
    setMessages([]);
    chatHistoryRef.current = [];
    setInput('');
    await loadSessions();
    setView('welcome');
  }, [activeSession, loadSessions]);

  const goToHistory = useCallback(async () => {
    await loadSessions();
    setView('history');
  }, [loadSessions]);

  const goBackFromHistory = useCallback(() => {
    setView('welcome');
  }, []);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteSession(sessionId);
    await loadSessions();
  }, [loadSessions]);

  const persistMessage = useCallback((session: ChatSession, msg: SessionMessage) => {
    const updated: ChatSession = {
      ...session,
      messages: [...session.messages, msg],
      updatedAt: Date.now(),
      title: session.messages.length === 0 ? deriveTitle(msg.content) : session.title,
    };
    setActiveSession(updated);
    saveSession(updated);
    return updated;
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isStreaming) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let currentSession = activeSession;
    if (!currentSession) {
      const sessionId = createSessionId();
      const now = Date.now();
      currentSession = {
        id: sessionId,
        title: 'New conversation',
        createdAt: now,
        updatedAt: now,
        messages: [],
        contextSnapshot: userContext,
      };
      setActiveSession(currentSession);
      chatHistoryRef.current = [];
      setView('chat');
      console.log('[Advisor] Auto-created new chat from welcome, session:', sessionId);
    }

    const userMsg: SessionMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    const displayUser: DisplayMessage = { ...userMsg };
    setMessages(prev => [...prev, displayUser]);
    setInput('');
    setIsStreaming(true);

    chatHistoryRef.current.push({ role: 'user', content: messageText });

    currentSession = persistMessage(currentSession, userMsg);

    const streamingId = `assistant-${Date.now()}`;
    const streamingDisplay: DisplayMessage = {
      id: streamingId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, streamingDisplay]);

    const contextToUse = userContext;

    const fullMessages = trimHistory([
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + contextToUse },
      ...chatHistoryRef.current,
    ]);

    console.log('[Advisor] Sending', fullMessages.length, 'messages (system + history). Context length:', contextToUse.length);

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

      chatHistoryRef.current.push({ role: 'assistant', content: finalText });

      const assistantMsg: SessionMessage = {
        id: streamingId,
        role: 'assistant',
        content: finalText,
        timestamp: Date.now(),
      };
      persistMessage(currentSession, assistantMsg);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      console.log('[Advisor] Error:', errMsg);

      chatHistoryRef.current.pop();

      setMessages(prev =>
        prev.map(m => m.id === streamingId
          ? { ...m, content: errMsg, isStreaming: false, isError: true }
          : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, activeSession, userContext, scrollToEnd, persistMessage]);

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

  if (view === 'history') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.historyHeader}>
          <TouchableOpacity
            onPress={goBackFromHistory}
            style={styles.backButton}
            activeOpacity={0.7}
            testID="history-back-button"
          >
            <ChevronLeft size={20} color={Colors.navy} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.historyHeaderTitle}>Previous Chats</Text>
          <View style={{ width: 36 }} />
        </View>

        {sessionsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.navy} size="small" />
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyHistory}>
            <View style={styles.emptyHistoryIcon}>
              <Clock size={28} color={Colors.mediumGray} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyHistoryTitle}>No conversations yet</Text>
            <Text style={styles.emptyHistoryBody}>
              Your previous conversations with Velora will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.sessionsList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.sessionCard}
                onPress={() => openSession(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.sessionCardContent}>
                  <View style={styles.sessionCardTop}>
                    <Text style={styles.sessionTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.sessionDate}>{formatSessionDate(item.updatedAt)}</Text>
                  </View>
                  <Text style={styles.sessionPreview} numberOfLines={2}>{item.preview}</Text>
                  <View style={styles.sessionCardBottom}>
                    <Text style={styles.sessionMsgCount}>{item.messageCount} messages</Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(item.id);
                      }}
                      style={styles.deleteButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={14} color={Colors.mediumGray} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  if (view === 'welcome') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.welcomeHeader}>
          <View style={styles.welcomeHeaderLeft}>
            <View style={styles.headerIcon}>
              <Sparkles size={18} color={Colors.navy} strokeWidth={2} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Velora</Text>
              <Text style={styles.headerSub}>Fresh context loaded</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={startNewChat}
            style={styles.newChatIconButton}
            activeOpacity={0.7}
            testID="new-chat-button"
          >
            <Plus size={18} color={Colors.mediumGray} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {sessions.length > 0 && (
            <TouchableOpacity
              style={styles.historyBar}
              onPress={goToHistory}
              activeOpacity={0.7}
              testID="view-history-button"
            >
              <View style={styles.historyBarLeft}>
                <Clock size={14} color={Colors.mediumGray} strokeWidth={2} />
                <Text style={styles.historyBarText}>
                  {sessions.length} previous {sessions.length === 1 ? 'chat' : 'chats'}
                </Text>
              </View>
              <ChevronRight size={16} color={Colors.mediumGray} strokeWidth={2} />
            </TouchableOpacity>
          )}

          <ScrollView
            contentContainerStyle={styles.welcomeScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.welcomeIconWrap}>
              <View style={styles.welcomeIconCircle}>
                <Sparkles size={30} color={Colors.navy} strokeWidth={1.5} />
              </View>
            </View>

            <Text style={styles.welcomeTitle}>
              {appState.userName ? `Hi ${appState.userName}` : 'Hi there'}
            </Text>

            <Text style={styles.welcomeBody}>
              I have your latest tracking data loaded. Ask me anything about your {goalData?.label?.toLowerCase() ?? 'wellness'} goals.
            </Text>

            <View style={styles.contextBadge}>
              <Text style={styles.contextBadgeText}>
                {appState.totalDaysTaken > 0
                  ? `${appState.totalDaysTaken} days tracked \u00B7 ${appState.currentStreak} day streak`
                  : 'No check-ins yet \u00B7 ready to help you start'}
              </Text>
            </View>

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


          </ScrollView>

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={goBackToWelcome}
          style={styles.backButton}
          activeOpacity={0.7}
          testID="back-button"
        >
          <ChevronLeft size={20} color={Colors.navy} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Sparkles size={18} color={Colors.navy} strokeWidth={2} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Velora</Text>
          <Text style={styles.headerSub}>
            {activeSession?.messages.length === 0 ? 'Fresh context loaded' : `${activeSession?.messages.length ?? 0} messages`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            goBackToWelcome().then(() => startNewChat());
          }}
          style={styles.resetButton}
          testID="new-chat-inline"
        >
          <Plus size={16} color={Colors.mediumGray} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyChatState}>
            <View style={styles.emptyChatIconWrap}>
              <Sparkles size={28} color={Colors.navy} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyChatTitle}>New conversation</Text>
            <Text style={styles.emptyChatBody}>
              Ask me anything about your supplements and wellness goals.
            </Text>
            <View style={styles.chatSuggestionsWrap}>
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.suggestionPill}
                  onPress={() => handleSuggestion(prompt)}
                  activeOpacity={0.7}
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
  welcomeHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    backgroundColor: Colors.cream,
  },
  welcomeHeaderLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    backgroundColor: Colors.cream,
  },
  historyHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    backgroundColor: Colors.cream,
  },
  historyHeaderTitle: {
    fontFamily: Fonts.playfairBold,
    fontSize: 18,
    color: Colors.navy,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 8,
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
  newChatIconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  welcomeScroll: {
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 20,
    alignItems: 'center' as const,
  },
  welcomeIconWrap: {
    marginBottom: 20,
  },
  welcomeIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: Colors.softBlue,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  welcomeTitle: {
    fontFamily: Fonts.playfairBold,
    fontSize: 26,
    color: Colors.navy,
    textAlign: 'center' as const,
    marginBottom: 10,
  },
  welcomeBody: {
    fontFamily: Fonts.dmRegular,
    fontSize: 15,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  contextBadge: {
    backgroundColor: Colors.successBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 28,
  },
  contextBadgeText: {
    fontFamily: Fonts.dmMedium,
    fontSize: 12,
    color: Colors.success,
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
  historyBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyBarLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  historyBarText: {
    fontFamily: Fonts.dmMedium,
    fontSize: 13,
    color: Colors.mediumGray,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emptyHistory: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    alignItems: 'center' as const,
  },
  emptyHistoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: Colors.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 20,
  },
  emptyHistoryTitle: {
    fontFamily: Fonts.playfairBold,
    fontSize: 20,
    color: Colors.navy,
    marginBottom: 8,
  },
  emptyHistoryBody: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    lineHeight: 21,
  },
  sessionsList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  sessionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionCardContent: {
    padding: 16,
  },
  sessionCardTop: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 6,
  },
  sessionTitle: {
    fontFamily: Fonts.dmMedium,
    fontSize: 15,
    color: Colors.navy,
    flex: 1,
    marginRight: 8,
  },
  sessionDate: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: Colors.mediumGray,
  },
  sessionPreview: {
    fontFamily: Fonts.dmRegular,
    fontSize: 13,
    color: Colors.mediumGray,
    lineHeight: 19,
    marginBottom: 8,
  },
  sessionCardBottom: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  sessionMsgCount: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: Colors.mediumGray,
  },
  deleteButton: {
    padding: 4,
  },
  chatArea: {
    flex: 1,
  },
  emptyChatState: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
    alignItems: 'center' as const,
  },
  emptyChatIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.softBlue,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  emptyChatTitle: {
    fontFamily: Fonts.playfairBold,
    fontSize: 20,
    color: Colors.navy,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  emptyChatBody: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    lineHeight: 21,
    marginBottom: 24,
  },
  chatSuggestionsWrap: {
    width: '100%' as const,
    gap: 8,
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
