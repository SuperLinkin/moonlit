// 🌙 Moonlit Tales - Saved Stories Screen
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import MagicButton from '../components/MagicButton';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animations } from '../utils/theme';
import { RootStackParamList, Story, STORY_MODES } from '../types';
import { getStories, deleteStory, toggleFavorite } from '../services/storage';

type SavedStoriesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SavedStories'>;

interface StoryItemProps {
  story: Story;
  index: number;
  onPress: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

const StoryItem: React.FC<StoryItemProps> = ({
  story,
  index,
  onPress,
  onDelete,
  onToggleFavorite,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: Animations.normal,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: Animations.normal,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const modeConfig = STORY_MODES[story.mode];
  const formattedDate = new Date(story.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleLongPress = () => {
    Alert.alert(
      'Delete Story',
      `Are you sure you want to delete "${story.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <Animated.View
      style={[
        styles.storyItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(94, 58, 168, 0.3)', 'rgba(49, 28, 75, 0.4)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.storyCard}
        >
          {/* Mode Icon */}
          <View style={[styles.modeIconContainer, { backgroundColor: `${modeConfig.color}20` }]}>
            <Text style={styles.modeIcon}>{modeConfig.icon}</Text>
          </View>

          {/* Story Info */}
          <View style={styles.storyInfo}>
            <Text style={styles.storyTitle} numberOfLines={1}>
              {story.title}
            </Text>
            <Text style={styles.storyPreview} numberOfLines={2}>
              {story.content.substring(0, 100)}...
            </Text>
            <View style={styles.storyMeta}>
              <Text style={[styles.modeLabel, { color: modeConfig.color }]}>
                {modeConfig.title}
              </Text>
              <Text style={styles.storyDate}>{formattedDate}</Text>
            </View>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onToggleFavorite}
          >
            <Text style={styles.favoriteIcon}>
              {story.isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>

          {/* Audio Indicator */}
          {story.audioUrl && (
            <View style={styles.audioIndicator}>
              <Text style={styles.audioIcon}>🎧</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SavedStoriesScreen: React.FC = () => {
  const navigation = useNavigation<SavedStoriesNavigationProp>();
  const [stories, setStories] = useState<Story[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  const loadStories = async () => {
    const loadedStories = await getStories();
    setStories(loadedStories);
  };

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStories();
    setRefreshing(false);
  };

  const handleStoryPress = (story: Story) => {
    navigation.navigate('StoryReader', { story });
  };

  const handleDeleteStory = async (id: string) => {
    await deleteStory(id);
    await loadStories();
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
    await loadStories();
  };

  const filteredStories =
    filter === 'favorites' ? stories.filter((s) => s.isFavorite) : stories;

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📚</Text>
      <Text style={styles.emptyTitle}>
        {filter === 'favorites' ? 'No Favorites Yet' : 'No Stories Yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'favorites'
          ? 'Tap the heart on stories you love to save them here'
          : 'Your magical tales will be stored here after you create them'}
      </Text>
      <MagicButton
        title="Create a Story"
        onPress={() => navigation.navigate('Home')}
        variant="primary"
        size="medium"
        style={styles.createButton}
      />
    </View>
  );

  return (
    <AnimatedBackground intensity="low">
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>📚</Text>
          <Text style={styles.headerTitle}>Your Library</Text>
          <Text style={styles.headerSubtitle}>
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} in your collection
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All Stories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'favorites' && styles.filterTabActive]}
            onPress={() => setFilter('favorites')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'favorites' && styles.filterTabTextActive,
              ]}
            >
              ❤️ Favorites
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stories List */}
        <FlatList
          data={filteredStories}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <StoryItem
              story={item}
              index={index}
              onPress={() => handleStoryPress(item)}
              onDelete={() => handleDeleteStory(item.id)}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.lilac}
            />
          }
        />

        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <MagicButton
            title="Back to Kingdom"
            onPress={() => navigation.goBack()}
            variant="secondary"
            size="small"
          />
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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
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
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(200, 166, 255, 0.1)',
  },
  filterTabActive: {
    backgroundColor: 'rgba(200, 166, 255, 0.3)',
  },
  filterTabText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: Colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  storyItem: {
    marginBottom: Spacing.md,
  },
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  modeIcon: {
    fontSize: 24,
  },
  storyInfo: {
    flex: 1,
  },
  storyTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  storyPreview: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
    lineHeight: Typography.fontSize.sm * 1.4,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  storyDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  favoriteButton: {
    padding: Spacing.sm,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  audioIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  audioIcon: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * 1.6,
    marginBottom: Spacing.xl,
  },
  createButton: {
    marginTop: Spacing.md,
  },
  backButtonContainer: {
    position: 'absolute',
    bottom: Spacing.xl,
    alignSelf: 'center',
  },
});

export default SavedStoriesScreen;
