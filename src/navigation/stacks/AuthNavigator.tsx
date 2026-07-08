import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SplashScreen } from '../../screens/auth/SplashScreen';
import { RoleSelectScreen } from '../../screens/auth/RoleSelectScreen';
import { LoginScreen } from '../../screens/auth/LoginScreen';
import { CustomerLoginScreen } from '../../screens/auth/CustomerLoginScreen';
import { CustomerDashboardScreen } from '../../screens/auth/CustomerDashboardScreen';
import { CustomerChangePasswordScreen } from '../../screens/auth/CustomerChangePasswordScreen';
import { CustomerProfileCompletionScreen } from '../../screens/auth/CustomerProfileCompletionScreen';
import { CustomerHospitalScreen } from '../../screens/auth/CustomerHospitalScreen';
import { CustomerAssistantScreen } from '../../screens/auth/CustomerAssistantScreen';
import { SignUpScreen } from '../../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../../screens/auth/ForgotPasswordScreen';
import { AuthStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} />
      <Stack.Screen name="CustomerDashboard" component={CustomerDashboardScreen} />
      <Stack.Screen name="CustomerChangePassword" component={CustomerChangePasswordScreen} />
      <Stack.Screen name="CustomerProfileCompletion" component={CustomerProfileCompletionScreen} />
      <Stack.Screen name="CustomerHospital" component={CustomerHospitalScreen} />
      <Stack.Screen name="CustomerAssistant" component={CustomerAssistantScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
