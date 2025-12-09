// 🌙 Moonlit Tales - Animated Background with Stars and Sparkles
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../utils/theme';

const { width, height } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  duration: number;
}

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  intensity = 'medium',
}) => {
  const starCount = intensity === 'low' ? 20 : intensity === 'medium' ? 40 : 60;
  const starsRef = useRef<Star[]>([]);

  // Initialize stars
  if (starsRef.current.length === 0) {
    starsRef.current = Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      opacity: new Animated.Value(Math.random()),
      duration: Math.random() * 3000 + 2000,
    }));
  }

  useEffect(() => {
    // Animate each star's opacity
    starsRef.current.forEach((star) => {
      const twinkle = () => {
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.5 + 0.5,
            duration: star.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.3 + 0.1,
            duration: star.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]).start(() => twinkle());
      };
      twinkle();
    });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.background as any}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Stars Layer */}
      <View style={styles.starsContainer}>
        {starsRef.current.map((star) => (
          <Animated.View
            key={star.id}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity: star.opacity,
              },
            ]}
          />
        ))}
      </View>

      {/* Sparkles Layer */}
      <SparklesLayer />

      {/* Moon Glow */}
      <View style={styles.moonGlow} />

      {/* Content */}
      {children}
    </View>
  );
};

// Floating sparkles component
const SparklesLayer: React.FC = () => {
  const sparkles = useRef(
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    sparkles.forEach((sparkle, index) => {
      const animateSparkle = () => {
        // Reset position
        sparkle.translateY.setValue(0);
        sparkle.opacity.setValue(0);
        sparkle.scale.setValue(0);

        // Animate
        Animated.parallel([
          Animated.timing(sparkle.translateY, {
            toValue: -100,
            duration: 4000 + index * 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(sparkle.opacity, {
              toValue: 0.8,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.opacity, {
              toValue: 0,
              duration: 3000 + index * 200,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(sparkle.scale, {
              toValue: 1,
              duration: 500,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.scale, {
              toValue: 0,
              duration: 3500 + index * 200,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          // Randomize position for next animation
          sparkle.x = Math.random() * width;
          sparkle.y = Math.random() * height * 0.7 + height * 0.3;
          setTimeout(animateSparkle, Math.random() * 2000);
        });
      };

      setTimeout(animateSparkle, index * 300);
    });
  }, []);

  return (
    <View style={styles.sparklesContainer} pointerEvents="none">
      {sparkles.map((sparkle) => (
        <Animated.View
          key={sparkle.id}
          style={[
            styles.sparkle,
            {
              left: sparkle.x,
              top: sparkle.y,
              opacity: sparkle.opacity,
              transform: [
                { translateY: sparkle.translateY },
                { scale: sparkle.scale },
              ],
            },
          ]}
        >
          <View style={styles.sparkleCore} />
          <View style={styles.sparkleRayH} />
          <View style={styles.sparkleRayV} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: Colors.starlight,
  },
  sparklesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  sparkle: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleCore: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.starlight,
    position: 'absolute',
  },
  sparkleRayH: {
    width: 16,
    height: 2,
    backgroundColor: Colors.starlight,
    opacity: 0.6,
    position: 'absolute',
  },
  sparkleRayV: {
    width: 2,
    height: 16,
    backgroundColor: Colors.starlight,
    opacity: 0.6,
    position: 'absolute',
  },
  moonGlow: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(200, 166, 255, 0.08)',
  },
});

export default AnimatedBackground;
