import { showGlobalError } from '@/components/error-modal';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const logo = require('../assets/logo.png');

export default function LoginScreen() {
  const { login, register } = useAuth();
  const router = useRouter();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  // Separate state for login and register so inputs are preserved when switching modes
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerAcceptTerms, setRegisterAcceptTerms] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Name: letters, accents, spaces, apostrophes and hyphens
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]{2,}$/u;
  // Password: at least 6 chars, includes letters and numbers
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

  const handleSubmit = async () => {
    // Use mode-specific values
    const name = mode === 'register' ? registerName : '';
    const email = mode === 'register' ? registerEmail : loginEmail;
    const password = mode === 'register' ? registerPassword : loginPassword;
    const confirm = mode === 'register' ? registerConfirm : '';
    const accepted = mode === 'register' ? registerAcceptTerms : true;

    // Validaciones
    if (mode === 'register') {
      if (!name.trim()) {
        showGlobalError({ title: 'Error', message: 'Por favor ingresa tu nombre', primaryText: 'Entendido' });
        return;
      }
      if (!nameRegex.test(name.trim())) {
        showGlobalError({ title: 'Error', message: 'El nombre solo debe contener letras, espacios, guiones o apóstrofes', primaryText: 'Entendido' });
        return;
      }
    }

    if (!email.trim()) {
      showGlobalError({ title: 'Error', message: 'Por favor ingresa tu email', primaryText: 'Entendido' });
      return;
    }

    if (!validateEmail(email)) {
      showGlobalError({ title: 'Error', message: 'Por favor ingresa un email válido', primaryText: 'Entendido' });
      return;
    }

    if (!password) {
      showGlobalError({ title: 'Error', message: 'Por favor ingresa tu contraseña', primaryText: 'Entendido' });
      return;
    }

    // Only enforce complexity/length for registrations. For login, only require a non-empty password.
    if (mode === 'register' && !passwordRegex.test(password)) {
      showGlobalError({ title: 'Error', message: 'La contraseña debe tener al menos 6 caracteres e incluir letras y números', primaryText: 'Entendido' });
      return;
    }

    if (mode === 'register' && password !== confirm) {
      showGlobalError({ title: 'Error', message: 'Las contraseñas no coinciden', primaryText: 'Entendido' });
      return;
    }

    if (mode === 'register' && !accepted) {
      showGlobalError({ title: 'Error', message: 'Debes aceptar los términos y condiciones', primaryText: 'Entendido' });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(loginEmail.toLowerCase().trim(), loginPassword);
        showGlobalError({ title: 'Éxito', message: 'Sesión iniciada correctamente', primaryText: 'Continuar', onPrimary: () => router.replace('/(tabs)') });
      } else {
        await register(registerName.trim(), registerEmail.toLowerCase().trim(), registerPassword);
        showGlobalError({ title: 'Éxito', message: 'Cuenta creada correctamente', primaryText: 'Continuar', onPrimary: () => router.replace('/(tabs)') });
      }
    } catch (error: any) {
      showGlobalError({ title: 'Error', message: error.message || 'Ocurrió un error', primaryText: 'Entendido' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.logoText}>Ecovestir</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Accede a tu cuenta</Text>

          <View style={styles.tabRow}>
            <TouchableOpacity onPress={() => setMode('login')} style={[styles.tab, mode === 'login' && styles.tabActive]}>
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('register')} style={[styles.tab, mode === 'register' && styles.tabActive]}>
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          {mode === 'register' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Nombre completo</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  value={registerName}
                  onChangeText={(text) => {
                    // allow only letters, accents, spaces, apostrophe and hyphen
                    const cleaned = text.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'\-]/g, '');
                    setRegisterName(cleaned);
                  }}
                  placeholder="Tu nombre completo"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                value={mode === 'login' ? loginEmail : registerEmail}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\s/g, '').toLowerCase();
                  if (mode === 'login') setLoginEmail(cleaned);
                  else setRegisterEmail(cleaned);
                }}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                value={mode === 'login' ? loginPassword : registerPassword}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[\x00-\x1F]/g, '');
                  if (mode === 'login') setLoginPassword(cleaned);
                  else setRegisterPassword(cleaned);
                }}
                placeholder="........"
                secureTextEntry={!showPassword}
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'register' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirmar contraseña</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  value={registerConfirm}
                  onChangeText={(text) => setRegisterConfirm(text.replace(/[\x00-\x1F]/g, ''))}
                  placeholder="........"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          )}

          {mode === 'login' && (
            <TouchableOpacity style={styles.forgotLink} onPress={() => {}}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          )}

          {mode === 'register' && (
            <TouchableOpacity 
              style={styles.termsContainer} 
              onPress={() => setRegisterAcceptTerms(!registerAcceptTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, registerAcceptTerms && styles.checkboxActive]}>
                {registerAcceptTerms && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.termsText}>
                Acepto los{' '}
                <Text style={styles.termsLink}>términos y condiciones</Text>
                {' '}y la{' '}
                <Text style={styles.termsLink}>política de privacidad</Text>
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Text>
            )}
          </TouchableOpacity>

          {mode === 'login' ? (
            <View style={styles.bottomNote}>
              <Text style={styles.small}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => setMode('register')}>
                <Text style={styles.inlineLinkText}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bottomNote}>
              <Text style={styles.small}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => setMode('login')}>
                <Text style={styles.inlineLinkText}>Inicia sesión aquí</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.backButtonText}>Volver al Inicio</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const GREEN = '#00a63e';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E8F5EE' },
  container: { padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: '100%' },
  header: { marginTop: 20, marginBottom: 24, alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 44, height: 44 },
  logoText: { fontSize: 28, fontWeight: '700', color: '#1f2937' },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#1f2937', textAlign: 'center' },
  tabRow: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 10, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { color: '#6b7280', fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: GREEN, fontWeight: '700' },
  inputWrapper: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#111827' },
  eyeButton: { padding: 4, marginLeft: 4 },
  forgotLink: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 8 },
  forgotText: { color: GREEN, fontSize: 13, fontWeight: '500' },
  primaryButton: { backgroundColor: GREEN, marginTop: 8, paddingVertical: 14, borderRadius: 10, alignItems: 'center', shadowColor: GREEN, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  bottomNote: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  small: { color: '#6b7280', fontSize: 14 },
  inlineLinkText: { color: GREEN, fontSize: 14, fontWeight: '600' },
  backButton: { width: '100%', maxWidth: 400, marginTop: 20, borderWidth: 2, borderColor: GREEN, borderRadius: 10, paddingVertical: 14, alignItems: 'center', backgroundColor: 'transparent' },
  backButtonText: { color: GREEN, fontSize: 16, fontWeight: '600' },
  termsContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, marginTop: 4 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#d1d5db', marginRight: 10, marginTop: 2, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: GREEN, borderColor: GREEN },
  termsText: { flex: 1, fontSize: 13, color: '#6b7280', lineHeight: 18 },
  termsLink: { color: GREEN, fontWeight: '600' }
});
