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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import AnimatedBackground from '../components/AnimatedBackground';
import MagicButton from '../components/MagicButton';
import { Colors, Typography, Spacing, BorderRadius, Animations } from '../utils/theme';
import { RootStackParamList } from '../types';
import { setOpenAIKey, getOpenAIKey } from '../services/openai';
import { setElevenLabsKey, getElevenLabsKey } from '../services/elevenlabs';
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
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);

  // App settings state
  const [settings, setSettingsState] = useState<AppSettings>({
    backgroundMusicVolume: 0.3,
    narrationVolume: 0.8,
    defaultVoice: 'narrator',
    defaultLength: 'medium',
    autoPlay: true,
    hapticFeedback: true,
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
    setSettingsState(appSettings);

    // Set the keys in the service modules
    setOpenAIKey(apiKeys.openai);
    setElevenLabsKey(apiKeys.elevenlabs);
  };

  const handleSaveAPIKeys = async () => {
    try {
      await saveAPIKeys({
        openai: openaiKey,
        elevenlabs: elevenLabsKey,
      });

      // Update the service modules
      setOpenAIKey(openaiKey);
      setElevenLabsKey(elevenLabsKey);

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
    <AnimatedBackground intensity="low">
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
