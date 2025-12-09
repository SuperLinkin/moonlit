// 🌙 Moonlit Tales - Magic Button Component
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Typography, BorderRadius, Shadows, Animations } from '../utils/theme';

interface MagicButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gold';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

const MagicButton: React.FC<MagicButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: Animations.fast,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: Animations.normal,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'gold':
        return Gradients.buttonGold;
      case 'secondary':
        return ['transparent', 'transparent'];
      default:
        return Gradients.button;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 10, paddingHorizontal: 20 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 40 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 32 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return Typography.fontSize.sm;
      case 'large':
        return Typography.fontSize.lg;
      default:
        return Typography.fontSize.md;
    }
  };

  const getShadowStyle = () => {
    if (variant === 'gold') return Shadows.gold;
    if (variant === 'secondary') return {};
    return Shadows.glow;
  };

  const glowStyle = {
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0.9],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 30],
    }),
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getShadowStyle(),
        glowStyle,
        { transform: [{ scale: scaleAnim }] },
        disabled && styles.disabled,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={getGradientColors() as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            getSizeStyles(),
            variant === 'secondary' && styles.secondaryBorder,
          ]}
        >
          <Text
            style={[
              styles.text,
              { fontSize: getTextSize() },
              variant === 'gold' && styles.goldText,
              textStyle,
            ]}
          >
            {icon && `${icon} `}
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  goldText: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  secondaryBorder: {
    borderWidth: 1.5,
    borderColor: Colors.lilac,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default MagicButton;
