export type AuthStackParamList = {
  Splash: undefined;
  RoleSelect: undefined;
  Login: { audience?: 'employee' | 'hospital'; heading?: string } | undefined;
  CustomerLogin: undefined;
  CustomerDashboard: { token: string; customer: unknown };
  CustomerChangePassword: { token: string; customer: unknown };
  CustomerProfileCompletion: { token: string; customer: unknown };
  CustomerHospital: { token: string; customer: unknown };
  CustomerAssistant: { token: string; customer: unknown };
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type DrawerParamList = {
  Dashboard: undefined;
  Attendance: undefined;
  Leads: undefined;
  ClinicOnboarding: undefined;
  Enquiries: undefined;
  Reports: undefined;
  Chatbot: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
  About: undefined;
  UserManagement: undefined;
  Regions: undefined;
  Lenders: undefined;
  Targets: undefined;
  AuditLogs: undefined;
  Occasions: undefined;
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
  PrivacyPolicy: undefined;
  TermsAndConditions: undefined;
  Support: undefined;
  DeleteAccount: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AppTabParamList = DrawerParamList;
