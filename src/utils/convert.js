/* import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const CrossStitchPattern = () => {
  const [imageUri, setImageUri] = useState(null);
  const [pattern, setPattern] = useState([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      generatePattern(result.assets[0].uri);
    }
  };

  const generatePattern = async (uri) => {
    const img = await new Promise((resolve, reject) => {
      const imgElement = new Image();
      imgElement.src = uri;
      imgElement.onload = () => resolve(imgElement);
      imgElement.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const maxSize = 64; // Cambia este valor según lo que necesites
    const scaledSize = calculateAspectRatioFit(img.width, img.height, maxSize, maxSize);
    canvas.width = scaledSize.width;
    canvas.height = scaledSize.height;

    ctx.drawImage(img, 0, 0, scaledSize.width, scaledSize.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const newPattern = [];
    for (let y = 0; y < canvas.height; y++) {
      const row = [];
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4; // RGBA
        const color = `rgba(${imageData[index]}, ${imageData[index + 1]}, ${imageData[index + 2]}, 1)`;
        row.push(color);
      }
      newPattern.push(row);
    }

    setPattern(newPattern);
  };

  const calculateAspectRatioFit = (srcWidth, srcHeight, maxWidth, maxHeight) => {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {
      width: Math.floor(srcWidth * ratio),
      height: Math.floor(srcHeight * ratio),
    };
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Text style={styles.button}>Select Image</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <View style={styles.pattern}>
        {pattern.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.patternRow}>
            {row.map((color, colIndex) => (
              <View key={colIndex} style={[styles.pixel, { backgroundColor: color }]} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#201a20',
  },
  button: {
    padding: 10,
    backgroundColor: '#6200ee',
    color: 'white',
    borderRadius: 5,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  pattern: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternRow: {
    flexDirection: 'row',
  },
  pixel: {
    width: 10, // Tamaño del pixel, puedes ajustar esto
    height: 10,
  },
});

export default CrossStitchPattern;
 */