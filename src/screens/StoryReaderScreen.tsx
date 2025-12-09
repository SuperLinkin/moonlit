// 🌙 Moonlit Tales - Story Reader Screen with Parallax Moon
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AnimatedBackground from '../components/AnimatedBackground';
import MagicButton from '../components/MagicButton';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animations } from '../utils/theme';
import { RootStackParamList, Story } from '../types';
import {
  playNarration,
  pauseNarration,
  resumeNarration,
  stopNarration,
  isNarrationPlaying,
} from '../services/elevenlabs';
import { toggleFavorite } from '../services/storage';

const { width, height } = Dimensions.get('window');

type StoryReaderRouteProp = RouteProp<RootStackParamList, 'StoryReader'>;
type StoryReaderNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoryReader'>;

const StoryReaderScreen: React.FC = () => {
  const navigation = useNavigation<StoryReaderNavigationProp>();
  const route = useRoute<StoryReaderRouteProp>();
  const { story } = route.params;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(story.isFavorite);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const paragraphAnims = useRef<Animated.Value[]>([]).current;

  // Split content into paragraphs
  const paragraphs = story.content.split('\n\n').filter((p) => p.trim());

  // Initialize paragraph animations
  useEffect(() => {
    paragraphs.forEach((_, index) => {
      if (!paragraphAnims[index]) {
        paragraphAnims[index] = new Animated.Value(0);
      }
    });

    // Entry animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animations.slow,
      useNativeDriver: true,
    }).start();

    // Stagger paragraph fade-ins
    const animations = paragraphAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: Animations.slow,
        delay: index * 200,
        useNativeDriver: true,
      })
    );
    Animated.stagger(150, animations).start();

    // Cleanup on unmount
    return () => {
      stopNarration();
    };
  }, []);

  // Parallax moon position based on scroll
  const moonTranslateY = scrollY.interpolate({
    inputRange: [0, height],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  const moonScale = scrollY.interpolate({
    inputRange: [0, height],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const moonOpacity = scrollY.interpolate({
    inputRange: [0, height * 0.5],
    outputRange: [0.4, 0.15],
    extrapolate: 'clamp',
  });

  const handlePlayPause = async () => {
    if (!story.audioUrl) {
      return;
    }

    if (isPlaying) {
      await pauseNarration();
      setIsPlaying(false);
    } else {
      if (playbackProgress === 0) {
        await playNarration(story.audioUrl, (status) => {
          if (status.isLoaded) {
            setPlaybackProgress(status.positionMillis / status.durationMillis);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackProgress(0);
            }
          }
        });
      } else {
        await resumeNarration();
      }
      setIsPlaying(true);
    }
  };

  const handleToggleFavorite = async () => {
    const newFavoriteState = await toggleFavorite(story.id);
    setIsFavorite(newFavoriteState);
  };

  const handleGoHome = async () => {
    await stopNarration();
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AnimatedBackground intensity="medium">
        {/* Parallax Moon */}
        <Animated.View
          style={[
            styles.moonContainer,
            {
              opacity: moonOpacity,
              transform: [
                { translateY: moonTranslateY },
                { scale: moonScale },
              ],
            },
          ]}
        >
          <View style={styles.moon} />
          <View style={styles.moonGlow} />
        </Animated.View>

        {/* Story Content */}
        <Animated.ScrollView
          style={[styles.scrollView, { opacity: fadeAnim }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Story Title */}
          <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
            <Text style={styles.title}>{story.title}</Text>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerStar}>✨</Text>
              <View style={styles.dividerLine} />
            </View>
          </Animated.View>

          {/* Story Paragraphs */}
          {paragraphs.map((paragraph, index) => (
            <Animated.View
              key={index}
              style={[
                styles.paragraphContainer,
                {
                  opacity: paragraphAnims[index] || 0,
                  transform: [
                    {
                      translateY: (paragraphAnims[index] || new Animated.Value(0)).interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.paragraph}>{paragraph}</Text>
            </Animated.View>
          ))}

          {/* End Ornament */}
          <View style={styles.endOrnament}>
            <Text style={styles.endEmoji}>🌙</Text>
            <Text style={styles.endText}>Sweet dreams, my Princess</Text>
          </View>

          {/* Spacer for controls */}
          <View style={styles.bottomSpacer} />
        </Animated.ScrollView>

        {/* Floating Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlsCard}>
            {/* Play/Pause Button */}
            {story.audioUrl && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePlayPause}
              >
                <Text style={styles.controlIcon}>
                  {isPlaying ? '⏸️' : '▶️'}
                </Text>
                <Text style={styles.controlLabel}>
                  {isPlaying ? 'Pause' : 'Listen'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Favorite Button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleToggleFavorite}
            >
              <Text style={styles.controlIcon}>
                {isFavorite ? '❤️' : '🤍'}
              </Text>
              <Text style={styles.controlLabel}>
                {isFavorite ? 'Loved' : 'Save'}
              </Text>
            </TouchableOpacity>

            {/* Home Button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleGoHome}
            >
              <Text style={styles.controlIcon}>🏰</Text>
              <Text style={styles.controlLabel}>Home</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar (if playing) */}
          {story.audioUrl && playbackProgress > 0 && (
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${playbackProgress * 100}%` },
                ]}
              />
            </View>
          )}
        </View>
      </AnimatedBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  moonContainer: {
    position: 'absolute',
    top: 50,
    right: -50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moon: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.silver,
    opacity: 0.3,
  },
  moonGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(200, 166, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + 40,
    paddingBottom: 200,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.title,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    textShadowColor: 'rgba(200, 166, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    width: 60,
    height: 1,
    backgroundColor: Colors.lilac,
    opacity: 0.4,
  },
  dividerStar: {
    marginHorizontal: Spacing.md,
    fontSize: 20,
  },
  paragraphContainer: {
    marginBottom: Spacing.lg,
  },
  paragraph: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.story,
    textAlign: 'left',
    letterSpacing: 0.3,
  },
  endOrnament: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  endEmoji: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  endText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 100,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  controlsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(49, 28, 75, 0.95)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadows.soft,
  },
  controlButton: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  controlIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  controlLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(200, 166, 255, 0.2)',
    borderRadius: 1.5,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.lilac,
    borderRadius: 1.5,
  },
});

export default StoryReaderScreen;
