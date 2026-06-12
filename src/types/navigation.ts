export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  ForgotPassword: undefined;
};

export type DrawerParamList = {
  Dashboard: undefined;
  Leads: undefined;
  ClinicOnboarding: undefined;
  Enquiries: undefined;
  Attendance: undefined;
  Leave: undefined;
  Tasks: undefined;
  Reports: undefined;
  HRPolicies: undefined;
  EmployeeDirectory: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
  About: undefined;
};

export type AppStackParamList = {
  Main: undefined;
  LeadDetails: { leadId: string };
  ClinicDetails: { clinicId: string };
  EnquiryDetails: { enquiryId: string };
  RMAssignment: { clinicId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

// Keep for any legacy references
export type AppTabParamList = DrawerParamList;
