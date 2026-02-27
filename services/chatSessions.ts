import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_INDEX_KEY = 'velora_chat_sessions_index';
const SESSION_PREFIX = 'velora_chat_';

export interface SessionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: SessionMessage[];
  contextSnapshot: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  preview: string;
}

export async function getSessionIndex(): Promise<SessionSummary[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SessionSummary[];
    return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (e) {
    console.log('[ChatSessions] Failed to load index:', e);
    return [];
  }
}

async function saveSessionIndex(index: SessionSummary[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.log('[ChatSessions] Failed to save index:', e);
  }
}

export async function loadSession(sessionId: string): Promise<ChatSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_PREFIX + sessionId);
    if (!raw) return null;
    return JSON.parse(raw) as ChatSession;
  } catch (e) {
    console.log('[ChatSessions] Failed to load session:', sessionId, e);
    return null;
  }
}

export async function saveSession(session: ChatSession): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSION_PREFIX + session.id, JSON.stringify(session));

    const index = await getSessionIndex();
    const existing = index.findIndex(s => s.id === session.id);

    const lastUserMsg = [...session.messages].reverse().find(m => m.role === 'user');
    const lastAssistantMsg = [...session.messages].reverse().find(m => m.role === 'assistant');
    const preview = lastAssistantMsg?.content.slice(0, 80) ?? lastUserMsg?.content.slice(0, 80) ?? '';

    const summary: SessionSummary = {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages.length,
      preview,
    };

    if (existing >= 0) {
      index[existing] = summary;
    } else {
      index.unshift(summary);
    }

    await saveSessionIndex(index);
    console.log('[ChatSessions] Saved session:', session.id, 'messages:', session.messages.length);
  } catch (e) {
    console.log('[ChatSessions] Failed to save session:', e);
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_PREFIX + sessionId);
    const index = await getSessionIndex();
    const filtered = index.filter(s => s.id !== sessionId);
    await saveSessionIndex(filtered);
    console.log('[ChatSessions] Deleted session:', sessionId);
  } catch (e) {
    console.log('[ChatSessions] Failed to delete session:', e);
  }
}

export function createSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function deriveTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().replace(/\n/g, ' ');
  if (cleaned.length <= 40) return cleaned;
  return cleaned.slice(0, 37) + '...';
}
