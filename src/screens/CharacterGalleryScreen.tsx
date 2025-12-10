// 🌙 Moonlit Tales - Character Gallery Screen with Flip Cards
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import AddCharacterModal from '../components/AddCharacterModal';
import MagicButton from '../components/MagicButton';
import { Colors, Typography, Spacing, BorderRadius, Animations } from '../utils/theme';
import { RootStackParamList, CHARACTERS, Character } from '../types';
import { generateCharacterImage, getCachedImage, getGeminiKey } from '../services/gemini';
import { getCustomCharacters, deleteCustomCharacter } from '../services/storage';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - Spacing.lg * 3) / 2; // Two cards per row with gap

type CharacterGalleryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CharacterGallery'>;

interface FlipCardProps {
  character: Character;
  index: number;
  generatedImage: string | null;
  isGenerating: boolean;
  onGenerateImage: () => void;
  hasApiKey: boolean;
  onDelete?: () => void;
  onPlayThemeSong?: () => void;
  isPlayingTheme?: boolean;
}

const FlipCard: React.FC<FlipCardProps> = ({
  character,
  index,
  generatedImage,
  isGenerating,
  onGenerateImage,
  hasApiKey,
  onDelete,
  onPlayThemeSong,
  isPlayingTheme,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const isRoyal = character.type === 'royal';
  const isCustom = character.isCustom || character.type === 'custom';
  const accentColor = isRoyal ? Colors.starlight : isCustom ? '#7DD3A8' : Colors.lilac;
  const gradientColors = isRoyal
    ? ['rgba(230, 216, 168, 0.25)', 'rgba(200, 166, 255, 0.15)']
    : isCustom
    ? ['rgba(125, 211, 168, 0.2)', 'rgba(94, 168, 120, 0.15)']
    : ['rgba(200, 166, 255, 0.2)', 'rgba(94, 58, 168, 0.15)'];

  return (
    <Animated.View
      style={[
        styles.flipCardContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleFlip}
        style={styles.flipCardTouchable}
      >
        {/* Front of Card - Image/Emoji */}
        <Animated.View style={[styles.flipCardFace, styles.flipCardFront, frontAnimatedStyle]}>
          <LinearGradient
            colors={gradientColors as any}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Type Badge */}
            <View style={[styles.typeBadge, { backgroundColor: `${accentColor}30` }]}>
              <Text style={[styles.typeBadgeText, { color: accentColor }]}>
                {isRoyal ? '👑' : isCustom ? '🌟' : '✨'}
              </Text>
            </View>

            {/* Theme Song Badge */}
            {character.themeSong && (
              <View style={[styles.themeBadge, { backgroundColor: `${accentColor}30` }]}>
                <Text style={styles.themeBadgeText}>🎵</Text>
              </View>
            )}

            {/* Character Image or Emoji */}
            <View style={styles.imageWrapper}>
              {generatedImage ? (
                <Image
                  source={{ uri: generatedImage }}
                  style={styles.characterImage}
                  resizeMode="cover"
                />
              ) : isGenerating ? (
                <View style={styles.loadingWrapper}>
                  <ActivityIndicator size="large" color={accentColor} />
                  <Text style={styles.loadingText}>Creating...</Text>
                </View>
              ) : (
                <View style={styles.emojiWrapper}>
                  <Text style={styles.emoji}>{character.emoji}</Text>
                </View>
              )}
            </View>

            {/* Character Name */}
            <Text style={styles.frontName} numberOfLines={1}>
              {character.name}
            </Text>
            <Text style={[styles.frontTitle, { color: accentColor }]} numberOfLines={1}>
              {character.title}
            </Text>

            {/* Tap hint */}
            <Text style={styles.tapHint}>Tap to reveal</Text>

            {/* Decorative glow for royal */}
            {isRoyal && <View style={styles.royalGlow} />}
          </LinearGradient>
        </Animated.View>

        {/* Back of Card - Details */}
        <Animated.View style={[styles.flipCardFace, styles.flipCardBack, backAnimatedStyle]}>
          <LinearGradient
            colors={['rgba(26, 10, 42, 0.95)', 'rgba(49, 28, 75, 0.95)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header with emoji */}
            <View style={styles.backHeader}>
              <Text style={styles.backEmoji}>{character.emoji}</Text>
              <View style={styles.backTitleContainer}>
                <Text style={styles.backName}>{character.name}</Text>
                <Text style={[styles.backTitle, { color: accentColor }]}>
                  {character.title}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.backDescription} numberOfLines={3}>
              {character.description}
            </Text>

            {/* Personality */}
            {character.personality && (
              <View style={[styles.personalityBox, { borderColor: `${accentColor}40` }]}>
                <Text style={[styles.personalityLabel, { color: accentColor }]}>
                  Personality
                </Text>
                <Text style={styles.personalityText} numberOfLines={2}>
                  {character.personality}
                </Text>
              </View>
            )}

            {/* Action buttons row */}
            <View style={styles.actionButtonsRow}>
              {/* Generate button if no image */}
              {hasApiKey && !generatedImage && !isGenerating && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: `${accentColor}30` }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onGenerateImage();
                  }}
                >
                  <Text style={[styles.actionButtonText, { color: accentColor }]}>
                    ✨ Portrait
                  </Text>
                </TouchableOpacity>
              )}

              {/* Theme Song button */}
              {character.themeSong && onPlayThemeSong && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: isPlayingTheme ? `${accentColor}50` : `${accentColor}30` }
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onPlayThemeSong();
                  }}
                >
                  <Text style={[styles.actionButtonText, { color: accentColor }]}>
                    {isPlayingTheme ? '⏹️ Stop' : '🎵 Theme'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Delete button for custom characters */}
              {isCustom && onDelete && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: 'rgba(255, 100, 100, 0.2)' }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Text style={[styles.actionButtonText, { color: '#FF6464' }]}>
                    🗑️
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tap to flip back */}
            <Text style={styles.tapHint}>Tap to flip</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CharacterGalleryScreen: React.FC = () => {
  const navigation = useNavigation<CharacterGalleryNavigationProp>();
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [hasApiKey, setHasApiKey] = useState(false);
  const [customCharacters, setCustomCharacters] = useState<Character[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [playingThemeId, setPlayingThemeId] = useState<string | null>(null);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const loadCustomCharacters = async () => {
    const characters = await getCustomCharacters();
    setCustomCharacters(characters);
  };

  useFocusEffect(
    useCallback(() => {
      loadCustomCharacters();
    }, [])
  );

  useEffect(() => {
    // Check if API key is configured
    const apiKey = getGeminiKey();
    setHasApiKey(!!apiKey);

    // Load any cached images
    CHARACTERS.forEach(character => {
      const cached = getCachedImage(character.id);
      if (cached) {
        setGeneratedImages(prev => ({ ...prev, [character.id]: cached }));
      }
    });

    // Animate header
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGenerateImage = async (characterId: string) => {
    if (generatingIds.has(characterId)) return;

    setGeneratingIds(prev => new Set(prev).add(characterId));

    try {
      // Check if this is a custom character with a custom image prompt
      const customChar = customCharacters.find(c => c.id === characterId);
      const customPrompt = customChar?.imagePrompt;

      const result = await generateCharacterImage(characterId, false, customPrompt);
      if (result.success && result.imageUrl) {
        setGeneratedImages(prev => ({ ...prev, [characterId]: result.imageUrl }));
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setGeneratingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(characterId);
        return newSet;
      });
    }
  };

  const handleGenerateAll = async () => {
    for (const character of CHARACTERS) {
      if (!generatedImages[character.id] && !generatingIds.has(character.id)) {
        await handleGenerateImage(character.id);
      }
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    Alert.alert(
      'Delete Character',
      'Are you sure you want to delete this character? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCustomCharacter(characterId);
            await loadCustomCharacters();
          },
        },
      ]
    );
  };

  const handleCharacterAdded = (character: Character) => {
    setCustomCharacters(prev => [...prev, character]);
  };

  const handlePlayThemeSong = (characterId: string) => {
    // Toggle theme song playback (placeholder - will be implemented with ElevenLabs)
    if (playingThemeId === characterId) {
      setPlayingThemeId(null);
      // Stop audio
    } else {
      setPlayingThemeId(characterId);
      // Play audio
      // For now, just show that we would play the theme
      const character = [...CHARACTERS, ...customCharacters].find(c => c.id === characterId);
      if (character?.themeSong) {
        console.log('[Theme] Would play theme for:', character.name);
        console.log('[Theme] Description:', character.themeSong.description);
      }
    }
  };

  const royalCharacters = CHARACTERS.filter((c) => c.type === 'royal');
  const chaoticCharacters = CHARACTERS.filter((c) => c.type === 'chaotic');

  return (
    <AnimatedBackground intensity="medium">
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [{
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            },
          ]}
        >
          <Text style={styles.headerTitle}>The Kingdom</Text>
          <Text style={styles.headerSubtitle}>
            Tap any card to discover their story
          </Text>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.addCharacterButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addCharacterText}>+ Add Character</Text>
            </TouchableOpacity>

            {hasApiKey && (
              <TouchableOpacity
                style={styles.generateAllButton}
                onPress={handleGenerateAll}
              >
                <Text style={styles.generateAllText}>✨ Portraits</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Royal Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>👑</Text>
            <View>
              <Text style={styles.sectionTitle}>The Royal Couple</Text>
              <Text style={styles.sectionSubtitle}>Always together, always in love</Text>
            </View>
          </View>

          <View style={styles.cardsGrid}>
            {royalCharacters.map((character, index) => (
              <FlipCard
                key={character.id}
                character={character}
                index={index}
                generatedImage={generatedImages[character.id] || null}
                isGenerating={generatingIds.has(character.id)}
                onGenerateImage={() => handleGenerateImage(character.id)}
                hasApiKey={hasApiKey}
              />
            ))}
          </View>
        </View>

        {/* Chaotic Court Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🎭</Text>
            <View>
              <Text style={styles.sectionTitle}>The Chaotic Court</Text>
              <Text style={styles.sectionSubtitle}>Playful, silly, and wonderfully absurd</Text>
            </View>
          </View>

          <View style={styles.cardsGrid}>
            {chaoticCharacters.map((character, index) => (
              <FlipCard
                key={character.id}
                character={character}
                index={index + royalCharacters.length}
                generatedImage={generatedImages[character.id] || null}
                isGenerating={generatingIds.has(character.id)}
                onGenerateImage={() => handleGenerateImage(character.id)}
                hasApiKey={hasApiKey}
              />
            ))}
          </View>
        </View>

        {/* Custom Characters Section */}
        {customCharacters.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🌟</Text>
              <View>
                <Text style={styles.sectionTitle}>Your Characters</Text>
                <Text style={styles.sectionSubtitle}>Custom creations from your imagination</Text>
              </View>
            </View>

            <View style={styles.cardsGrid}>
              {customCharacters.map((character, index) => (
                <FlipCard
                  key={character.id}
                  character={character}
                  index={index + royalCharacters.length + chaoticCharacters.length}
                  generatedImage={generatedImages[character.id] || null}
                  isGenerating={generatingIds.has(character.id)}
                  onGenerateImage={() => handleGenerateImage(character.id)}
                  hasApiKey={hasApiKey}
                  onDelete={() => handleDeleteCharacter(character.id)}
                  onPlayThemeSong={character.themeSong ? () => handlePlayThemeSong(character.id) : undefined}
                  isPlayingTheme={playingThemeId === character.id}
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty state for custom characters */}
        {customCharacters.length === 0 && (
          <View style={styles.emptyCustomSection}>
            <Text style={styles.emptyEmoji}>🌟</Text>
            <Text style={styles.emptyTitle}>Create Your Own Characters</Text>
            <Text style={styles.emptySubtitle}>
              Add custom characters with unique personalities and theme songs
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyAddButtonText}>+ Add First Character</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Return to Kingdom</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Character Modal */}
      <AddCharacterModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCharacterAdded={handleCharacterAdded}
      />
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(200, 166, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  generateAllButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'rgba(230, 216, 168, 0.2)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(230, 216, 168, 0.3)',
  },
  generateAllText: {
    color: Colors.starlight,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  sectionEmoji: {
    fontSize: 28,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  flipCardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.35,
    marginBottom: Spacing.md,
    perspective: 1000,
  },
  flipCardTouchable: {
    width: '100%',
    height: '100%',
  },
  flipCardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        WebkitBackfaceVisibility: 'hidden',
      },
    }),
  },
  flipCardFront: {
    zIndex: 2,
  },
  flipCardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardGradient: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(200, 166, 255, 0.2)',
  },
  typeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeText: {
    fontSize: 14,
  },
  imageWrapper: {
    width: CARD_SIZE * 0.6,
    height: CARD_SIZE * 0.6,
    borderRadius: CARD_SIZE * 0.3,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'rgba(200, 166, 255, 0.3)',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  loadingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  emojiWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: CARD_SIZE * 0.25,
  },
  frontName: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  frontTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  tapHint: {
    position: 'absolute',
    bottom: Spacing.sm,
    fontSize: 10,
    color: Colors.textMuted,
    opacity: 0.6,
  },
  royalGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(230, 216, 168, 0.3)',
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    width: '100%',
  },
  backEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  backTitleContainer: {
    flex: 1,
  },
  backName: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  backTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  backDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.xs * 1.5,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  personalityBox: {
    width: '100%',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  personalityLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  personalityText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  generateButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  generateButtonText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: '600',
  },
  themeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeBadgeText: {
    fontSize: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  addCharacterButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'rgba(125, 211, 168, 0.2)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 168, 0.3)',
  },
  addCharacterText: {
    color: '#7DD3A8',
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  emptyCustomSection: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    backgroundColor: 'rgba(125, 211, 168, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 168, 0.2)',
    borderStyle: 'dashed',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyAddButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    backgroundColor: 'rgba(125, 211, 168, 0.2)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 168, 0.4)',
  },
  emptyAddButtonText: {
    color: '#7DD3A8',
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: 'rgba(200, 166, 255, 0.15)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(200, 166, 255, 0.3)',
    marginTop: Spacing.lg,
  },
  backButtonText: {
    color: Colors.lilac,
    fontSize: Typography.fontSize.md,
    fontWeight: '500',
  },
});

export default CharacterGalleryScreen;
