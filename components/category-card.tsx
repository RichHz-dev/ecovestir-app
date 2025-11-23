import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryCardProps {
  title: string;
  image: any;
  onPress?: () => void;
}

export function CategoryCard({ title, image, onPress }: CategoryCardProps) {
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <ImageBackground source={image} style={styles.background} imageStyle={styles.backgroundImage}>
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Text style={styles.title}>{capitalizedTitle}</Text>
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Ver Categoría</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  background: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backgroundImage: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    padding: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});
