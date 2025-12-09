// 🌙 Moonlit Tales - Home Screen with Fluid Carousel
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AnimatedBackground from '../components/AnimatedBackground';
import GlowingCard from '../components/GlowingCard';
import { Colors, Typography, Spacing, Animations } from '../utils/theme';
import { RootStackParamList, STORY_MODES, StoryMode } from '../types';

const { width, height } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Menu items configuration
const MENU_ITEMS = [
  { id: 'romance', ...STORY_MODES.romance },
  { id: 'quest', ...STORY_MODES.quest },
  { id: 'sleepy', ...STORY_MODES.sleepy },
  { id: 'custom', ...STORY_MODES.custom },
  { id: 'gossip', ...STORY_MODES.gossip },
  {
    id: 'gallery',
    title: 'Character Gallery',
    subtitle: 'Meet the Kingdom',
    icon: '👑',
    color: '#C8A6FF',
    description: 'Explore the royal profiles and the chaotic court',
  },
  {
    id: 'saved',
    title: 'Saved Stories',
    subtitle: 'Your Library',
    icon: '📚',
    color: '#DDE3F3',
    description: 'Revisit your favorite tales from the kingdom',
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Configure',
    icon: '⚙️',
    color: '#9B8AAD',
    description: 'API keys, voice settings, and preferences',
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const scrollX = useRef(new Animated.Value(0)).current;

  // Header animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Animate header on mount
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: Animations.slow,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: Animations.slow,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCardPress = (itemId: string) => {
    if (['romance', 'quest', 'sleepy', 'custom', 'gossip'].includes(itemId)) {
      navigation.navigate('StoryGenerator', { mode: itemId as StoryMode });
    } else if (itemId === 'gallery') {
      navigation.navigate('CharacterGallery');
    } else if (itemId === 'saved') {
      navigation.navigate('SavedStories');
    } else if (itemId === 'settings') {
      navigation.navigate('Settings');
    }
  };

  return (
    <AnimatedBackground intensity="medium">
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.princessTitle}>Princess Pratima</Text>
          <Text style={styles.subtitle}>What story shall we tell tonight?</Text>
        </Animated.View>

        {/* Fluid Carousel */}
        <View style={styles.carouselContainer}>
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled={false}
            snapToInterval={width * 0.75 + 20}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {MENU_ITEMS.map((item, index) => (
              <GlowingCard
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                color={item.color}
                onPress={() => handleCardPress(item.id)}
                index={index}
              />
            ))}
          </Animated.ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleCardPress('romance')}
          >
            <Text style={styles.quickActionIcon}>💜</Text>
            <Text style={styles.quickActionText}>Quick Romance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleCardPress('sleepy')}
          >
            <Text style={styles.quickActionIcon}>😴</Text>
            <Text style={styles.quickActionText}>Sleepy Tale</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleCardPress('saved')}
          >
            <Text style={styles.quickActionIcon}>⭐</Text>
            <Text style={styles.quickActionText}>Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Message */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Every story ends with you falling asleep, feeling loved 💜
          </Text>
        </View>
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.xxl + 20,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  princessTitle: {
    fontSize: Typography.fontSize.title,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(200, 166, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  carouselContent: {
    paddingHorizontal: width * 0.125 - 10,
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  quickActionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
});

export default HomeScreen;
