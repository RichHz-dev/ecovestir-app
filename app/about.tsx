import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#00a63e';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre Nosotros Ecovestir</Text>
        <View style={styles.placeholder} />
      </View> */}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Sobre Ecovestir</Text>
          <Text style={styles.heroDescription}>
            Pioneros en moda sostenible, creando ropa orgánica que cuida tu piel y protege nuestro planeta.
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>6+</Text>
            <Text style={styles.statLabel}>Años de{'\n'}Experiencia</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>50k+</Text>
            <Text style={styles.statLabel}>Clientes{'\n'}Felices</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Orgánico</Text>
          </View>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuestra Misión</Text>
          <Text style={styles.sectionText}>
            En Ecovestir, creemos que la moda debe ser hermosa, cómoda y responsable. Nuestra misión es democratizar el acceso a ropa orgánica de alta calidad, demostrando que es posible vestir se bien sin sacrificar el planeta. Además, apoyamos a los comunidades productoras.
          </Text>
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuestro Equipo</Text>
          
          {/* Team Member 1 */}
          <View style={styles.teamMember}>
            <Image
              source={require('@/assets/images/react-logo.png')}
              style={styles.teamImage}
            />
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>Ricardo Huaman</Text>
              <Text style={styles.teamRole}>Fundador & CEO</Text>
              <Text style={styles.teamDescription}>
                Apasionado por la moda sostenible con 6 años de experiencia.
              </Text>
            </View>
          </View>

          {/* Team Member 2 */}
          <View style={styles.teamMember}>
            <Image
              source={require('@/assets/images/react-logo.png')}
              style={styles.teamImage}
            />
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>Anthony Obregon</Text>
              <Text style={styles.teamRole}>Cofundador & CEO</Text>
              <Text style={styles.teamDescription}>
                Diseñador textil especializado en materiales orgánicos y producción ética.
              </Text>
            </View>
          </View>

          {/* Team Member 3 */}
          {/* <View style={styles.teamMember}>
            <Image
              source={require('@/assets/images/react-logo.png')}
              style={styles.teamImage}
            />
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>Andrea Peña</Text>
              <Text style={styles.teamRole}>Directora de Sostenibilidad</Text>
              <Text style={styles.teamDescription}>
                Experta en certificaciones orgánicas y cadena de suministro responsable.
              </Text>
            </View>
          </View> */}
        </View>

        {/* Values Section */}
        <View style={styles.valuesSection}>
          <Text style={styles.sectionTitle}>Nuestros Valores y Certificaciones</Text>
          
          <View style={styles.valuesContainer}>
            <Text style={styles.valuesSubtitle}>Lo Que Nos Define</Text>

            {/* Value 1 */}
            <View style={styles.valueItem}>
              <Ionicons name="shield-checkmark" size={28} color={GREEN} style={styles.valueIcon} />
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>Transparencia Total</Text>
                <Text style={styles.valueDescription}>
                  Conoce exactamente de dónde viene cada prenda y cómo se fabrica.
                </Text>
              </View>
            </View>

            {/* Value 2 */}
            <View style={styles.valueItem}>
              <Ionicons name="repeat" size={28} color={GREEN} style={styles.valueIcon} />
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>Economía Circular</Text>
                <Text style={styles.valueDescription}>
                  Diseños duraderos y programas de reciclaje para extender la vida útil.
                </Text>
              </View>
            </View>

            {/* Value 3 */}
            <View style={styles.valueItem}>
              <Ionicons name="diamond" size={28} color={GREEN} style={styles.valueIcon} />
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>Calidad Premium</Text>
                <Text style={styles.valueDescription}>
                  Materiales de la más alta calidad con acabados artesanales.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Certifications */}
        <View style={styles.certificationsSection}>
          <View style={styles.certificationsContainer}>
            <Text style={styles.certificationsTitle}>Certificaciones</Text>
            
            <View style={styles.certificationsGrid}>
              <View style={styles.certificationCard}>
                <Ionicons name="leaf" size={32} color={GREEN} />
                <Text style={styles.certificationName}>GOTS</Text>
                <Text style={styles.certificationDesc}>Global Organic{'\n'}Textile Standard</Text>
              </View>

              <View style={styles.certificationCard}>
                <Ionicons name="checkmark-circle" size={32} color={GREEN} />
                <Text style={styles.certificationName}>OEKO-TEX</Text>
                <Text style={styles.certificationDesc}>Standard 100{'\n'}Certification</Text>
              </View>

              <View style={styles.certificationCard}>
                <Ionicons name="diamond" size={32} color={GREEN} />
                <Text style={styles.certificationName}>Fair Trade</Text>
                <Text style={styles.certificationDesc}>Comercio Justo{'\n'}Certificado</Text>
              </View>

              <View style={styles.certificationCard}>
                <Ionicons name="business" size={32} color={GREEN} />
                <Text style={styles.certificationName}>B-Corp</Text>
                <Text style={styles.certificationDesc}>Empresa B{'\n'}Certificada</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Community Section */}
        <View style={styles.communitySection}>
          <Text style={styles.communityTitle}>Únete a Nuestra Comunidad</Text>
          <Text style={styles.communityDescription}>
            Sé parte del movimiento hacia una moda más consciente y sostenible. Juntos podemos crear un futuro mejor para nuestro planeta. ¡Tu impacto es nuestra fuerza!
          </Text>

          <TouchableOpacity 
            style={styles.communityButton}
            onPress={() => router.push('/products')}
          >
            <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
            <Text style={styles.communityButtonText}>Explorar Colección</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="mail-outline" size={20} color={GREEN} />
            <Text style={styles.contactButtonText}>Contactar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1F2937',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  heroSection: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 48,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 15,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: -24,
  },
  statCard: {
    backgroundColor: '#f9fafb9f',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: GREEN,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 15,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
  },
  teamMember: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#E5E7EB',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  teamRole: {
    fontSize: 14,
    fontWeight: '600',
    color: GREEN,
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  valuesSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  valuesContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
  },
  valuesSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  valueItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  valueIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  valueDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  certificationsSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  certificationsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
  },
  certificationsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  certificationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  certificationCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  certificationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  certificationDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  communitySection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
  },
  communityTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  communityDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  communityButton: {
    flexDirection: 'row',
    backgroundColor: GREEN,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
    marginBottom: 12,
  },
  communityButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  contactButton: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: GREEN,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 25,
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  contactButtonText: {
    color: GREEN,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});
