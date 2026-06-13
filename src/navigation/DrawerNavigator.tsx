import { createDrawerNavigator } from '@react-navigation/drawer';

import { DrawerContent } from '../components/DrawerContent';
import { AppHeader } from '../components/AppHeader';
import { DrawerParamList } from '../types/navigation';
import { BRAND } from '../theme/theme';

import { DashboardScreen } from '../screens/app/DashboardScreen';
import { LeadsScreen } from '../screens/app/LeadsScreen';
import { ClinicsScreen } from '../screens/app/ClinicsScreen';
import { EnquiryScreen } from '../screens/app/EnquiryScreen';
import { TasksScreen } from '../screens/app/TasksScreen';
import { ReportsScreen } from '../screens/app/ReportsScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { NotificationsScreen } from '../screens/app/NotificationsScreen';
import { SettingsScreen } from '../screens/app/SettingsScreen';
import { AttendanceScreen } from '../screens/app/AttendanceScreen';
import { LeaveScreen } from '../screens/app/LeaveScreen';
import { HRPoliciesScreen } from '../screens/app/HRPoliciesScreen';
import { EmployeeDirectoryScreen } from '../screens/app/EmployeeDirectoryScreen';
import { AboutScreen } from '../screens/app/AboutScreen';
import { UserManagementScreen } from '../screens/app/UserManagementScreen';

const Drawer = createDrawerNavigator<DrawerParamList>();

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props: any) => <DrawerContent state={props.state} navigation={props.navigation} />}
      screenOptions={({ navigation }: { navigation: any }) => ({
        header: () => <AppHeader navigation={navigation} />,
        drawerStyle: {
          backgroundColor: BRAND.drawerBg,
          width: 280,
        },
        drawerType: 'front',
        overlayColor: 'rgba(0, 0, 0, 0.55)',
        swipeEdgeWidth: 40,
      })}
    >
      <Drawer.Screen name="Dashboard"         component={DashboardScreen} />
      <Drawer.Screen name="Leads"             component={LeadsScreen} />
      <Drawer.Screen name="ClinicOnboarding"  component={ClinicsScreen} />
      <Drawer.Screen name="Enquiries"         component={EnquiryScreen} />
      <Drawer.Screen name="Attendance"        component={AttendanceScreen} />
      <Drawer.Screen name="Leave"             component={LeaveScreen} />
      <Drawer.Screen name="Tasks"             component={TasksScreen} />
      <Drawer.Screen name="Reports"           component={ReportsScreen} />
      <Drawer.Screen name="HRPolicies"        component={HRPoliciesScreen} />
      <Drawer.Screen name="EmployeeDirectory" component={EmployeeDirectoryScreen} />
      <Drawer.Screen name="Notifications"     component={NotificationsScreen} />
      <Drawer.Screen name="Profile"           component={ProfileScreen} />
      <Drawer.Screen name="Settings"          component={SettingsScreen} />
      <Drawer.Screen name="About"             component={AboutScreen} />
      <Drawer.Screen name="UserManagement"   component={UserManagementScreen} />
    </Drawer.Navigator>
  );
}
