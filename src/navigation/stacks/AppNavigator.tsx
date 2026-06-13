import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DrawerNavigator } from '../DrawerNavigator';
import { LeadDetailsScreen } from '../../screens/app/LeadDetailsScreen';
import { ClinicDetailsScreen } from '../../screens/app/ClinicDetailsScreen';
import { EnquiryDetailsScreen } from '../../screens/app/EnquiryDetailsScreen';
import { RMAssignmentScreen } from '../../screens/app/RMAssignmentScreen';
import { ChangePasswordScreen } from '../../screens/auth/ChangePasswordScreen';
import { CreateLeadScreen } from '../../screens/app/CreateLeadScreen';
import { CreateClinicScreen } from '../../screens/app/CreateClinicScreen';
import { AppStackParamList } from '../../types/navigation';
import { BRAND } from '../../theme/theme';

const Stack = createNativeStackNavigator<AppStackParamList>();

const detailHeaderOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: BRAND.primary },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { color: '#FFFFFF', fontWeight: '600' as const, fontSize: 16 },
  headerBackTitleVisible: false,
};

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen
        name="LeadDetails"
        component={LeadDetailsScreen}
        options={{ ...detailHeaderOptions, title: 'Lead Details' }}
      />
      <Stack.Screen
        name="ClinicDetails"
        component={ClinicDetailsScreen}
        options={{ ...detailHeaderOptions, title: 'Channel Partner Details' }}
      />
      <Stack.Screen
        name="EnquiryDetails"
        component={EnquiryDetailsScreen}
        options={{ ...detailHeaderOptions, title: 'Enquiry Details' }}
      />
      <Stack.Screen
        name="RMAssignment"
        component={RMAssignmentScreen}
        options={{ ...detailHeaderOptions, title: 'Assign RM' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ ...detailHeaderOptions, title: 'Change Password' }}
      />
      <Stack.Screen
        name="CreateLead"
        component={CreateLeadScreen}
        options={{ ...detailHeaderOptions, title: 'New Lead' }}
      />
      <Stack.Screen
        name="CreateClinic"
        component={CreateClinicScreen}
        options={{ ...detailHeaderOptions, title: 'Onboard Partner' }}
      />
    </Stack.Navigator>
  );
}
