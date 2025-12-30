// Mock implementation of React Native Reanimated for web
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

// Mock useSharedValue
export function useSharedValue(initialValue) {
  const value = useRef(new Animated.Value(initialValue));
  return value.current;
}

// Mock useAnimatedStyle
export function useAnimatedStyle(styleFunc) {
  return styleFunc();
}

// Mock withSpring
export function withSpring(value, config) {
  return value;
}

// Mock withTiming
export function withTiming(value, config) {
  return value;
}

// Mock withSequence
export function withSequence(...animations) {
  return animations[animations.length - 1];
}

// Mock Animated.View component
export default {
  View: Animated.View,
  Text: Animated.Text,
  ScrollView: Animated.ScrollView,
};

// Mock animation effects
export const FadeIn = {
  duration: (d) => FadeIn,
  delay: (d) => FadeIn,
};

export const FadeInDown = {
  duration: (d) => FadeInDown,
  delay: (d) => FadeInDown,
};

export const FadeInUp = {
  duration: (d) => FadeInUp,
  delay: (d) => FadeInUp,
};

export const SlideInLeft = {
  duration: (d) => SlideInLeft,
  delay: (d) => SlideInLeft,
};

export const SlideInRight = {
  duration: (d) => SlideInRight,
  delay: (d) => SlideInRight,
};
