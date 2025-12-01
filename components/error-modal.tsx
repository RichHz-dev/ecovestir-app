import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SOFT_GREEN = '#40bd74ff';

type ErrorOptions = {
  title?: string;
  message?: string;
  primaryText?: string;
  onPrimary?: () => void;
  secondaryText?: string;
  onSecondary?: () => void;
};

type ErrorContextValue = {
  showError: (opts: ErrorOptions) => void;
  hideError: () => void;
};

const ErrorModalContext = createContext<ErrorContextValue | null>(null);

let __globalShow: ((opts: ErrorOptions) => void) | null = null;
export const showGlobalError = (opts: ErrorOptions) => {
  if (__globalShow) return __globalShow(opts);
  // fallback
  console.warn('showGlobalError called before modal mounted', opts);
};

export const ErrorModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<ErrorOptions>({});

  const showError = useCallback((options: ErrorOptions) => {
    setOpts(options || {});
    setVisible(true);
  }, []);

  const hideError = useCallback(() => {
    setVisible(false);
    setOpts({});
  }, []);

  useEffect(() => {
    __globalShow = showError;
    return () => { __globalShow = null; };
  }, [showError]);

  const onPrimary = useCallback(() => {
    try { opts.onPrimary && opts.onPrimary(); } finally { hideError(); }
  }, [opts, hideError]);

  const onSecondary = useCallback(() => {
    try { opts.onSecondary && opts.onSecondary(); } finally { hideError(); }
  }, [opts, hideError]);

  return (
    <ErrorModalContext.Provider value={{ showError, hideError }}>
      {children}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.iconWrap}>
                  <View style={styles.iconCircle}><Ionicons name="alert-circle" size={34} color="#fff" /></View>
            </View>
            <Text style={styles.title}>{opts.title || 'Error de Conexión'}</Text>
            {opts.message ? <Text style={styles.message}>{opts.message}</Text> : null}

            <View style={styles.buttonsRow}>
              {opts.secondaryText ? (
                <TouchableOpacity style={styles.secondaryBtn} onPress={onSecondary}>
                  <Text style={styles.secondaryText}>{opts.secondaryText}</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity style={styles.primaryBtn} onPress={onPrimary}>
                <Text style={styles.primaryText}>{opts.primaryText || 'Entendido'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ErrorModalContext.Provider>
  );
};

export const useErrorModal = () => {
  const ctx = useContext(ErrorModalContext);
  if (!ctx) throw new Error('useErrorModal must be used within ErrorModalProvider');
  return ctx;
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 12, padding: 18, alignItems: 'center' },
  iconWrap: { marginTop: -48, marginBottom: 8 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: SOFT_GREEN || Colors.light.tint || '#00a63e', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', marginTop: 8, color: '#111827', textAlign: 'center' },
  message: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },
  buttonsRow: { flexDirection: 'row', marginTop: 18, width: '100%', justifyContent: 'flex-end' },
  primaryBtn: { backgroundColor: SOFT_GREEN || Colors.light.tint || '#00a63e', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  secondaryText: { color: SOFT_GREEN || Colors.light.tint || '#00a63e', fontWeight: '700' },
});

export default null;
