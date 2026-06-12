export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  ForgotPassword: undefined;
};

export type AppTabParamList = {
  Dashboard: undefined;
  Leads: undefined;
  Enquiry: undefined;
  Clinics: undefined;
  Tasks: undefined;
  Agreements: undefined;
  Profile: undefined;
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
