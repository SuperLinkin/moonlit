// 🌙 Moonlit Tales - Story Reader Screen with Voice Narration
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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animations, TextShadows } from '../utils/theme';
import { RootStackParamList, Story } from '../types';
import {
  generateNarration,
  playNarration,
  pauseNarration,
  resumeNarration,
  stopNarration,
  isNarrationPlaying,
  getElevenLabsKey,
} from '../services/elevenlabs';
import {
  playAmbientMusic,
  stopAmbientMusic,
  pauseAmbientMusic,
  resumeAmbientMusic,
  setAmbientVolume,
  fadeAmbientVolume,
  AMBIENT_SOUNDS,
  AmbientSoundType,
} from '../services/ambientMusic';
import { toggleFavorite, getSettings } from '../services/storage';

const { width, height } = Dimensions.get('window');
const MAX_WIDTH = 428;

type StoryReaderRouteProp = RouteProp<RootStackParamList, 'StoryReader'>;
type StoryReaderNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoryReader'>;

const StoryReaderScreen: React.FC = () => {
  const navigation = useNavigation<StoryReaderNavigationProp>();
  const route = useRoute<StoryReaderRouteProp>();
  const { story } = route.params;

  // Narration state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(story.audioUrl || null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [narrationError, setNarrationError] = useState<string | null>(null);

  // Other state
  const [isFavorite, setIsFavorite] = useState(story.isFavorite);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [isAmbientLoading, setIsAmbientLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Split content into paragraphs
  const paragraphs = story.content.split('\n\n').filter((p) => p.trim());

  useEffect(() => {
    // Entry animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animations.slow,
      useNativeDriver: true,
    }).start();

    // Cleanup on unmount
    return () => {
      stopNarration();
      stopAmbientMusic();
    };
  }, []);

  // Generate narration if not already available
  const handleGenerateNarration = async () => {
    if (!getElevenLabsKey()) {
      setNarrationError('Please configure your ElevenLabs API key in Settings to enable voice narration.');
      return;
    }

    setIsGeneratingAudio(true);
    setNarrationError(null);

    try {
      const result = await generateNarration(story.content, 'narrator', true); // whisper mode for soothing voice

      if (result.success && result.audioUri) {
        setAudioUrl(result.audioUri);
        // Auto-play after generating
        await handlePlayNarration(result.audioUri);
      } else {
        setNarrationError(result.error || 'Failed to generate narration');
      }
    } catch (error) {
      setNarrationError('Failed to generate narration. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Play narration
  const handlePlayNarration = async (uri?: string) => {
    const audioUri = uri || audioUrl;
    if (!audioUri) {
      await handleGenerateNarration();
      return;
    }

    try {
      // Lower ambient music volume
      if (isAmbientPlaying) {
        await fadeAmbientVolume(0.1, 500);
      }

      await playNarration(audioUri, (status) => {
        if (status.isLoaded && status.durationMillis) {
          setPlaybackProgress(status.positionMillis / status.durationMillis);
        }
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPlaybackProgress(0);
          // Restore ambient volume
          if (isAmbientPlaying) {
            fadeAmbientVolume(0.3, 1000);
          }
        }
      });
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing narration:', error);
      setNarrationError('Failed to play narration');
    }
  };

  // Toggle play/pause
  const handleTogglePlayback = async () => {
    if (!audioUrl) {
      await handleGenerateNarration();
      return;
    }

    if (isPlaying) {
      await pauseNarration();
      setIsPlaying(false);
      // Restore ambient volume
      if (isAmbientPlaying) {
        await fadeAmbientVolume(0.3, 500);
      }
    } else {
      // Lower ambient when playing
      if (isAmbientPlaying) {
        await fadeAmbientVolume(0.1, 500);
      }
      await resumeNarration();
      setIsPlaying(true);
    }
  };

  const handleToggleFavorite = async () => {
    const newFavoriteState = await toggleFavorite(story.id);
    setIsFavorite(newFavoriteState);
  };

  const handleToggleAmbient = async () => {
    if (isAmbientLoading) return;

    if (isAmbientPlaying) {
      await pauseAmbientMusic();
      setIsAmbientPlaying(false);
    } else {
      setIsAmbientLoading(true);
      const settings = await getSettings();
      const volume = isPlaying ? 0.1 : settings.backgroundMusicVolume;
      await playAmbientMusic('moonlit_wind', volume, (status) => {
        if (status === 'playing') {
          setIsAmbientPlaying(true);
          setIsAmbientLoading(false);
        } else if (status === 'error') {
          setIsAmbientLoading(false);
          setIsAmbientPlaying(false);
        }
      });
    }
  };

  const handleGoHome = async () => {
    await stopNarration();
    await stopAmbientMusic();
    navigation.navigate('Home');
  };

  // Parallax moon
  const moonTranslateY = scrollY.interpolate({
    inputRange: [0, height],
    outputRange: [0, 80],
    extrapolate: 'clamp',
  });

  const moonOpacity = scrollY.interpolate({
    inputRange: [0, height * 0.3],
    outputRange: [0.4, 0.1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AnimatedBackground intensity="low">
        {/* Parallax Moon */}
        <Animated.View
          style={[
            styles.moonContainer,
            {
              opacity: moonOpacity,
              transform: [{ translateY: moonTranslateY }],
            },
          ]}
        >
          <View style={styles.moon} />
          <View style={styles.moonGlow} />
        </Animated.View>

        <View style={styles.outerContainer}>
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
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{story.title}</Text>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerStar}>✨</Text>
                <View style={styles.dividerLine} />
              </View>
            </View>

            {/* Voice Narration Card */}
            <View style={styles.narrationCard}>
              <View style={styles.narrationHeader}>
                <Text style={styles.narrationIcon}>🎧</Text>
                <View style={styles.narrationInfo}>
                  <Text style={styles.narrationTitle}>Voice Narration</Text>
                  <Text style={styles.narrationSubtitle}>
                    {isPlaying ? 'Now playing in a soothing voice...' :
                     audioUrl ? 'Ready to play' :
                     'Generate voice narration'}
                  </Text>
                </View>
              </View>

              {narrationError && (
                <Text style={styles.errorText}>{narrationError}</Text>
              )}

              {isGeneratingAudio ? (
                <View style={styles.generatingContainer}>
                  <ActivityIndicator size="large" color={Colors.starlight} />
                  <Text style={styles.generatingText}>
                    Creating soothing narration...
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={handleTogglePlayback}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isPlaying ? ['#5E3AA8', '#311C4B'] : ['#E6D8A8', '#C9B896']}
                    style={styles.playButtonGradient}
                  >
                    <Text style={styles.playButtonIcon}>
                      {isPlaying ? '⏸' : '▶'}
                    </Text>
                    <Text style={[
                      styles.playButtonText,
                      isPlaying && styles.playButtonTextPlaying
                    ]}>
                      {isPlaying ? 'Pause Story' : audioUrl ? 'Listen to Story' : 'Generate & Play'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Progress bar */}
              {(isPlaying || playbackProgress > 0) && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${playbackProgress * 100}%` }]} />
                </View>
              )}
            </View>

            {/* Ambient Music Toggle */}
            <TouchableOpacity
              style={styles.ambientToggle}
              onPress={handleToggleAmbient}
              activeOpacity={0.8}
              disabled={isAmbientLoading}
            >
              {isAmbientLoading ? (
                <ActivityIndicator size="small" color={Colors.lilac} style={{ marginRight: 8 }} />
              ) : (
                <Text style={styles.ambientIcon}>
                  {isAmbientPlaying ? '🎵' : '🔇'}
                </Text>
              )}
              <Text style={styles.ambientText}>
                {isAmbientLoading ? 'Generating...' : isAmbientPlaying ? 'Ambient Music On' : 'Play Ambient Music'}
              </Text>
            </TouchableOpacity>

            {/* Story Content */}
            <View style={styles.storyContent}>
              {paragraphs.map((paragraph, index) => (
                <Text key={index} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </View>

            {/* End Ornament */}
            <View style={styles.endOrnament}>
              <Text style={styles.endEmoji}>🌙</Text>
              <Text style={styles.endText}>Sweet dreams, my Princess</Text>
            </View>

            {/* Bottom Spacer */}
            <View style={styles.bottomSpacer} />
          </Animated.ScrollView>

          {/* Floating Controls */}
          <View style={styles.controlsContainer}>
            <View style={styles.controlsCard}>
              {/* Play/Pause */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleTogglePlayback}
                disabled={isGeneratingAudio}
              >
                <Text style={styles.controlIcon}>
                  {isGeneratingAudio ? '⏳' : isPlaying ? '⏸️' : '▶️'}
                </Text>
                <Text style={styles.controlLabel}>
                  {isGeneratingAudio ? 'Loading' : isPlaying ? 'Pause' : 'Play'}
                </Text>
              </TouchableOpacity>

              {/* Ambient */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleToggleAmbient}
                disabled={isAmbientLoading}
              >
                {isAmbientLoading ? (
                  <ActivityIndicator size="small" color={Colors.lilac} />
                ) : (
                  <Text style={styles.controlIcon}>
                    {isAmbientPlaying ? '🎵' : '🔇'}
                  </Text>
                )}
                <Text style={styles.controlLabel}>
                  {isAmbientLoading ? 'Loading' : 'Ambient'}
                </Text>
              </TouchableOpacity>

              {/* Favorite */}
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

              {/* Home */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleGoHome}
              >
                <Text style={styles.controlIcon}>🏰</Text>
                <Text style={styles.controlLabel}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  outerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  moonContainer: {
    position: 'absolute',
    top: 30,
    right: -60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moon: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.silver,
    opacity: 0.25,
  },
  moonGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(200, 166, 255, 0.08)',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 40 : 60,
    paddingBottom: 140,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    ...TextShadows.glow,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    width: 50,
    height: 1,
    backgroundColor: Colors.lilac,
    opacity: 0.4,
  },
  dividerStar: {
    marginHorizontal: 12,
    fontSize: 18,
  },
  // Narration Card
  narrationCard: {
    backgroundColor: 'rgba(49, 28, 75, 0.7)',
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  narrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  narrationIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  narrationInfo: {
    flex: 1,
  },
  narrationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  narrationSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  generatingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  generatingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  },
  playButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  playButtonIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  playButtonTextPlaying: {
    color: Colors.textPrimary,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(200, 166, 255, 0.2)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.starlight,
    borderRadius: 2,
  },
  // Ambient Toggle
  ambientToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(49, 28, 75, 0.5)',
    borderRadius: BorderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
    alignSelf: 'center',
  },
  ambientIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  ambientText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  // Story Content
  storyContent: {
    marginBottom: 32,
  },
  paragraph: {
    fontSize: 17,
    color: Colors.textPrimary,
    lineHeight: 17 * 1.9,
    marginBottom: 20,
    textAlign: 'left',
  },
  // End Ornament
  endOrnament: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  endEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  endText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 40,
  },
  // Floating Controls
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'web' ? 20 : 32,
  },
  controlsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(49, 28, 75, 0.95)',
    borderRadius: BorderRadius.xl,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    maxWidth: MAX_WIDTH - 48,
    alignSelf: 'center',
    width: '100%',
    ...Shadows.soft,
  },
  controlButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  controlIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  controlLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default StoryReaderScreen;
