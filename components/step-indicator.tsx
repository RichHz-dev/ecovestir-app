import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const GREEN = '#00a63e';
const GRAY = '#9CA3AF';
const DARK_GRAY = '#374151';

export default function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { key: 1, label: 'Envío' },
    { key: 2, label: 'Pago' },
    { key: 3, label: 'Confirmación' },
  ];

  return (
    <View style={styles.container}>
      {steps.map((s, i) => (
        <React.Fragment key={s.key}>
          <View style={styles.stepWrap}>
            <View style={[styles.circle, currentStep === s.key ? styles.circleActive : null]}>
              <Text style={[styles.number, currentStep === s.key ? styles.numberActive : null]}>{s.key}</Text>
            </View>
            <Text style={[styles.label, currentStep === s.key ? styles.labelActive : null]}>{s.label}</Text>
          </View>
          {i < steps.length - 1 ? <View style={styles.separator} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  stepWrap: { alignItems: 'center', width: 100 },
  circle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  circleActive: { backgroundColor: GREEN },
  number: { color: GRAY, fontWeight: '700' },
  numberActive: { color: '#fff' },
  label: { marginTop: 6, fontSize: 12, color: GRAY },
  labelActive: { color: DARK_GRAY, fontWeight: '700' },
  separator: { flex: 1, height: 1, backgroundColor: '#E5E7EB', marginHorizontal: -20 },
});
