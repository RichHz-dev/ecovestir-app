import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GREEN = '#00a63e';

interface ProductCardProps {
  id?: string;
  name: string;
  price: number;
  rating: number;
  image: any;
  isOrganic?: boolean;
  onPress?: () => void;
}

export function ProductCard({ id, name, price, rating, image, isOrganic = true, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {isOrganic && (
        <View style={styles.organicBadge}>
          <Ionicons name="leaf" size={16} color="#FFFFFF" />
        </View>
      )}
      <Image source={image} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Text key={i} style={styles.star}>
              {i < Math.floor(rating) ? '★' : '☆'}
            </Text>
          ))}
          <Text style={styles.ratingCount}>({rating})</Text>
        </View>
        <Text style={styles.price}>${price}</Text>
        {/* <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ver Detalles</Text>
        </TouchableOpacity> */}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  organicBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: GREEN,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  star: {
    color: '#FFA500',
    fontSize: 12,
    marginRight: 2,
  },
  ratingCount: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  // button: {
  //   borderWidth: 1.5,
  //   borderColor: GREEN,
  //   borderRadius: 20,
  //   paddingVertical: 8,
  //   alignItems: 'center',
  // },
  // buttonText: {
  //   color: GREEN,
  //   fontSize: 13,
  //   fontWeight: '600',
  // },
});
