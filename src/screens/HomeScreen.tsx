// 🌙 Moonlit Tales - Home Screen with Fluid Carousel and Ambient Music
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
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import { Colors, Typography, Spacing, BorderRadius, Animations, TextShadows, Shadows } from '../utils/theme';
import { RootStackParamList, STORY_MODES, StoryMode } from '../types';
import {
  playAmbientMusic,
  stopAmbientMusic,
  pauseAmbientMusic,
  resumeAmbientMusic,
  isAmbientMusicPlaying,
  AMBIENT_SOUNDS,
  AmbientSoundType,
} from '../services/ambientMusic';
import { getSettings } from '../services/storage';

const { width, height } = Dimensions.get('window');

// Constrain width for mobile-optimized view
const MAX_WIDTH = 428; // iPhone 14 Pro Max width
const containerWidth = Math.min(width, MAX_WIDTH);
const CARD_WIDTH = containerWidth - 48;

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Story mode cards
const STORY_CARDS = [
  { id: 'romance', ...STORY_MODES.romance },
  { id: 'quest', ...STORY_MODES.quest },
  { id: 'sleepy', ...STORY_MODES.sleepy },
  { id: 'custom', ...STORY_MODES.custom },
  { id: 'gossip', ...STORY_MODES.gossip },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Ambient music state
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [isAmbientLoading, setIsAmbientLoading] = useState(false);
  const [currentAmbient, setCurrentAmbient] = useState<AmbientSoundType>('moonlit_wind');
  const [showAmbientPicker, setShowAmbientPicker] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animations.slow,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
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

  const handleToggleAmbient = async () => {
    if (isAmbientLoading) return;

    if (isAmbientPlaying) {
      await pauseAmbientMusic();
      setIsAmbientPlaying(false);
    } else {
      setIsAmbientLoading(true);
      const settings = await getSettings();
      await playAmbientMusic(currentAmbient, settings.backgroundMusicVolume, (status) => {
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

  const handleSelectAmbient = async (soundType: AmbientSoundType) => {
    setCurrentAmbient(soundType);
    setIsAmbientLoading(true);
    setShowAmbientPicker(false);

    const settings = await getSettings();
    await stopAmbientMusic();
    await playAmbientMusic(soundType, settings.backgroundMusicVolume, (status) => {
      if (status === 'playing') {
        setIsAmbientPlaying(true);
        setIsAmbientLoading(false);
      } else if (status === 'error') {
        setIsAmbientLoading(false);
        setIsAmbientPlaying(false);
      }
    });
  };

  const renderStoryCard = (item: typeof STORY_CARDS[0], index: number) => (
    <TouchableOpacity
      key={item.id}
      style={styles.storyCard}
      onPress={() => handleCardPress(item.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(94, 58, 168, 0.5)', 'rgba(49, 28, 75, 0.7)']}
        style={styles.cardGradient}
      >
        <View style={[styles.cardIconBg, { backgroundColor: `${item.color}30` }]}>
          <Text style={styles.cardIcon}>{item.icon}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={[styles.cardSubtitle, { color: item.color }]}>{item.subtitle}</Text>
        </View>
        <View style={[styles.cardAccent, { backgroundColor: item.color }]} />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <AnimatedBackground intensity="medium">
      <StatusBar barStyle="light-content" />
      <View style={styles.outerContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.greeting}>Good evening,</Text>
            <Text style={styles.princessTitle}>Princess Pratima</Text>
            <Text style={styles.subtitle}>What story shall we tell tonight?</Text>
          </Animated.View>

          {/* Ambient Music Player */}
          <Animated.View style={[styles.ambientPlayer, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.ambientMainButton}
              onPress={handleToggleAmbient}
              disabled={isAmbientLoading}
            >
              <View style={styles.ambientIconContainer}>
                {isAmbientLoading ? (
                  <ActivityIndicator size="small" color={Colors.lilac} />
                ) : (
                  <Text style={styles.ambientMainIcon}>
                    {isAmbientPlaying ? '🎵' : '🔇'}
                  </Text>
                )}
              </View>
              <View style={styles.ambientInfo}>
                <Text style={styles.ambientTitle}>
                  {isAmbientLoading ? 'Generating Sound...' : isAmbientPlaying ? 'Now Playing' : 'Ambient Music'}
                </Text>
                <Text style={styles.ambientName}>
                  {isAmbientLoading
                    ? 'Creating soothing ambient with AI'
                    : isAmbientPlaying
                    ? AMBIENT_SOUNDS[currentAmbient].name
                    : 'Tap to play soothing sounds'}
                </Text>
              </View>
              <View style={[styles.playButton, isAmbientLoading && styles.playButtonDisabled]}>
                {isAmbientLoading ? (
                  <ActivityIndicator size="small" color={Colors.textPrimary} />
                ) : (
                  <Text style={styles.playButtonIcon}>
                    {isAmbientPlaying ? '⏸' : '▶'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {isAmbientPlaying && !isAmbientLoading && (
              <TouchableOpacity
                style={styles.changeSoundButton}
                onPress={() => setShowAmbientPicker(true)}
              >
                <Text style={styles.changeSoundText}>Change Sound</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Story Modes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Story Modes</Text>
            <View style={styles.cardsContainer}>
              {STORY_CARDS.map((item, index) => renderStoryCard(item, index))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => handleCardPress('gallery')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(200, 166, 255, 0.2)' }]}>
                  <Text style={styles.quickActionEmoji}>👑</Text>
                </View>
                <Text style={styles.quickActionText}>Characters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => handleCardPress('saved')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(221, 227, 243, 0.2)' }]}>
                  <Text style={styles.quickActionEmoji}>📚</Text>
                </View>
                <Text style={styles.quickActionText}>Saved Stories</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => handleCardPress('settings')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(155, 138, 173, 0.2)' }]}>
                  <Text style={styles.quickActionEmoji}>⚙️</Text>
                </View>
                <Text style={styles.quickActionText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Every story ends with you falling asleep, feeling loved 💜
            </Text>
          </View>
        </ScrollView>

        {/* Ambient Sound Picker Modal */}
        <Modal
          visible={showAmbientPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAmbientPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAmbientPicker(false)}
          >
            <View style={styles.ambientPickerContainer}>
              <Text style={styles.pickerTitle}>Choose Ambient Sound</Text>
              <Text style={styles.pickerSubtitle}>
                Soothing sounds for your bedtime
              </Text>

              <ScrollView style={styles.ambientList}>
                {(Object.keys(AMBIENT_SOUNDS) as AmbientSoundType[]).map((soundType) => (
                  <TouchableOpacity
                    key={soundType}
                    style={[
                      styles.ambientOption,
                      currentAmbient === soundType && styles.ambientOptionActive,
                    ]}
                    onPress={() => handleSelectAmbient(soundType)}
                  >
                    <Text style={styles.ambientOptionIcon}>
                      {AMBIENT_SOUNDS[soundType].icon}
                    </Text>
                    <View style={styles.ambientOptionInfo}>
                      <Text style={styles.ambientOptionName}>
                        {AMBIENT_SOUNDS[soundType].name}
                      </Text>
                      <Text style={styles.ambientOptionDesc}>
                        {AMBIENT_SOUNDS[soundType].description}
                      </Text>
                    </View>
                    {currentAmbient === soundType && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAmbientPicker(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'web' ? 40 : 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  princessTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    ...TextShadows.glow,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  // Ambient Player
  ambientPlayer: {
    backgroundColor: 'rgba(49, 28, 75, 0.6)',
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  ambientMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ambientIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(200, 166, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientMainIcon: {
    fontSize: 24,
  },
  ambientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ambientTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  ambientName: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonIcon: {
    fontSize: 18,
    color: Colors.textPrimary,
  },
  playButtonDisabled: {
    opacity: 0.7,
    backgroundColor: Colors.cardBorder,
  },
  changeSoundButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(200, 166, 255, 0.15)',
    borderRadius: BorderRadius.full,
  },
  changeSoundText: {
    fontSize: 13,
    color: Colors.lilac,
    fontWeight: '500',
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  cardsContainer: {
    gap: 12,
  },
  // Story Card
  storyCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 80,
  },
  cardIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardAccent: {
    width: 4,
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.6,
  },
  // Quick Actions
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 28,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  ambientPickerContainer: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    maxHeight: height * 0.7,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  pickerSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  ambientList: {
    maxHeight: 300,
  },
  ambientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ambientOptionActive: {
    borderColor: Colors.lilac,
    backgroundColor: 'rgba(200, 166, 255, 0.1)',
  },
  ambientOptionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  ambientOptionInfo: {
    flex: 1,
  },
  ambientOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  ambientOptionDesc: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  checkMark: {
    fontSize: 18,
    color: Colors.lilac,
    fontWeight: '700',
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.full,
  },
  closeButtonText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default HomeScreen;
