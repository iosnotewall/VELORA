import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENAI_KEY_STORAGE = 'openai_api_key';

const ENV_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function getStoredKey(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(OPENAI_KEY_STORAGE);
    }
    return await SecureStore.getItemAsync(OPENAI_KEY_STORAGE);
  } catch (e) {
    console.log('[OpenAI] Failed to read key:', e);
    return null;
  }
}

async function storeKey(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(OPENAI_KEY_STORAGE, key);
    } else {
      await SecureStore.setItemAsync(OPENAI_KEY_STORAGE, key);
    }
    console.log('[OpenAI] Key stored successfully');
  } catch (e) {
    console.log('[OpenAI] Failed to store key:', e);
  }
}

export async function setApiKey(key: string): Promise<void> {
  await storeKey(key);
}

export async function getApiKey(): Promise<string | null> {
  const stored = await getStoredKey();
  if (stored && stored.length > 10) return stored;
  if (ENV_KEY && ENV_KEY.length > 10) return ENV_KEY;
  return null;
}

export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return !!key && key.length > 10;
}

export async function sendChat(messages: ChatMessage[]): Promise<string> {
  const key = await getApiKey();
  if (!key) {
    throw new Error('No OpenAI API key configured. Please add your key in Profile settings.');
  }

  console.log('[OpenAI] Sending chat request with', messages.length, 'messages');
  console.log('[OpenAI] Using key prefix:', key.substring(0, 10) + '...');

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });
  } catch (networkError: unknown) {
    const msg = networkError instanceof Error ? networkError.message : String(networkError);
    console.log('[OpenAI] Network error:', msg);
    throw new Error('Network error — check your internet connection and try again.');
  }

  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch (_) {
      errorBody = 'Could not read error body';
    }
    console.log('[OpenAI] API error:', response.status, errorBody);
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI key in Profile settings.');
    }
    if (response.status === 429) {
      throw new Error('Rate limited. Please wait a moment and try again.');
    }
    if (response.status === 403) {
      throw new Error('Access denied. Your API key may not have access to this model.');
    }
    if (response.status >= 500) {
      throw new Error('OpenAI servers are having issues. Please try again shortly.');
    }
    throw new Error(`OpenAI API error (${response.status}): ${errorBody.substring(0, 200)}`);
  }

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = await response.json();
  } catch (_) {
    console.log('[OpenAI] Failed to parse response JSON');
    throw new Error('Received an invalid response from OpenAI. Please try again.');
  }

  const content = data.choices?.[0]?.message?.content ?? '';
  if (!content) {
    console.log('[OpenAI] Empty response from API');
    throw new Error('Received an empty response. Please try again.');
  }

  console.log('[OpenAI] Response received, length:', content.length);
  return content;
}
