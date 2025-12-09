// 🌙 Moonlit Tales - Story Generator Screen
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Animated,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import AnimatedBackground from '../components/AnimatedBackground';
import MagicButton from '../components/MagicButton';
import { Colors, Typography, Spacing, BorderRadius, Animations } from '../utils/theme';
import { RootStackParamList, StoryMode, StoryLength, StorySettings, Story, STORY_MODES } from '../types';
import { generateStory, getOpenAIKey } from '../services/openai';
import { generateNarration, getElevenLabsKey } from '../services/elevenlabs';
import { saveStory, generateId } from '../services/storage';

type StoryGeneratorRouteProp = RouteProp<RootStackParamList, 'StoryGenerator'>;
type StoryGeneratorNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoryGenerator'>;

const LENGTH_OPTIONS: { label: string; value: StoryLength; description: string }[] = [
  { label: 'Short', value: 'short', description: '2-3 min read' },
  { label: 'Medium', value: 'medium', description: '5-7 min read' },
  { label: 'Long', value: 'long', description: '10-12 min read' },
];

const StoryGeneratorScreen: React.FC = () => {
  const navigation = useNavigation<StoryGeneratorNavigationProp>();
  const route = useRoute<StoryGeneratorRouteProp>();
  const { mode } = route.params;
  const modeConfig = STORY_MODES[mode];

  // Settings state
  const [length, setLength] = useState<StoryLength>('medium');
  const [toneSoftness, setToneSoftness] = useState(70);
  const [lullabyEnding, setLullabyEnding] = useState(true);
  const [customTheme, setCustomTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  const handleGenerate = async () => {
    // Check API keys
    if (!getOpenAIKey()) {
      Alert.alert(
        'API Key Required',
        'Please configure your OpenAI API key in Settings first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => navigation.navigate('Settings') },
        ]
      );
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('Weaving your magical tale...');

    const settings: StorySettings = {
      mode,
      length,
      toneSoftness,
      lullabyEnding,
      customTheme: mode === 'custom' ? customTheme : undefined,
    };

    try {
      // Generate story
      const result = await generateStory(settings);

      if (!result.success) {
        Alert.alert('Generation Failed', result.error);
        setIsGenerating(false);
        return;
      }

      setGenerationStatus('Creating voice narration...');

      // Generate narration if ElevenLabs key is available
      let audioUrl: string | undefined;
      if (getElevenLabsKey()) {
        const narrationResult = await generateNarration(result.content);
        if (narrationResult.success) {
          audioUrl = narrationResult.audioUri;
        }
      }

      // Create story object
      const story: Story = {
        id: generateId(),
        title: result.title,
        content: result.content,
        mode,
        createdAt: new Date().toISOString(),
        audioUrl,
        isFavorite: false,
        settings,
      };

      // Save story
      await saveStory(story);

      setIsGenerating(false);

      // Navigate to reader
      navigation.replace('StoryReader', { story });
    } catch (error) {
      console.error('Generation error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setIsGenerating(false);
    }
  };

  const renderLengthOption = (option: typeof LENGTH_OPTIONS[0]) => {
    const isSelected = length === option.value;
    return (
      <MagicButton
        key={option.value}
        title={option.label}
        onPress={() => setLength(option.value)}
        variant={isSelected ? 'primary' : 'secondary'}
        size="small"
        style={styles.lengthButton}
      />
    );
  };

  return (
    <AnimatedBackground intensity="low">
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
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.modeIcon}>{modeConfig.icon}</Text>
          <Text style={styles.modeTitle}>{modeConfig.title}</Text>
          <Text style={styles.modeDescription}>{modeConfig.description}</Text>
        </Animated.View>

        {/* Settings Card */}
        <Animated.View
          style={[
            styles.settingsCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Story Length */}
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Story Length</Text>
            <View style={styles.lengthOptions}>
              {LENGTH_OPTIONS.map(renderLengthOption)}
            </View>
            <Text style={styles.settingHint}>
              {LENGTH_OPTIONS.find((o) => o.value === length)?.description}
            </Text>
          </View>

          {/* Tone Softness Slider */}
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Tone Softness</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Gentle</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={toneSoftness}
                onValueChange={setToneSoftness}
                minimumTrackTintColor={Colors.lilac}
                maximumTrackTintColor={Colors.cardBorder}
                thumbTintColor={Colors.starlight}
              />
              <Text style={styles.sliderLabel}>Extra Soft</Text>
            </View>
            <Text style={styles.settingHint}>
              {toneSoftness >= 80 ? 'Like a whispered dream' : toneSoftness >= 50 ? 'Warm and soothing' : 'Gently calming'}
            </Text>
          </View>

          {/* Lullaby Ending Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowText}>
              <Text style={styles.settingLabel}>Lullaby Ending</Text>
              <Text style={styles.settingHint}>Extra peaceful final paragraph</Text>
            </View>
            <Switch
              value={lullabyEnding}
              onValueChange={setLullabyEnding}
              trackColor={{ false: Colors.cardBorder, true: Colors.lilac }}
              thumbColor={lullabyEnding ? Colors.starlight : Colors.silver}
            />
          </View>

          {/* Custom Theme (only for custom mode) */}
          {mode === 'custom' && (
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Your Story Theme</Text>
              <TextInput
                style={styles.themeInput}
                placeholder="e.g., A moonlit garden, A starship adventure..."
                placeholderTextColor={Colors.textMuted}
                value={customTheme}
                onChangeText={setCustomTheme}
                multiline
                numberOfLines={3}
              />
              <Text style={styles.settingHint}>
                Describe the setting or theme you'd like for your story
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Generate Button */}
        <View style={styles.generateContainer}>
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.starlight} />
              <Text style={styles.loadingText}>{generationStatus}</Text>
              <Text style={styles.loadingHint}>
                Crafting magic takes a moment...
              </Text>
            </View>
          ) : (
            <MagicButton
              title="Generate Story"
              onPress={handleGenerate}
              variant="gold"
              size="large"
              icon="✨"
            />
          )}
        </View>

        {/* Back Button */}
        <MagicButton
          title="Back to Kingdom"
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
  modeIcon: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  modeTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
    paddingHorizontal: Spacing.lg,
  },
  settingsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  settingSection: {
    marginBottom: Spacing.lg,
  },
  settingLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  settingHint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  lengthOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  lengthButton: {
    flex: 1,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: Spacing.sm,
  },
  sliderLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    width: 60,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  settingRowText: {
    flex: 1,
  },
  themeInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  generateContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    fontWeight: '600',
  },
  loadingHint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  backButton: {
    alignSelf: 'center',
    marginBottom: Spacing.xxl,
  },
});

export default StoryGeneratorScreen;
