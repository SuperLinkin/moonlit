// 🌙 Moonlit Tales - Add Character Modal
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Character } from '../types';
import { saveCustomCharacter, generateCharacterId } from '../services/storage';
import MagicButton from './MagicButton';

const { width, height } = Dimensions.get('window');

// Emoji picker options
const EMOJI_OPTIONS = [
  '🧙', '🧚', '🦄', '🐉', '🦊', '🐺', '🦁', '🐻',
  '🌸', '🌺', '🌷', '🌻', '⭐', '🌟', '💫', '✨',
  '🎭', '🎪', '🎨', '🎵', '🎶', '💜', '💙', '💚',
  '🦋', '🐦', '🦉', '🦅', '🐱', '🐶', '🐰', '🦌',
  '👸', '🤴', '🧝', '🧜', '🧞', '🪄', '🔮', '👻',
];

// Character type options
const CHARACTER_TYPES: { value: 'royal' | 'chaotic' | 'custom'; label: string; icon: string }[] = [
  { value: 'royal', label: 'Royal', icon: '👑' },
  { value: 'chaotic', label: 'Chaotic', icon: '🎭' },
  { value: 'custom', label: 'Mystical', icon: '✨' },
];

interface AddCharacterModalProps {
  visible: boolean;
  onClose: () => void;
  onCharacterAdded: (character: Character) => void;
}

const AddCharacterModal: React.FC<AddCharacterModalProps> = ({
  visible,
  onClose,
  onCharacterAdded,
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🧙');
  const [characterType, setCharacterType] = useState<'royal' | 'chaotic' | 'custom'>('custom');
  const [themeSongDescription, setThemeSongDescription] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const resetForm = () => {
    setName('');
    setTitle('');
    setDescription('');
    setPersonality('');
    setSelectedEmoji('🧙');
    setCharacterType('custom');
    setThemeSongDescription('');
    setImagePrompt('');
    setCurrentStep(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim() || !title.trim()) return;

    setIsSaving(true);
    try {
      const newCharacter: Character = {
        id: generateCharacterId(),
        name: name.trim(),
        title: title.trim(),
        description: description.trim() || `A mysterious character from the kingdom.`,
        emoji: selectedEmoji,
        type: characterType,
        personality: personality.trim() || undefined,
        isCustom: true,
        themeSong: themeSongDescription.trim() ? {
          description: themeSongDescription.trim(),
        } : undefined,
        imagePrompt: imagePrompt.trim() || undefined,
      };

      await saveCustomCharacter(newCharacter);
      onCharacterAdded(newCharacter);
      handleClose();
    } catch (error) {
      console.error('Error saving character:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return name.trim().length > 0 && title.trim().length > 0;
    return true;
  };

  const renderStep0 = () => (
    <>
      {/* Name Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Character Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Moonbeam, Whisper..."
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="words"
        />
      </View>

      {/* Title Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., The Dream Weaver"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="words"
        />
      </View>

      {/* Emoji Picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Choose an Avatar</Text>
        <View style={styles.emojiGrid}>
          {EMOJI_OPTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.emojiOption,
                selectedEmoji === emoji && styles.emojiOptionSelected,
              ]}
              onPress={() => setSelectedEmoji(emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Character Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Character Type</Text>
        <View style={styles.typeRow}>
          {CHARACTER_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeOption,
                characterType === type.value && styles.typeOptionSelected,
              ]}
              onPress={() => setCharacterType(type.value)}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={[
                styles.typeLabel,
                characterType === type.value && styles.typeLabelSelected,
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  const renderStep1 = () => (
    <>
      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your character's appearance and role..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Personality */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Personality</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={personality}
          onChangeText={setPersonality}
          placeholder="What makes them unique? Their quirks and traits..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>

      {/* Image Prompt */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Portrait Description (for AI)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={imagePrompt}
          onChangeText={setImagePrompt}
          placeholder="Describe how they look for AI portrait generation..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <Text style={styles.inputHint}>
          Tip: Be detailed! Include features, clothing, style, atmosphere
        </Text>
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      {/* Theme Song */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Theme Song Description</Text>
        <Text style={styles.inputSubtitle}>
          Describe the music that plays when this character appears
        </Text>
        <TextInput
          style={[styles.input, styles.textAreaLarge]}
          value={themeSongDescription}
          onChangeText={setThemeSongDescription}
          placeholder="e.g., A gentle, ethereal melody with soft harp strings and distant chimes, evoking moonlight dancing on still water..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <Text style={styles.inputHint}>
          Describe the mood, instruments, tempo, and feeling of the music
        </Text>
      </View>

      {/* Preview Card */}
      <View style={styles.previewCard}>
        <LinearGradient
          colors={['rgba(200, 166, 255, 0.2)', 'rgba(94, 58, 168, 0.15)']}
          style={styles.previewGradient}
        >
          <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
          <Text style={styles.previewName}>{name || 'Character Name'}</Text>
          <Text style={styles.previewTitle}>{title || 'The Title'}</Text>
          {themeSongDescription && (
            <View style={styles.musicBadge}>
              <Text style={styles.musicBadgeText}>🎵 Has Theme Song</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    </>
  );

  const steps = [
    { title: 'Basic Info', render: renderStep0 },
    { title: 'Details', render: renderStep1 },
    { title: 'Theme Music', render: renderStep2 },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <LinearGradient
            colors={['#1A0A2A', '#311C4B', '#1A0A2A']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Create Character</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      index <= currentStep && styles.stepDotActive,
                    ]}
                  >
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      index === currentStep && styles.stepLabelActive,
                    ]}
                  >
                    {step.title}
                  </Text>
                </View>
              ))}
            </View>

            {/* Form Content */}
            <ScrollView
              style={styles.formScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
            >
              {steps[currentStep].render()}
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.buttonRow}>
              {currentStep > 0 && (
                <MagicButton
                  title="← Back"
                  onPress={() => setCurrentStep(currentStep - 1)}
                  variant="secondary"
                  size="medium"
                  style={styles.navButton}
                />
              )}

              {currentStep < steps.length - 1 ? (
                <MagicButton
                  title="Next →"
                  onPress={() => setCurrentStep(currentStep + 1)}
                  variant="primary"
                  size="medium"
                  disabled={!canProceed()}
                  style={[styles.navButton, styles.primaryButton]}
                />
              ) : (
                <MagicButton
                  title={isSaving ? "Creating..." : "✨ Create Character"}
                  onPress={handleSave}
                  variant="gold"
                  size="medium"
                  disabled={!canProceed() || isSaving}
                  style={[styles.navButton, styles.primaryButton]}
                />
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: Math.min(width * 0.92, 420),
    maxHeight: height * 0.85,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  modalContent: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(200, 166, 255, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 166, 255, 0.2)',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(200, 166, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotActive: {
    backgroundColor: Colors.lilac,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  stepLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  stepLabelActive: {
    color: Colors.lilac,
    fontWeight: '600',
  },
  formScroll: {
    maxHeight: height * 0.5,
  },
  formContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(200, 166, 255, 0.2)',
  },
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.md,
  },
  textAreaLarge: {
    minHeight: 120,
    paddingTop: Spacing.md,
  },
  inputHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    backgroundColor: 'rgba(200, 166, 255, 0.3)',
    borderColor: Colors.lilac,
  },
  emojiText: {
    fontSize: 20,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeOption: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    backgroundColor: 'rgba(200, 166, 255, 0.2)',
    borderColor: Colors.lilac,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  typeLabelSelected: {
    color: Colors.lilac,
    fontWeight: '600',
  },
  previewCard: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  previewGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(200, 166, 255, 0.3)',
  },
  previewEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  previewName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  previewTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.lilac,
    fontStyle: 'italic',
  },
  musicBadge: {
    marginTop: Spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(230, 216, 168, 0.2)',
    borderRadius: BorderRadius.full,
  },
  musicBadgeText: {
    fontSize: 11,
    color: Colors.starlight,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 166, 255, 0.2)',
  },
  navButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 2,
  },
});

export default AddCharacterModal;
