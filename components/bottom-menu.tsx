import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

type Item = {
  key: string;
  label: string;
  icon: string;
  route: string;
};

const ITEMS: Item[] = [
  { key: 'home', label: 'Inicio', icon: 'home', route: '/' },
  { key: 'products', label: 'Productos', icon: 'shopping', route: '/products' },
  { key: 'reviews', label: 'Reseñas', icon: 'star-outline', route: '/reviews' },
  { key: 'contact', label: 'Contacto', icon: 'phone-outline', route: '/contact' },
  { key: 'about', label: 'Nosotros', icon: 'information-outline', route: '/about' },
];

export default function BottomMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const handlePress = (route: string) => {
    if (pathname === route) return;
    router.push(route as any);
  };

  const isActive = (route: string) => {
    if (route === '/') return pathname === '/' || pathname === '';
    return pathname?.startsWith(route);
  };

  return (
    <View style={styles.wrapper}>
      {ITEMS.map((it) => {
        const active = isActive(it.route);
        return (
          <TouchableOpacity
            key={it.key}
            style={styles.item}
            onPress={() => handlePress(it.route)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name={it.icon as any} size={22} color={active ? '#00a63e' : '#1F2937'} />
            <Text style={[styles.label, active ? styles.labelActive : null]}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.04,
    elevation: 4,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    color: '#374151',
    marginTop: 4,
  },
  labelActive: {
    color: '#00a63e',
    fontWeight: '700',
  },
});
