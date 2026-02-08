export const BREAKPOINTS = {
  mobile: '640px',
  tablet: '860px',
  desktop: '1080px',
} as const;

export const CARD_COUNT_MIN = 4;
export const CARD_COUNT_MAX = 100;

export const COUNTDOWN_SECONDS_MIN = 4;
export const COUNTDOWN_SECONDS_MAX = 120;

export const FLIP_BACK_DELAY_MS_MIN = 0;

export const DEFAULT_CARD_COUNT = 8;
export const DEFAULT_COUNTDOWN = 90;
export const DEFAULT_FLIP_BACK_DELAY_MS = 500;

export interface DefaultSettingsFormValues {
  userName: string;
  cardCount: number;
  countdownSeconds: number;
  flipBackDelayMs: number;
  maxBadGuesses: string;
}

export const DEFAULT_SETTINGS_FORM_VALUES: DefaultSettingsFormValues = {
  userName: '',
  cardCount: DEFAULT_CARD_COUNT,
  countdownSeconds: DEFAULT_COUNTDOWN,
  flipBackDelayMs: DEFAULT_FLIP_BACK_DELAY_MS,
  maxBadGuesses: '',
};

export const MAX_BAD_GUESSES_MIN = 1;

export const FLIP_ANIMATION_MS = 400;

export interface Preset {
  id: string;
  label: string;
  cardCount: number;
  countdownSeconds: number;
  flipBackDelayMs: number;
  maxBadGuesses: string;
}

export const PRESETS = [
  { id: 'easy', label: 'Easy', cardCount: 8, countdownSeconds: 90, flipBackDelayMs: 800, maxBadGuesses: '' },
  { id: 'medium', label: 'Medium', cardCount: 16, countdownSeconds: 60, flipBackDelayMs: 500, maxBadGuesses: '12' },
  { id: 'hard', label: 'Hard', cardCount: 24, countdownSeconds: 45, flipBackDelayMs: 300, maxBadGuesses: '6' },
] as Preset[];
