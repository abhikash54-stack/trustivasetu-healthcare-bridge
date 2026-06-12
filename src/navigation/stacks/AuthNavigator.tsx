import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../../screens/auth/ForgotPasswordScreen';
import { SplashScreen } from '../../screens/auth/SplashScreen';
import { AuthStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
