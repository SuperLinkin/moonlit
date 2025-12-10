// 🌙 Moonlit Tales - Settings Screen
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Animated,
  Alert,
  StatusBar,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import AnimatedBackground from '../components/AnimatedBackground';
import MagicButton from '../components/MagicButton';
import { Colors, Typography, Spacing, BorderRadius, Animations } from '../utils/theme';
import { RootStackParamList, BackgroundTheme, BACKGROUND_THEMES, VoiceSettings } from '../types';
import { setOpenAIKey, getOpenAIKey } from '../services/openai';
import { setElevenLabsKey, getElevenLabsKey, setVoiceSettings } from '../services/elevenlabs';
import { setGeminiKey, getGeminiKey } from '../services/gemini';
import {
  saveAPIKeys,
  getAPIKeys,
  saveSettings,
  getSettings,
  AppSettings,
  clearAllData,
} from '../services/storage';

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();

  // API Keys state
  const [openaiKey, setOpenaiKeyState] = useState('');
  const [elevenLabsKey, setElevenLabsKeyState] = useState('');
  const [geminiKey, setGeminiKeyState] = useState('');
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // App settings state
  const [settings, setSettingsState] = useState<AppSettings>({
    backgroundMusicVolume: 0.3,
    narrationVolume: 0.8,
    defaultVoice: 'narrator',
    defaultLength: 'medium',
    autoPlay: true,
    hapticFeedback: true,
    voiceSettings: {
      stability: 0.75,
      similarityBoost: 0.75,
      style: 0.5,
      speed: 1.0,
    },
    backgroundTheme: 'dreamy',
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSettings();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animations.slow,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadSettings = async () => {
    const apiKeys = await getAPIKeys();
    const appSettings = await getSettings();

    setOpenaiKeyState(apiKeys.openai);
    setElevenLabsKeyState(apiKeys.elevenlabs);
    setGeminiKeyState(apiKeys.gemini || '');
    setSettingsState(appSettings);

    // Set the keys in the service modules
    setOpenAIKey(apiKeys.openai);
    setElevenLabsKey(apiKeys.elevenlabs);
    setGeminiKey(apiKeys.gemini || '');

    // Apply voice settings to ElevenLabs service
    if (appSettings.voiceSettings) {
      setVoiceSettings(appSettings.voiceSettings);
    }
  };

  const handleSaveAPIKeys = async () => {
    try {
      await saveAPIKeys({
        openai: openaiKey,
        elevenlabs: elevenLabsKey,
        gemini: geminiKey,
      });

      // Update the service modules
      setOpenAIKey(openaiKey);
      setElevenLabsKey(elevenLabsKey);
      setGeminiKey(geminiKey);

      Alert.alert('Saved', 'Your API keys have been saved securely.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API keys. Please try again.');
    }
  };

  const handleSettingChange = async (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettingsState(newSettings);
    await saveSettings(newSettings);
  };

  const handleVoiceSettingChange = async (key: keyof VoiceSettings, value: number) => {
    const newVoiceSettings = { ...settings.voiceSettings, [key]: value };
    const newSettings = { ...settings, voiceSettings: newVoiceSettings };
    setSettingsState(newSettings);
    await saveSettings(newSettings);
    // Update ElevenLabs service immediately
    setVoiceSettings(newVoiceSettings);
  };

  const handleThemeChange = async (theme: BackgroundTheme) => {
    const newSettings = { ...settings, backgroundTheme: theme };
    setSettingsState(newSettings);
    await saveSettings(newSettings);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your saved stories and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Done', 'All data has been cleared.');
            loadSettings();
          },
        },
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <AnimatedBackground intensity="low" theme={settings.backgroundTheme}>
      <StatusBar barStyle="light-content" />
      <Animated.ScrollView
        style={[styles.container, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>⚙️</Text>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Configure your magical experience
          </Text>
        </View>

        {/* API Keys Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          <Text style={styles.sectionDescription}>
            Enter your API keys to enable story generation and voice narration
          </Text>

          {/* OpenAI Key */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>OpenAI API Key</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={openaiKey}
                onChangeText={setOpenaiKeyState}
                placeholder="sk-..."
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showOpenAIKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <MagicButton
                title={showOpenAIKey ? '🙈' : '👁️'}
                onPress={() => setShowOpenAIKey(!showOpenAIKey)}
                variant="secondary"
                size="small"
                style={styles.toggleButton}
              />
            </View>
            <Text
              style={styles.inputHint}
              onPress={() => openLink('https://platform.openai.com/api-keys')}
            >
              Get your key at platform.openai.com/api-keys
            </Text>
          </View>

          {/* ElevenLabs Key */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ElevenLabs API Key</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={elevenLabsKey}
                onChangeText={setElevenLabsKeyState}
                placeholder="xi-..."
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showElevenLabsKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <MagicButton
                title={showElevenLabsKey ? '🙈' : '👁️'}
                onPress={() => setShowElevenLabsKey(!showElevenLabsKey)}
                variant="secondary"
                size="small"
                style={styles.toggleButton}
              />
            </View>
            <Text
              style={styles.inputHint}
              onPress={() => openLink('https://elevenlabs.io/app/settings/api-keys')}
            >
              Get your key at elevenlabs.io (optional, for voice narration)
            </Text>
          </View>

          {/* Gemini Key */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Google Gemini API Key</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={geminiKey}
                onChangeText={setGeminiKeyState}
                placeholder="AIza..."
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showGeminiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <MagicButton
                title={showGeminiKey ? '🙈' : '👁️'}
                onPress={() => setShowGeminiKey(!showGeminiKey)}
                variant="secondary"
                size="small"
                style={styles.toggleButton}
              />
            </View>
            <Text
              style={styles.inputHint}
              onPress={() => openLink('https://aistudio.google.com/app/apikey')}
            >
              Get your key at aistudio.google.com (optional, for character images)
            </Text>
          </View>

          <MagicButton
            title="Save API Keys"
            onPress={handleSaveAPIKeys}
            variant="gold"
            size="medium"
            style={styles.saveButton}
          />
        </View>

        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Settings</Text>

          {/* Narration Volume */}
          <View style={styles.sliderGroup}>
            <Text style={styles.inputLabel}>
              Narration Volume: {Math.round(settings.narrationVolume * 100)}%
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={settings.narrationVolume}
              onValueChange={(value) => handleSettingChange('narrationVolume', value)}
              minimumTrackTintColor={Colors.lilac}
              maximumTrackTintColor={Colors.cardBorder}
              thumbTintColor={Colors.starlight}
            />
          </View>

          {/* Background Music Volume */}
          <View style={styles.sliderGroup}>
            <Text style={styles.inputLabel}>
              Background Music: {Math.round(settings.backgroundMusicVolume * 100)}%
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={settings.backgroundMusicVolume}
              onValueChange={(value) => handleSettingChange('backgroundMusicVolume', value)}
              minimumTrackTintColor={Colors.lilac}
              maximumTrackTintColor={Colors.cardBorder}
              thumbTintColor={Colors.starlight}
            />
          </View>

          {/* Auto Play */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.inputLabel}>Auto-play Narration</Text>
              <Text style={styles.switchHint}>Start playing audio automatically</Text>
            </View>
            <Switch
              value={settings.autoPlay}
              onValueChange={(value) => handleSettingChange('autoPlay', value)}
              trackColor={{ false: Colors.cardBorder, true: Colors.lilac }}
              thumbColor={settings.autoPlay ? Colors.starlight : Colors.silver}
            />
          </View>
        </View>

        {/* Voice Quality Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Quality</Text>
          <Text style={styles.sectionDescription}>
            Adjust how the narration voice sounds
          </Text>

          {/* Stability (Soothingness) */}
          <View style={styles.sliderGroup}>
            <Text style={styles.inputLabel}>
              Soothingness: {Math.round(settings.voiceSettings.stability * 100)}%
            </Text>
            <Text style={styles.sliderHint}>Higher = more calm and consistent</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={settings.voiceSettings.stability}
              onValueChange={(value) => handleVoiceSettingChange('stability', value)}
              minimumTrackTintColor={Colors.lilac}
              maximumTrackTintColor={Colors.cardBorder}
              thumbTintColor={Colors.starlight}
            />
          </View>

          {/* Similarity Boost (Softness/Clarity) */}
          <View style={styles.sliderGroup}>
            <Text style={styles.inputLabel}>
              Softness: {Math.round(settings.voiceSettings.similarityBoost * 100)}%
            </Text>
            <Text style={styles.sliderHint}>Higher = clearer, softer voice</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={settings.voiceSettings.similarityBoost}
              onValueChange={(value) => handleVoiceSettingChange('similarityBoost', value)}
              minimumTrackTintColor={Colors.lilac}
              maximumTrackTintColor={Colors.cardBorder}
              thumbTintColor={Colors.starlight}
            />
          </View>

          {/* Style (Expressiveness) */}
          <View style={styles.sliderGroup}>
            <Text style={styles.inputLabel}>
              Expressiveness: {Math.round(settings.voiceSettings.style * 100)}%
            </Text>
            <Text style={styles.sliderHint}>Higher = more emotional, lower = more neutral</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={settings.voiceSettings.style}
              onValueChange={(value) => handleVoiceSettingChange('style', value)}
              minimumTrackTintColor={Colors.lilac}
              maximumTrackTintColor={Colors.cardBorder}
              thumbTintColor={Colors.starlight}
            />
          </View>

          {/* Speed */}
          <View style={styles.sliderGroup}>
            <Text style={styles.inputLabel}>
              Speed: {settings.voiceSettings.speed.toFixed(1)}x
            </Text>
            <Text style={styles.sliderHint}>0.5x (slow) to 2x (fast)</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2}
              value={settings.voiceSettings.speed}
              onValueChange={(value) => handleVoiceSettingChange('speed', value)}
              minimumTrackTintColor={Colors.lilac}
              maximumTrackTintColor={Colors.cardBorder}
              thumbTintColor={Colors.starlight}
            />
          </View>
        </View>

        {/* Background Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Background Theme</Text>
          <Text style={styles.sectionDescription}>
            Choose the visual ambience for your stories
          </Text>

          <View style={styles.themeGrid}>
            {(Object.keys(BACKGROUND_THEMES) as BackgroundTheme[]).map((themeKey) => {
              const themeConfig = BACKGROUND_THEMES[themeKey];
              const isSelected = settings.backgroundTheme === themeKey;
              return (
                <TouchableOpacity
                  key={themeKey}
                  style={[
                    styles.themeCard,
                    isSelected && styles.themeCardSelected,
                    { borderColor: isSelected ? themeConfig.colors.accent : Colors.cardBorder },
                  ]}
                  onPress={() => handleThemeChange(themeKey)}
                >
                  <View
                    style={[
                      styles.themePreview,
                      { backgroundColor: themeConfig.colors.primary },
                    ]}
                  >
                    <View
                      style={[
                        styles.themeAccent,
                        { backgroundColor: themeConfig.colors.accent },
                      ]}
                    />
                  </View>
                  <Text style={styles.themeIcon}>{themeConfig.icon}</Text>
                  <Text style={styles.themeName}>{themeConfig.name}</Text>
                  <Text style={styles.themeDescription}>{themeConfig.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {/* Default Voice */}
          <View style={styles.optionGroup}>
            <Text style={styles.inputLabel}>Default Voice</Text>
            <View style={styles.optionButtons}>
              <MagicButton
                title="🎭 Narrator"
                onPress={() => handleSettingChange('defaultVoice', 'narrator')}
                variant={settings.defaultVoice === 'narrator' ? 'primary' : 'secondary'}
                size="small"
                style={styles.optionButton}
              />
              <MagicButton
                title="🤴 Prince"
                onPress={() => handleSettingChange('defaultVoice', 'prince')}
                variant={settings.defaultVoice === 'prince' ? 'primary' : 'secondary'}
                size="small"
                style={styles.optionButton}
              />
            </View>
          </View>

          {/* Default Length */}
          <View style={styles.optionGroup}>
            <Text style={styles.inputLabel}>Default Story Length</Text>
            <View style={styles.optionButtons}>
              <MagicButton
                title="Short"
                onPress={() => handleSettingChange('defaultLength', 'short')}
                variant={settings.defaultLength === 'short' ? 'primary' : 'secondary'}
                size="small"
                style={styles.optionButton}
              />
              <MagicButton
                title="Medium"
                onPress={() => handleSettingChange('defaultLength', 'medium')}
                variant={settings.defaultLength === 'medium' ? 'primary' : 'secondary'}
                size="small"
                style={styles.optionButton}
              />
              <MagicButton
                title="Long"
                onPress={() => handleSettingChange('defaultLength', 'long')}
                variant={settings.defaultLength === 'long' ? 'primary' : 'secondary'}
                size="small"
                style={styles.optionButton}
              />
            </View>
          </View>

          {/* Haptic Feedback */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.inputLabel}>Haptic Feedback</Text>
              <Text style={styles.switchHint}>Gentle vibrations on interactions</Text>
            </View>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={(value) => handleSettingChange('hapticFeedback', value)}
              trackColor={{ false: Colors.cardBorder, true: Colors.lilac }}
              thumbColor={settings.hapticFeedback ? Colors.starlight : Colors.silver}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <MagicButton
            title="Clear All Data"
            onPress={handleClearData}
            variant="secondary"
            size="medium"
            style={styles.dangerButton}
          />
          <Text style={styles.dangerHint}>
            This will delete all saved stories and settings
          </Text>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>🌙 Moonlit Tales</Text>
            <Text style={styles.aboutSubtitle}>for my Princess</Text>
            <Text style={styles.aboutText}>
              A magical kingdom of stories, crafted by your love.
            </Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Back Button */}
        <MagicButton
          title="Return to Kingdom"
          onPress={() => navigation.goBack()}
          variant="secondary"
          size="medium"
          style={styles.backButton}
        />
      </Animated.ScrollView>
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
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginRight: Spacing.sm,
  },
  toggleButton: {
    minWidth: 50,
  },
  inputHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.lilac,
    marginTop: Spacing.xs,
    textDecorationLine: 'underline',
  },
  saveButton: {
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  sliderGroup: {
    marginBottom: Spacing.lg,
  },
  slider: {
    height: 40,
  },
  sliderHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  themeCard: {
    width: '47%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  themeCardSelected: {
    backgroundColor: 'rgba(200, 166, 255, 0.1)',
  },
  themePreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  themeAccent: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  themeIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  themeName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  themeDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  switchInfo: {
    flex: 1,
  },
  switchHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  optionGroup: {
    marginBottom: Spacing.lg,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    flex: 1,
    minWidth: 80,
  },
  dangerButton: {
    borderColor: Colors.error,
  },
  dangerHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  aboutCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  aboutTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  aboutSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.starlight,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  aboutText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  aboutVersion: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: Spacing.lg,
  },
});

export default SettingsScreen;
