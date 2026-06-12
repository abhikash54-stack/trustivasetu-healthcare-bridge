import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import { DashboardScreen } from '../../screens/app/DashboardScreen';
import { LeadsScreen } from '../../screens/app/LeadsScreen';
import { EnquiryScreen } from '../../screens/app/EnquiryScreen';
import { ClinicsScreen } from '../../screens/app/ClinicsScreen';
import { TasksScreen } from '../../screens/app/TasksScreen';
import { AgreementsScreen } from '../../screens/app/AgreementsScreen';
import { ProfileScreen } from '../../screens/app/ProfileScreen';
import { LeadDetailsScreen } from '../../screens/app/LeadDetailsScreen';
import { ClinicDetailsScreen } from '../../screens/app/ClinicDetailsScreen';
import { EnquiryDetailsScreen } from '../../screens/app/EnquiryDetailsScreen';
import { RMAssignmentScreen } from '../../screens/app/RMAssignmentScreen';
import { AppStackParamList, AppTabParamList } from '../../types/navigation';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }: any) => {
          const icons: Record<string, any> = {
            Dashboard: 'dashboard',
            Leads: 'people',
            Enquiry: 'assignment',
            Clinics: 'local-hospital',
            Tasks: 'check-circle',
            Agreements: 'description',
            Profile: 'person',
          };
          return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0B71EB',
        tabBarInactiveTintColor: '#7A869A',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E6ECF4' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Leads" component={LeadsScreen} />
      <Tab.Screen name="Enquiry" component={EnquiryScreen} />
      <Tab.Screen name="Clinics" component={ClinicsScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Agreements" component={AgreementsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="LeadDetails" component={LeadDetailsScreen} />
      <Stack.Screen name="ClinicDetails" component={ClinicDetailsScreen} />
      <Stack.Screen name="EnquiryDetails" component={EnquiryDetailsScreen} />
      <Stack.Screen name="RMAssignment" component={RMAssignmentScreen} />
    </Stack.Navigator>
  );
}
