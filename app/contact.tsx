import { showGlobalError } from '@/components/error-modal';
import VoiceflowChat from '@/components/voiceflow-chat';
import { sendContactMessage } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#00a63e';

const MOTIVOS = [
  'Informacion del producto',
  'Consulta sobre pedido',
  'Devolucion/Cambio',
  'Sostenibilidad',
  'Ventas por mayor',
  'Prensa/Media',
  'Otro',
];

export default function ContactScreen() {
  const [showChat, setShowChat] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    motivo: '',
    asunto: '',
    mensaje: '',
  });
  const [loading, setLoading] = useState(false);
  const [showMotivoSelector, setShowMotivoSelector] = useState(false);

  const handleSubmit = async () => {
    // Basic required checks
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.mensaje) {
      showGlobalError({ title: 'Error', message: 'Por favor completa todos los campos obligatorios', primaryText: 'Entendido' });
      return;
    }

    // Validate name and subject only contain letters and spaces
    const lettersRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/u;
    if (!lettersRegex.test(formData.nombre.trim())) {
      showGlobalError({ title: 'Error', message: 'El nombre solo debe contener letras y espacios', primaryText: 'Entendido' });
      return;
    }
    if (formData.asunto && !lettersRegex.test(formData.asunto.trim())) {
      showGlobalError({ title: 'Error', message: 'El asunto solo debe contener letras y espacios', primaryText: 'Entendido' });
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showGlobalError({ title: 'Error', message: 'Por favor ingresa un correo electrónico válido', primaryText: 'Entendido' });
      return;
    }

    // Normalize phone: only digits
    const phoneDigits = (formData.telefono || '').toString().replace(/\D/g, '');
    if (phoneDigits.length !== 9) {
      showGlobalError({ title: 'Error', message: 'El teléfono debe tener exactamente 9 dígitos', primaryText: 'Entendido' });
      return;
    }

    // motivo required
    if (!formData.motivo) {
      showGlobalError({ title: 'Error', message: 'Por favor selecciona un motivo de contacto', primaryText: 'Entendido' });
      return;
    }

    // mensaje must be a string
    if (typeof formData.mensaje !== 'string' || formData.mensaje.trim().length === 0) {
      showGlobalError({ title: 'Error', message: 'El mensaje debe ser texto', primaryText: 'Entendido' });
      return;
    }

    try {
      setLoading(true);
      await sendContactMessage({
        name: formData.nombre.trim(),
        email: formData.email.trim(),
        phone: phoneDigits,
        reason: formData.motivo as any,
        subject: formData.asunto ? formData.asunto.trim() : '',
        message: formData.mensaje.trim(),
      });

      showGlobalError({ title: 'Éxito', message: 'Tu mensaje ha sido enviado. Te contactaremos pronto.', primaryText: 'Entendido' });
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        motivo: '',
        asunto: '',
        mensaje: '',
      });
    } catch (error: any) {
      showGlobalError({ title: 'Error', message: error.message || 'No se pudo enviar el mensaje. Intenta de nuevo.', primaryText: 'Entendido' });
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    // Open WhatsApp to the configured number. Use international format (country code +51 for Peru).
    const number = '51982314461'; // +51 982314461
    const appUrl = `whatsapp://send?phone=${number}`;
    const webUrl = `https://wa.me/${number}`;

    Linking.canOpenURL(appUrl)
      .then((supported) => {
        if (supported) return Linking.openURL(appUrl);
        return Linking.openURL(webUrl);
      })
      .catch((err) => {
        console.error('Error opening WhatsApp:', err);
        showGlobalError({ title: 'Error', message: 'No se pudo abrir WhatsApp en este dispositivo', primaryText: 'Entendido' });
      });
  };

  

  const handleChat = () => {
    setShowChat(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Contáctanos</Text>
          <Text style={styles.heroSubtitle}>
            ¿Tienes preguntas sobre nuestros productos orgánicos? Estamos aquí para ayudarte.
          </Text>
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <View style={styles.formHeader}>
            <Ionicons name="mail-outline" size={24} color={GREEN} />
            <Text style={styles.formTitle}>Envíanos un Mensaje</Text>
          </View>

          {/* Nombre Completo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu nombre"
              placeholderTextColor="#9CA3AF"
              value={formData.nombre}
              onChangeText={(text) => {
                // allow letters, accents, spaces, apostrophes and dashes only
                const cleaned = text.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '');
                setFormData({ ...formData, nombre: cleaned });
              }}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => {
                // remove spaces and illegal characters for emails
                const cleaned = text.replace(/[^\w.@+\-]/g, '');
                setFormData({ ...formData, email: cleaned });
              }}
            />
          </View>

          {/* Teléfono */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="(+51) 999999999"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={formData.telefono}
              onChangeText={(text) => {
                // allow only digits and limit to 9 characters
                const cleaned = text.replace(/\D/g, '').slice(0, 9);
                setFormData({ ...formData, telefono: cleaned });
              }}
            />
          </View>

          {/* Motivo de Contacto */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Motivo de Contacto</Text>
            <TouchableOpacity 
              style={styles.selectContainer}
              onPress={() => setShowMotivoSelector(!showMotivoSelector)}
            >
              <Text style={[styles.selectText, formData.motivo && styles.selectTextActive]}>
                {formData.motivo || 'Selecciona un motivo'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            {/* Motivo Options */}
            {showMotivoSelector && (
              <ScrollView style={styles.optionsContainer} nestedScrollEnabled>
                {MOTIVOS.map((motivo) => (
                  <TouchableOpacity
                    key={motivo}
                    style={styles.optionItem}
                    onPress={() => {
                      setFormData({ ...formData, motivo });
                      setShowMotivoSelector(false);
                    }}
                  >
                    <Text style={styles.optionText}>{motivo}</Text>
                    {formData.motivo === motivo && (
                      <Ionicons name="checkmark" size={20} color={GREEN} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Asunto */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Asunto</Text>
            <TextInput
              style={styles.input}
              placeholder="Asunto de tu mensaje"
              placeholderTextColor="#9CA3AF"
              value={formData.asunto}
              onChangeText={(text) => {
                // allow only letters and spaces for subject
                const cleaned = text.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '');
                setFormData({ ...formData, asunto: cleaned });
              }}
            />
          </View>

          {/* Mensaje */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mensaje</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escribe tu mensaje aquí..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={formData.mensaje}
              onChangeText={(text) => {
                // strip control characters
                const cleaned = text.replace(/[\x00-\x1F]/g, '');
                setFormData({ ...formData, mensaje: cleaned });
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Enviar Mensaje</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Office Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="location" size={24} color={GREEN} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Nuestra Oficina</Text>
              <Text style={styles.infoText}>Av. Sostenibilidad 123, Piso 4</Text>
              <Text style={styles.infoText}>Ciudad Verde, País CR, 12345</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={24} color={GREEN} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Teléfono</Text>
              <Text style={styles.infoText}>+ (566) 123-4567</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail" size={24} color={GREEN} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Email</Text>
              <Text style={styles.infoText}>hola@ecovestir.com</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="time" size={24} color={GREEN} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Horarios de Atención</Text>
              <Text style={styles.infoText}>Lunes - Viernes: 9:00 - 18:00</Text>
              <Text style={styles.infoText}>Sábados: 10:00 - 14:00</Text>
            </View>
          </View>
        </View>

        {/* Quick Support */}
        <View style={styles.supportSection}>
          <View style={styles.supportHeader}>
            <Ionicons name="flash" size={24} color={GREEN} />
            <Text style={styles.supportTitle}>Soporte Rápido</Text>
          </View>

          <TouchableOpacity style={styles.supportButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#FFFFFF" />
            <Text style={styles.supportButtonText}>Llamar Ahora</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportButtonOutline} onPress={handleChat}>
            <Ionicons name="chatbubbles" size={20} color={GREEN} />
            <Text style={styles.supportButtonOutlineText}>Chat en Vivo</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Preguntas Frecuentes</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>¿Qué hace que la ropa sea orgánica?</Text>
            <Text style={styles.faqAnswer}>
              Nuestra ropa orgánica está fabricada con materiales cultivados sin pesticidas,
              fertilizantes sintéticos o químicos nocivos, certificados bajo estándares
              internacionales como GOTS.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>¿Ofrecen envío gratuito?</Text>
            <Text style={styles.faqAnswer}>
              Sí, ofrecemos envío gratuito en pedidos superiores a S/75. Pero pedidos menores, el
              costo de envío es de S/8.99.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>¿Cuál es su política de devoluciones?</Text>
            <Text style={styles.faqAnswer}>
              Aceptamos devoluciones dentro de 30 días desde la compra. Los artículos deben estar
              en condición original con etiquetas.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Chatbot modal */}
      {showChat && <VoiceflowChat onClose={() => setShowChat(false)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  heroSection: {
    backgroundColor: GREEN,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 22,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  selectContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 15,
    color: '#6B7280',
  },
  selectTextActive: {
    color: '#1F2937',
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    marginBottom: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionText: {
    fontSize: 15,
    color: '#1F2937',
  },
  submitButton: {
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 8,
    shadowColor: GREEN,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  supportSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 24,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  supportButton: {
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  supportButtonOutline: {
    borderWidth: 2,
    borderColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  supportButtonOutlineText: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  faqSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  faqTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'justify',
  },
  bottomSpacer: {
    height: 40,
  },
});
