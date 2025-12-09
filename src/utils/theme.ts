// 🌙 Moonlit Tales - Fluid Moonlight Design System
// Color palette and design tokens for the magical UI
import { Platform } from 'react-native';

export const Colors = {
  // Primary Colors
  primary: '#311C4B',           // Deep Moonlit Purple
  primaryDark: '#1A0A2A',       // Midnight Blue
  primaryLight: '#5E3AA8',      // Amethyst

  // Accents
  starlight: '#E6D8A8',         // Starlight Gold
  lilac: '#C8A6FF',             // Soft Lilac
  silver: '#DDE3F3',            // Misty Silver

  // Gradient Colors
  gradientStart: '#1A0A2A',     // Midnight Blue
  gradientMiddle: '#311C4B',    // Deep Purple
  gradientEnd: '#5E3AA8',       // Amethyst

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#C8A6FF',
  textMuted: '#9B8AAD',

  // UI Colors
  cardBackground: 'rgba(49, 28, 75, 0.6)',
  cardBorder: 'rgba(200, 166, 255, 0.3)',
  overlay: 'rgba(26, 10, 42, 0.8)',

  // Status Colors
  success: '#7DD3A8',
  error: '#FF8A8A',
  warning: '#FFD699',
};

export const Gradients = {
  background: ['#1A0A2A', '#311C4B', '#1A0A2A'],
  card: ['rgba(94, 58, 168, 0.3)', 'rgba(49, 28, 75, 0.5)'],
  button: ['#5E3AA8', '#311C4B'],
  buttonGold: ['#E6D8A8', '#C9B896'],
  shimmer: ['transparent', 'rgba(230, 216, 168, 0.3)', 'transparent'],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const Typography = {
  // Font families (will use system fonts with custom loaded fonts)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    serif: 'serif',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    title: 36,
    hero: 48,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
    story: 2.0,
  },
};

// Web-compatible shadows using boxShadow
const createShadow = (color: string, blur: number, spread: number = 0) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0 0 ${blur}px ${spread}px ${color}`,
    };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: blur / 2,
    elevation: Math.min(blur / 3, 10),
  };
};

export const Shadows = {
  soft: Platform.OS === 'web'
    ? { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
      },
  glow: Platform.OS === 'web'
    ? { boxShadow: '0 0 20px rgba(200, 166, 255, 0.5)' }
    : {
        shadowColor: '#C8A6FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 8,
      },
  gold: Platform.OS === 'web'
    ? { boxShadow: '0 0 16px rgba(230, 216, 168, 0.6)' }
    : {
        shadowColor: '#E6D8A8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 6,
      },
};

// Web-compatible text shadow
export const TextShadows = {
  glow: Platform.OS === 'web'
    ? { textShadow: '0 0 20px rgba(200, 166, 255, 0.5)' }
    : {
        textShadowColor: 'rgba(200, 166, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
      },
  gold: Platform.OS === 'web'
    ? { textShadow: '0 0 15px rgba(230, 216, 168, 0.5)' }
    : {
        textShadowColor: 'rgba(230, 216, 168, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
      },
  subtle: Platform.OS === 'web'
    ? { textShadow: '0 0 10px rgba(200, 166, 255, 0.3)' }
    : {
        textShadowColor: 'rgba(200, 166, 255, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
      },
};

// Helper to create custom text shadow
export const createTextShadow = (color: string, radius: number) => {
  if (Platform.OS === 'web') {
    return { textShadow: `0 0 ${radius}px ${color}` };
  }
  return {
    textShadowColor: color,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: radius,
  };
};

// Animation durations (in milliseconds) - slow and dreamy per PRD
export const Animations = {
  fast: 300,
  normal: 500,
  slow: 800,
  verySlow: 1200,
  parallax: 1500,
};

// Easing curves for smooth animations
export const Easing = {
  smooth: [0.4, 0.0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  gentle: [0.25, 0.1, 0.25, 1],
};
