import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import BottomMenu from '@/components/bottom-menu';
import { ErrorModalProvider } from '@/components/error-modal';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  return (
    <AuthProvider>
      <CartProvider>
        <ErrorModalProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <SafeAreaView style={styles.container} edges={['bottom']}>
              <View style={styles.outer}>
                <Stack initialRouteName="(tabs)">
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen name="products" options={{ headerShown: false }} />
                  <Stack.Screen name="categories" options={{ headerShown: false }} />
                  <Stack.Screen name="contact" options={{ headerShown: false }} />
                  <Stack.Screen name="cart" options={{ headerShown: false }} />
                  <Stack.Screen name="product-detail" options={{ headerShown: false }} />
                  <Stack.Screen name="about" options={{ headerShown: false }} />
                  <Stack.Screen name="reviews" options={{ headerStyle: { backgroundColor: '#FFFFFF' }, headerTitle: '', headerShadowVisible: false, headerTintColor: '#111827' }} />
                  <Stack.Screen name="checkout" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  <Stack.Screen name="checkout/payment" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />

                {/* Bottom menu - shown globally except on specific routes */}
                {(() => {
                  const hideOn = ['/login', '/modal', '/checkout', '/checkout/payment'];
                  const shouldHide = hideOn.some((p) => pathname?.startsWith(p));
                  if (shouldHide) return null;
                  return (
                    <View style={styles.menuWrap}>
                      <BottomMenu />
                    </View>
                  );
                })()}
              </View>
            </SafeAreaView>
          </ThemeProvider>
        </ErrorModalProvider>
      </CartProvider>
    </AuthProvider>
  );
}

const MENU_HEIGHT = 72;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  outer: { flex: 1, paddingBottom: MENU_HEIGHT },
  menuWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, height: MENU_HEIGHT },
});
