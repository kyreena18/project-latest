import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { UserCog, GraduationCap } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <GraduationCap size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Campus Connect</Text>
          <Text style={styles.subtitle}>Home Page</Text>
        </View>
        
        <Text style={styles.loginPrompt}>Choose your login type</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/admin-login')}
          >
            <View style={styles.buttonContent}>
              <UserCog size={32} color="#007AFF" />
              <Text style={styles.buttonText}>Admin Login</Text>
              <Text style={styles.buttonSubtext}>Access admin features</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/student-login')}
          >
            <View style={styles.buttonContent}>
              <GraduationCap size={32} color="#007AFF" />
              <Text style={styles.buttonText}>Student Login</Text>
              <Text style={styles.buttonSubtext}>Access student portal</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '95%',
    maxWidth: 380,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  loginPrompt: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 6,
    textAlign: 'center',
  },
  buttonSubtext: {
    fontSize: 13,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 4,
  },
});