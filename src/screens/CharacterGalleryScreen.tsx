// 🌙 Moonlit Tales - Character Gallery Screen
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import MagicButton from '../components/MagicButton';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animations } from '../utils/theme';
import { RootStackParamList, CHARACTERS, Character } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.lg * 2;

type CharacterGalleryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CharacterGallery'>;

interface CharacterCardProps {
  character: Character;
  index: number;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entry animation
    Animated.sequence([
      Animated.delay(index * 150),
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
      ]),
    ]).start();

    // Continuous glow animation for royal characters
    if (character.type === 'royal') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, []);

  const isRoyal = character.type === 'royal';
  const glowColor = isRoyal ? Colors.starlight : Colors.lilac;

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Glow effect */}
      {isRoyal && (
        <Animated.View
          style={[
            styles.cardGlow,
            {
              backgroundColor: glowColor,
              opacity: glowOpacity,
            },
          ]}
        />
      )}

      <LinearGradient
        colors={
          isRoyal
            ? ['rgba(230, 216, 168, 0.15)', 'rgba(200, 166, 255, 0.1)']
            : ['rgba(94, 58, 168, 0.2)', 'rgba(49, 28, 75, 0.3)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Character Type Badge */}
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: isRoyal ? 'rgba(230, 216, 168, 0.2)' : 'rgba(200, 166, 255, 0.2)' },
          ]}
        >
          <Text style={[styles.typeBadgeText, { color: isRoyal ? Colors.starlight : Colors.lilac }]}>
            {isRoyal ? 'ROYAL' : 'CHAOTIC COURT'}
          </Text>
        </View>

        {/* Character Emoji */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{character.emoji}</Text>
        </View>

        {/* Character Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={[styles.characterTitle, { color: isRoyal ? Colors.starlight : Colors.lilac }]}>
            {character.title}
          </Text>
          <Text style={styles.characterDescription}>{character.description}</Text>

          {character.personality && (
            <View style={styles.personalityContainer}>
              <Text style={styles.personalityLabel}>Personality:</Text>
              <Text style={styles.personalityText}>{character.personality}</Text>
            </View>
          )}
        </View>

        {/* Decorative corner */}
        <View style={styles.decorativeCorner}>
          <View style={[styles.cornerLine, { backgroundColor: isRoyal ? Colors.starlight : Colors.lilac }]} />
          <View style={[styles.cornerLine, styles.cornerLine2, { backgroundColor: isRoyal ? Colors.starlight : Colors.lilac }]} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const CharacterGalleryScreen: React.FC = () => {
  const navigation = useNavigation<CharacterGalleryNavigationProp>();

  const royalCharacters = CHARACTERS.filter((c) => c.type === 'royal');
  const chaoticCharacters = CHARACTERS.filter((c) => c.type === 'chaotic');

  return (
    <AnimatedBackground intensity="low">
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>👑</Text>
          <Text style={styles.headerTitle}>Character Gallery</Text>
          <Text style={styles.headerSubtitle}>
            Meet the inhabitants of the moonlit kingdom
          </Text>
        </View>

        {/* Royal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Royal Couple</Text>
          <Text style={styles.sectionDescription}>
            The heart of every story - always together, always in love
          </Text>
          {royalCharacters.map((character, index) => (
            <CharacterCard key={character.id} character={character} index={index} />
          ))}
        </View>

        {/* Chaotic Court Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Chaotic Court</Text>
          <Text style={styles.sectionDescription}>
            Found only in Gossip Mode - playful, silly, and wonderfully absurd
          </Text>
          {chaoticCharacters.map((character, index) => (
            <CharacterCard
              key={character.id}
              character={character}
              index={index + royalCharacters.length}
            />
          ))}
        </View>

        {/* Back Button */}
        <MagicButton
          title="Return to Kingdom"
          onPress={() => navigation.goBack()}
          variant="secondary"
          size="medium"
          style={styles.backButton}
        />
      </ScrollView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.xxl + 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerEmoji: {
    fontSize: 50,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.title,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(200, 166, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },
  cardContainer: {
    marginBottom: Spacing.lg,
    width: CARD_WIDTH,
  },
  cardGlow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: BorderRadius.lg + 10,
    ...Shadows.gold,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  typeBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emoji: {
    fontSize: 40,
  },
  infoContainer: {
    flex: 1,
  },
  characterName: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  characterTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  characterDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
    marginBottom: Spacing.md,
  },
  personalityContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  personalityLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  personalityText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  decorativeCorner: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
  },
  cornerLine: {
    width: 25,
    height: 2,
    borderRadius: 1,
    opacity: 0.4,
  },
  cornerLine2: {
    marginTop: 4,
    width: 15,
    alignSelf: 'flex-end',
  },
  backButton: {
    alignSelf: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
});

export default CharacterGalleryScreen;
