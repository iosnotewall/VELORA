import { useCallback, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';

export interface CustomProduct {
  id: string;
  name: string;
  tagline: string;
  color: string;
}

export interface DailyScore {
  date: string;
  energy: number;
  sleep: number;
  mood: number;
  goalScores?: Record<string, number>;
}

export type NotificationMode = 'specific' | 'random' | 'hourly';

export interface OnboardingSimData {
  scores: Record<string, number>;
  choices: Record<string, string>;
  completedAt: string;
}

export interface AppState {
  goal: string;
  gapScore: number;
  products: string[];
  customProducts: CustomProduct[];
  routineTime: string;
  userName: string;
  gender: string;
  currentStreak: number;
  longestStreak: number;
  totalDaysTaken: number;
  lastCheckedIn: string | null;
  checkInHistory: string[];
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  frequency: number;
  friction: string;
  energyLevel: number;
  commitmentLevel: string;
  missedDoses: number;
  missedDosesPct: number;
  dailyScores: DailyScore[];
  streakShieldAvailable: boolean;
  streakShieldUsedDate: string | null;
  notificationMode: NotificationMode;
  notificationTimes: string[];
  onboardingSimData: OnboardingSimData | null;
}

const DEFAULT_STATE: AppState = {
  goal: '',
  gapScore: 0,
  products: [],
  customProducts: [],
  routineTime: '08:00',
  userName: '',
  gender: '',
  currentStreak: 0,
  longestStreak: 0,
  totalDaysTaken: 0,
  lastCheckedIn: null,
  checkInHistory: [],
  onboardingComplete: false,
  notificationsEnabled: false,
  frequency: 0,
  friction: '',
  energyLevel: 0,
  commitmentLevel: '',
  missedDoses: 0,
  missedDosesPct: 0,
  dailyScores: [],
  streakShieldAvailable: true,
  streakShieldUsedDate: null,
  notificationMode: 'specific',
  notificationTimes: ['08:00'],
  onboardingSimData: null,
};

const STORAGE_KEY = 'ivb_app_state';

export const [AppStateProvider, useAppState] = createContextHook(() => {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const queryClient = useQueryClient();

  const stateQuery = useQuery({
    queryKey: ['appState'],
    queryFn: async () => {
      console.log('[AppState] Loading from AsyncStorage...');
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = { ...DEFAULT_STATE, ...JSON.parse(stored) } as AppState;
          console.log('[AppState] Loaded state, onboardingComplete:', parsed.onboardingComplete);
          return parsed;
        } catch (e) {
          console.log('[AppState] Failed to parse stored state:', e);
          return DEFAULT_STATE;
        }
      }
      console.log('[AppState] No stored state found, using defaults');
      return DEFAULT_STATE;
    },
    staleTime: Infinity,
  });

  const saveMutation = useMutation({
    mutationFn: async (newState: AppState) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    },
  });

  useEffect(() => {
    if (stateQuery.data) {
      setState(stateQuery.data);
    }
  }, [stateQuery.data]);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => {
      const next = { ...prev, ...updates };
      saveMutation.mutate(next);
      return next;
    });
  }, [saveMutation]);

  const checkIn = useCallback((scores?: { energy: number; sleep: number; mood: number }) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      if (prev.lastCheckedIn === today) return prev;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const isConsecutive = prev.lastCheckedIn === yesterdayStr;
      const newStreak = isConsecutive ? prev.currentStreak + 1 : 1;
      const newLongest = Math.max(prev.longestStreak, newStreak);

      const newDailyScores = scores
        ? [...prev.dailyScores, { date: today, ...scores }]
        : prev.dailyScores;

      const next: AppState = {
        ...prev,
        lastCheckedIn: today,
        checkInHistory: [...prev.checkInHistory, today],
        currentStreak: newStreak,
        longestStreak: newLongest,
        totalDaysTaken: prev.totalDaysTaken + 1,
        dailyScores: newDailyScores,
      };
      saveMutation.mutate(next);
      return next;
    });
  }, [saveMutation]);

  const isCheckedInToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.lastCheckedIn === today;
  }, [state.lastCheckedIn]);

  const currentDay = useMemo(() => {
    if (state.checkInHistory.length === 0) return 1;
    return state.totalDaysTaken + (isCheckedInToday ? 0 : 1);
  }, [state.totalDaysTaken, state.checkInHistory.length, isCheckedInToday]);

  return {
    ...state,
    isLoading: stateQuery.isLoading,
    updateState,
    checkIn,
    isCheckedInToday,
    currentDay,
  };
});
