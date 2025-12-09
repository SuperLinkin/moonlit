// 🌙 Moonlit Tales - Glowing Card Component with Fluid Animations
import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, BorderRadius, Shadows, Animations } from '../utils/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = 200;

interface GlowingCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  color?: string;
  onPress: () => void;
  style?: ViewStyle;
  index?: number;
}

const GlowingCard: React.FC<GlowingCardProps> = ({
  title,
  subtitle,
  icon,
  color = Colors.lilac,
  onPress,
  style,
  index = 0,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation - glide in
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: Animations.slow,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: Animations.slow,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: Animations.slow,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous subtle glow pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
          ],
        },
        style,
      ]}
    >
      {/* Outer Glow */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            backgroundColor: color,
            opacity: glowOpacity,
          },
        ]}
      />

      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        style={styles.touchable}
      >
        <LinearGradient
          colors={['rgba(94, 58, 168, 0.4)', 'rgba(49, 28, 75, 0.6)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Card Border Glow */}
          <View style={[styles.borderGlow, { borderColor: color }]} />

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color }]}>{subtitle}</Text>
            )}
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeCorner}>
            <View style={[styles.cornerLine, { backgroundColor: color }]} />
            <View style={[styles.cornerLine, styles.cornerLine2, { backgroundColor: color }]} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 10,
  },
  outerGlow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: BorderRadius.lg + 10,
    ...Shadows.glow,
  },
  touchable: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: 20,
    overflow: 'hidden',
  },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    opacity: 0.4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    opacity: 0.9,
  },
  decorativeCorner: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  cornerLine: {
    width: 30,
    height: 2,
    borderRadius: 1,
    opacity: 0.5,
  },
  cornerLine2: {
    marginTop: 4,
    width: 20,
    alignSelf: 'flex-end',
  },
});

export default GlowingCard;
