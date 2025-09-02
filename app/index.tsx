import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { UserCog, GraduationCap } from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
    paddingHorizontal: screenWidth * 0.05, // 5% padding on each side
    paddingVertical: screenHeight * 0.08, // 8% padding top/bottom
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: Math.min(screenWidth * 0.9, 400), // Max 90% width or 400px
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: screenHeight * 0.04, // 4% of screen height
  },
  logo: {
    width: Math.max(screenWidth * 0.15, 60), // 15% of width, min 60px
    height: Math.max(screenWidth * 0.15, 60),
    borderRadius: Math.max(screenWidth * 0.075, 30),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: screenHeight * 0.02, // 2% of screen height
  },
  title: {
    fontSize: Math.max(screenWidth * 0.07, 24), // 7% of width, min 24px
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: screenHeight * 0.005,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.max(screenWidth * 0.04, 14), // 4% of width, min 14px
    color: '#FFFFFF',
    marginBottom: screenHeight * 0.01,
    textAlign: 'center',
    opacity: 0.9,
  },
  loginPrompt: {
    fontSize: Math.max(screenWidth * 0.045, 16), // 4.5% of width, min 16px
    color: '#FFFFFF',
    marginBottom: screenHeight * 0.04,
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    gap: screenHeight * 0.02, // 2% of screen height
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: Math.max(screenWidth * 0.04, 12), // 4% of width, min 12px
    paddingVertical: screenHeight * 0.025, // 2.5% of screen height
    paddingHorizontal: screenWidth * 0.05, // 5% of screen width
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    minHeight: screenHeight * 0.08, // Minimum 8% of screen height
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonText: {
    fontSize: Math.max(screenWidth * 0.045, 16), // 4.5% of width, min 16px
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: screenHeight * 0.01,
    marginBottom: screenHeight * 0.005,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  buttonSubtext: {
    fontSize: Math.max(screenWidth * 0.032, 12), // 3.2% of width, min 12px
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: Math.max(screenWidth * 0.04, 16),
    paddingHorizontal: screenWidth * 0.02,
    flexWrap: 'wrap',
  },
});