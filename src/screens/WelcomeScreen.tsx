// 🌙 Moonlit Tales - Welcome Screen
// "Good evening, Princess Pratima. A magical kingdom of stories, crafted by your love."
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AnimatedBackground from '../components/AnimatedBackground';
import MagicButton from '../components/MagicButton';
import { Colors, Typography, Spacing, Animations, TextShadows } from '../utils/theme';
import { RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  // Animation values
  const moonOpacity = useRef(new Animated.Value(0)).current;
  const moonScale = useRef(new Animated.Value(0.5)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Orchestrated entrance animations - slow and magical per PRD
    const animationSequence = Animated.sequence([
      // Moon appears first
      Animated.parallel([
        Animated.timing(moonOpacity, {
          toValue: 1,
          duration: Animations.verySlow,
          useNativeDriver: true,
        }),
        Animated.spring(moonScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Title glides in
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: Animations.slow,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: Animations.slow,
          useNativeDriver: true,
        }),
      ]),
      // Subtitle appears
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: Animations.slow,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateY, {
          toValue: 0,
          duration: Animations.slow,
          useNativeDriver: true,
        }),
      ]),
      // Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: Animations.slow,
        useNativeDriver: true,
      }),
      // Button appears
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: Animations.slow,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 0,
          duration: Animations.slow,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start();
  }, []);

  const handleEnterKingdom = () => {
    navigation.replace('Home');
  };

  return (
    <AnimatedBackground intensity="high">
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Decorative Moon */}
        <Animated.View
          style={[
            styles.moonContainer,
            {
              opacity: moonOpacity,
              transform: [{ scale: moonScale }],
            },
          ]}
        >
          <View style={styles.moon}>
            <View style={styles.moonGlow} />
            <Text style={styles.moonEmoji}>🌙</Text>
          </View>
        </Animated.View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title */}
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            Moonlit Tales
          </Animated.Text>

          {/* Subtitle - Greeting */}
          <Animated.View
            style={{
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleTranslateY }],
            }}
          >
            <Text style={styles.greeting}>Good evening,</Text>
            <Text style={styles.princessName}>Princess Pratima</Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.Text
            style={[
              styles.tagline,
              { opacity: taglineOpacity },
            ]}
          >
            A magical kingdom of stories,{'\n'}crafted by your love.
          </Animated.Text>
        </View>

        {/* Enter Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            },
          ]}
        >
          <MagicButton
            title="Enter the Kingdom"
            onPress={handleEnterKingdom}
            variant="gold"
            size="large"
            icon="✨"
          />
        </Animated.View>

        {/* Decorative Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>for my princess</Text>
          <View style={styles.footerLine} />
        </View>
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  moonContainer: {
    position: 'absolute',
    top: height * 0.1,
    alignItems: 'center',
  },
  moon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(200, 166, 255, 0.15)',
  },
  moonEmoji: {
    fontSize: 80,
  },
  content: {
    alignItems: 'center',
    marginTop: height * 0.15,
  },
  title: {
    fontSize: Typography.fontSize.hero,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    letterSpacing: 1,
    ...TextShadows.glow,
  },
  greeting: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  princessName: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '600',
    color: Colors.starlight,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    ...TextShadows.gold,
  },
  tagline: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.relaxed,
    fontStyle: 'italic',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: height * 0.18,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLine: {
    width: 40,
    height: 1,
    backgroundColor: Colors.textMuted,
    opacity: 0.3,
  },
  footerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    opacity: 0.5,
    marginHorizontal: Spacing.md,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default WelcomeScreen;
