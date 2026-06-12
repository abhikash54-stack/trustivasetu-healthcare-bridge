import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppNavigator } from './stacks/AppNavigator';
import { AuthNavigator } from './stacks/AuthNavigator';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator();

export function Navigation() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
