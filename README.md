# 🌙 Moonlit Tales for My Princess

*A magical kingdom of stories, crafted by your love.*

## Overview

Moonlit Tales is a personalized, romantic bedtime storytelling app built for Pratima. Every story is lovingly crafted through AI, narrated with a soft voice, and wrapped in a dreamy, fluid, moonlit UI.

## Features

- **5 Story Modes**:
  - 💜 **Romance Stories** - Gentle, poetic, deeply romantic bedtime stories
  - 🏰 **Royal Quests** - Fantasy adventures with a romantic core
  - 😴 **Sleepy Short Tales** - Very short, calming micro stories
  - ✨ **Custom Stories** - Create stories with your own themes
  - 😂 **Gossip Mode** - Playful tales with the chaotic court characters

- **AI-Powered Stories**: Uses OpenAI GPT-4 for story generation
- **Voice Narration**: ElevenLabs text-to-speech with Prince/Narrator voices
- **Beautiful UI**: Fluid moonlit animations, floating sparkles, parallax effects
- **Saved Stories**: Local storage for all your favorite tales
- **Character Gallery**: Meet the royal couple and chaotic court

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- OpenAI API key (required for story generation)
- ElevenLabs API key (optional, for voice narration)

### Installation

```bash
cd moonlit-tales
npm install
```

### Running the App

```bash
npm start
```

Then:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan the QR code with Expo Go app on your phone

### API Keys Setup

1. Open the app
2. Go to Settings (⚙️ icon)
3. Enter your OpenAI API key
4. (Optional) Enter your ElevenLabs API key for voice narration
5. Tap "Save API Keys"

## Project Structure

```
moonlit-tales/
├── App.tsx                 # Main app entry with navigation
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AnimatedBackground.tsx
│   │   ├── GlowingCard.tsx
│   │   └── MagicButton.tsx
│   ├── screens/            # App screens
│   │   ├── WelcomeScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── StoryGeneratorScreen.tsx
│   │   ├── StoryReaderScreen.tsx
│   │   ├── CharacterGalleryScreen.tsx
│   │   ├── SavedStoriesScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # API and storage services
│   │   ├── openai.ts       # OpenAI story generation
│   │   ├── elevenlabs.ts   # ElevenLabs voice synthesis
│   │   └── storage.ts      # AsyncStorage for local data
│   ├── types/              # TypeScript type definitions
│   └── utils/
│       └── theme.ts        # Design system (colors, typography)
```

## Design System

### Colors
- **Primary**: Deep Moonlit Purple (#311C4B)
- **Gradient**: Midnight Blue → Amethyst (#1A0A2A → #5E3AA8)
- **Accents**: Starlight Gold (#E6D8A8), Soft Lilac (#C8A6FF)
- **Highlights**: Misty Silver (#DDE3F3)

### Motion Principles
- All transitions: 300-800ms
- Gentle parallax effects
- Stars drift subtly
- Cards "glide" into view

## Characters

### Royal Couple
- 👑 **Queen Pratima** - The beloved Queen of the moonlit kingdom
- 🤴 **Prince Pranav** - The devoted Prince and Story Weaver

### Chaotic Court (Gossip Mode only)
- 🐲 **Lanka** - Overconfident fog-ogre knight
- 🦜 **Jinal** - Parrot witch of gossip
- 🌧️ **Pavani** - Weeping willow spirit
- 📜 **Ramaya** - Scholar with useless magical degree

## License

Made with 💜 for Princess Pratima

---

*"Every story ends with you falling asleep, feeling loved"*
