export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type DrawerParamList = {
  Dashboard: undefined;
  Leads: undefined;
  ClinicOnboarding: undefined;
  Enquiries: undefined;
  Reports: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
  About: undefined;
  UserManagement: undefined;
  Regions: undefined;
  Lenders: undefined;
  Targets: undefined;
  AuditLogs: undefined;
  Attendance: undefined;
  Leave: undefined;
  Tasks: undefined;
  HRPolicies: undefined;
  EmployeeDirectory: undefined;
};

export type AppStackParamList = {
  Main: undefined;
  LeadDetails: { leadId: string };
  ClinicDetails: { clinicId: string };
  EnquiryDetails: { enquiryId: string };
  RMAssignment: { clinicId: string };
  ChangePassword: undefined;
  CreateLead: undefined;
  CreateClinic: undefined;
  EditLead: { leadId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AppTabParamList = DrawerParamList;
