import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { PixelCharacter, generatePixelArt } from '../utils/pixelCharacter';



export const PixelAvatar = ({ character, size = 128 }) => {
  if (character.customCharacterImage) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Image
          source={{ uri: character.customCharacterImage }}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
    );
  }

  const grid = generatePixelArt(character);
  const pixelSize = size / 16;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {grid.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((color, x) => (
            <View
              key={`${x}-${y}`}
              style={[
                styles.pixel,
                {
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: color,
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: '#2a2f4a',
  },
  row: {
    flexDirection: 'row',
  },
  pixel: {
  },
});

