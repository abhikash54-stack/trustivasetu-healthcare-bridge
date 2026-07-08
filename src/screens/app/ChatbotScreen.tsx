import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchClinics } from '../../services/clinicService';
import { createLead } from '../../services/leadService';
import { invalidateQueries } from '../../api/queryClient';
import {
  ChatMessage,
  botMessage,
  userMessage,
  generateBotResponse,
  getGreeting,
  getClinicSelectedMessage,
  fetchClinicForChat,
  TREATMENT_CATEGORIES,
  buildLeadRemarks,
} from '../../services/chatbotService';
import { Clinic, ClinicDetail } from '../../types/auth';
import { BRAND } from '../../theme/theme';

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isBot = msg.role === 'bot';
  const lines = msg.text.split('\n');

  return (
    <View style={[styles.bubbleRow, isBot ? styles.bubbleRowBot : styles.bubbleRowUser]}>
      {isBot && (
        <View style={styles.botAvatar}>
          <MaterialIcons name="support-agent" size={18} color={BRAND.accent} />
        </View>
      )}
      <View style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
        {lines.map((line, i) => {
          const isBold = line.startsWith('**') && line.endsWith('**');
          const text = isBold ? line.slice(2, -2) : line;
          if (!text) return <View key={i} style={{ height: 6 }} />;
          return (
            <RNText
              key={i}
              style={[
                styles.bubbleText,
                isBot ? styles.bubbleTextBot : styles.bubbleTextUser,
                isBold && styles.bubbleTextBold,
              ]}
            >
              {text}
            </RNText>
          );
        })}
        <RNText style={[styles.timestamp, !isBot && styles.timestampUser]}>
          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </RNText>
      </View>
    </View>
  );
}

function QuickChips({ chips, onPress }: { chips: string[]; onPress: (chip: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
    >
      {chips.map((chip) => (
        <TouchableOpacity
          key={chip}
          style={styles.chip}
          onPress={() => onPress(chip)}
          activeOpacity={0.75}
        >
          <RNText style={styles.chipText}>{chip}</RNText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

interface ClinicPickerProps {
  visible: boolean;
  clinics: Clinic[];
  onSelect: (clinic: Clinic) => void;
  onClose: () => void;
  search: string;
  onSearch: (q: string) => void;
}

function ClinicPicker({ visible, clinics, onSelect, onClose, search, onSearch }: ClinicPickerProps) {
  const filtered = clinics.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.location ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.pickerSheet}>
        <View style={styles.pickerHandle} />
        <RNText style={styles.pickerTitle}>Select Channel Partner</RNText>
        <View style={styles.searchRow}>
          <MaterialIcons name="search" size={18} color="#5A7A63" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={onSearch}
            placeholder="Search clinics / hospitals..."
            placeholderTextColor="#B0C8B8"
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => onSearch('')}>
              <MaterialIcons name="close" size={18} color="#5A7A63" />
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          style={styles.pickerList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.pickerEmpty}>
              <MaterialIcons name="search-off" size={32} color="#C8DFD0" />
              <RNText style={styles.pickerEmptyText}>No clinics found</RNText>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => onSelect(item)}
              activeOpacity={0.75}
            >
              <View style={styles.pickerItemIcon}>
                <MaterialIcons name="local-hospital" size={18} color={BRAND.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <RNText style={styles.pickerItemName}>{item.name}</RNText>
                {item.location ? (
                  <RNText style={styles.pickerItemLoc} numberOfLines={1}>{item.location}</RNText>
                ) : null}
              </View>
              <View style={[
                styles.pickerItemStatus,
                { backgroundColor: item.status === 'ACTIVE' ? '#E8F5EE' : '#FEF3F2' },
              ]}>
                <RNText style={[
                  styles.pickerItemStatusText,
                  { color: item.status === 'ACTIVE' ? BRAND.primary : '#E74C3C' },
                ]}>
                  {item.status ?? 'Active'}
                </RNText>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

export function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useSelector((s: RootState) => s.auth.user);
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinicDetail, setClinicDetail] = useState<ClinicDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastChips, setLastChips] = useState<string[]>([]);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [lastLeadId, setLastLeadId] = useState<string | null>(null);

  // Guided lead-capture flow (hospital → treatment → KYC → submit real lead).
  const [leadFlow, setLeadFlow] = useState<{
    stepIndex: number;
    data: {
      treatment?: string;
      applicantName?: string;
      mobileNumber?: string;
      monthlyIncome?: string;
      loanAmount?: string;
      city?: string;
      dob?: string;
      pan?: string;
    };
  } | null>(null);

  const QUICK_CHIPS_NO_CLINIC = ['How to select a partner?', 'Loan process', 'Documents needed', 'Help'];
  const QUICK_CHIPS_WITH_CLINIC = [
    'Capture a lead',
    'Contact info',
    'Business potential',
    'Lead status',
    'Documents needed',
    'Loan process',
    'Start instant approval',
    'Account aggregator',
  ];

  const [approvalFlow, setApprovalFlow] = useState<{
    stepIndex: number;
    data: {
      applicantName?: string;
      mobileNumber?: string;
      panNumber?: string;
      aadhaarNumber?: string;
      bankAccount?: string;
      otp?: string;
    };
  } | null>(null);

  const clinicsResult = useQuery({
    queryKey: ['clinics'],
    queryFn: fetchClinics,
  }) as any;

  const clinics: Clinic[] = clinicsResult.data ?? [];

  useEffect(() => {
    if (user?.name) {
      const greeting = getGreeting(user.name);
      setMessages([greeting]);
      setLastChips(greeting.chips ?? []);
    }
  }, [user?.name]);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
    if (msg.chips) setLastChips(msg.chips);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  const handleSelectClinic = useCallback(async (clinic: Clinic) => {
    setPickerVisible(false);
    setSearchQuery('');
    setSelectedClinic(clinic);
    setLoadingDetail(true);
    addMessage(userMessage(`Tell me about ${clinic.name}`));
    const detail = await fetchClinicForChat(clinic.id);
    setClinicDetail(detail);
    setLoadingDetail(false);
    const response = getClinicSelectedMessage(clinic.name);
    addMessage(response);
    addMessage(botMessage(
      `Ready to register a new patient lead for **${clinic.name}**?

Tap **Capture a lead** and I'll collect the treatment, customer name, mobile number, monthly income and loan amount, then submit it to the LMS instantly.

You can also tap **Start instant approval** for the guided ₹75,000 approval demo.`,
      ['Capture a lead', 'Start instant approval', 'Account aggregator'],
    ));
  }, [addMessage]);

  const normalizeDigits = (value: string) => value.replace(/\D/g, '');
  const isValidMobile = (value: string) => normalizeDigits(value).length === 10;
  const isValidPan = (value: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.toUpperCase().trim());
  const isValidAadhaar = (value: string) => normalizeDigits(value).length === 12;
  const isValidBankAccount = (value: string) => {
    const length = normalizeDigits(value).length;
    return length >= 9 && length <= 18;
  };
  const isValidOtp = (value: string) => {
    const length = normalizeDigits(value).length;
    return length >= 4 && length <= 6;
  };

  const getApprovalPrompt = (step: number) => {
    const prompts = [
      'What is the applicant full name?',
      'What is the applicant mobile number? Please enter 10 digits.',
      'Please share the applicant PAN number (10 characters).',
      'Please share the applicant Aadhaar number (12 digits).',
      'Please share the bank account number linked to the applicant.',
      'Finally, enter the OTP sent to the applicant mobile number.',
    ];
    return prompts[step] || 'Please provide the requested detail.';
  };

  const compileApprovalResult = (data: any) => {
    return `Great! I've verified the applicant details for **${selectedClinic?.name || 'this partner'}**.

` +
      `• Name: ${data.applicantName}
` +
      `• Mobile: ${data.mobileNumber}
` +
      `• PAN: ${data.panNumber}
` +
      `• Aadhaar: ${data.aadhaarNumber}
` +
      `• Bank account: ${data.bankAccount}

` +
      `I have simulated these checks:
` +
      `• Aadhaar address verification
` +
      `• PAN / CIBIL readiness check
` +
      `• Salary / income indicator review from bank message patterns

` +
      `✅ Instant approval available for ₹75,000.

Next step: collect documents and schedule the loan disbursal. You can also use **Account aggregator** later for automated salary verification and faster credit decisions.`;
  };

  const getApprovalIntroMessage = (clinicName: string) => {
    return botMessage(
      `Let's start the instant approval flow for **${clinicName}**.

I will ask for applicant details step by step:
1. Applicant name
2. Mobile number
3. PAN number
4. Aadhaar number
5. Bank account number
6. OTP verification

Please share the applicant's full name to begin.`,
      ['Help', 'Cancel', 'Account aggregator'],
    );
  };

  const LEAD_STEP_CITY = 5;
  const LEAD_STEP_DOB = 6;
  const LEAD_STEP_PAN = 7;
  const LEAD_TOTAL_STEPS = 8;

  const getLeadPrompt = (step: number): { text: string; chips: string[] } => {
    switch (step) {
      case 0:
        return { text: 'Which treatment is this lead for? Tap a category below.', chips: [...TREATMENT_CATEGORIES, 'Cancel'] };
      case 1:
        return { text: "What is the customer's full name?", chips: ['Cancel'] };
      case 2:
        return { text: "What is the customer's mobile number? (10 digits)", chips: ['Cancel'] };
      case 3:
        return { text: "What is the customer's monthly salary / income? (in ₹)", chips: ['Cancel'] };
      case 4:
        return { text: 'What loan amount is required? (in ₹)', chips: ['Cancel'] };
      case LEAD_STEP_CITY:
        return { text: 'Which city is the customer in? (or tap Skip)', chips: ['Skip', 'Cancel'] };
      case LEAD_STEP_DOB:
        return { text: 'Date of birth? Format DD-MM-YYYY (or tap Skip)', chips: ['Skip', 'Cancel'] };
      case LEAD_STEP_PAN:
        return { text: 'PAN number? (10 characters, or tap Skip)', chips: ['Skip', 'Cancel'] };
      default:
        return { text: 'Please provide the requested detail.', chips: ['Cancel'] };
    }
  };

  const isValidDob = (value: string) => /^\d{2}-\d{2}-\d{4}$/.test(value.trim());

  const submitLead = useCallback(async (data: NonNullable<typeof leadFlow>['data']) => {
    if (!selectedClinic) return;
    setSubmittingLead(true);
    addMessage(botMessage('Submitting the lead to the LMS… one moment.'));
    try {
      const remarks = buildLeadRemarks(data);
      const lead = await createLead({
        applicantName: data.applicantName ?? '',
        phone: data.mobileNumber ?? '',
        email: '',
        amount: data.loanAmount ?? '',
        lenderId: '',
        clinicId: selectedClinic.id,
        applicationDate: '',
        remarks,
      });
      setLastLeadId(lead.id);
      // Push the new lead into the rest of the app immediately.
      invalidateQueries(['leads'], ['dashboard']);
      addMessage(botMessage(
        `✅ Lead created successfully!

**Lead ID:** ${lead.id || '(assigned by LMS)'}
**Customer:** ${data.applicantName}
**Mobile:** ${data.mobileNumber}
**Treatment:** ${data.treatment}
**Loan amount:** ₹${data.loanAmount}
**Partner:** ${selectedClinic.name}

The lead is now live in the LMS and will sync here automatically. Tap **Track status** to follow its progress (Submitted → Under Review → Approved → Disbursed).`,
        ['Track status', 'Capture a lead', 'Lead status'],
      ));
    } catch (err: any) {
      const msg = err?.response?.data?.message
        || (err?.message?.includes('Network') ? 'Network error — please check your connection and try again.' : null)
        || 'Could not submit the lead right now. Please try again in a moment.';
      addMessage(botMessage(`⚠️ ${msg}`, ['Capture a lead', 'Help']));
    } finally {
      setSubmittingLead(false);
    }
  }, [selectedClinic, addMessage]);

  // Returns true if the message was consumed by the active lead-capture flow.
  const handleLeadFlowInput = (value: string): boolean => {
    if (!leadFlow) return false;
    const step = leadFlow.stepIndex;
    const lower = value.toLowerCase();

    if (lower === 'cancel') {
      setLeadFlow(null);
      addMessage(botMessage('Lead capture canceled. Tap **Capture a lead** to start again.', QUICK_CHIPS_WITH_CLINIC));
      return true;
    }

    const advance = (patch: Partial<NonNullable<typeof leadFlow>['data']>, nextStep: number) => {
      const nextData = { ...leadFlow.data, ...patch };
      if (nextStep >= LEAD_TOTAL_STEPS) {
        setLeadFlow(null);
        submitLead(nextData);
        return;
      }
      setLeadFlow({ stepIndex: nextStep, data: nextData });
      const prompt = getLeadPrompt(nextStep);
      addMessage(botMessage(prompt.text, prompt.chips));
    };

    const skip = lower === 'skip';

    switch (step) {
      case 0: {
        const match = TREATMENT_CATEGORIES.find((t) => t.toLowerCase() === lower);
        if (!match) {
          addMessage(botMessage('Please pick a treatment category from the options below.', [...TREATMENT_CATEGORIES, 'Cancel']));
          return true;
        }
        advance({ treatment: match }, 1);
        return true;
      }
      case 1:
        if (value.trim().length < 2) {
          addMessage(botMessage('Please enter the full name.', ['Cancel']));
          return true;
        }
        advance({ applicantName: value.trim() }, 2);
        return true;
      case 2:
        if (!isValidMobile(value)) {
          addMessage(botMessage('Please enter a valid 10-digit mobile number.', ['Cancel']));
          return true;
        }
        advance({ mobileNumber: normalizeDigits(value) }, 3);
        return true;
      case 3:
        if (!normalizeDigits(value)) {
          addMessage(botMessage('Please enter the monthly income as a number (in ₹).', ['Cancel']));
          return true;
        }
        advance({ monthlyIncome: normalizeDigits(value) }, 4);
        return true;
      case 4:
        if (!normalizeDigits(value)) {
          addMessage(botMessage('Please enter the required loan amount as a number (in ₹).', ['Cancel']));
          return true;
        }
        advance({ loanAmount: normalizeDigits(value) }, LEAD_STEP_CITY);
        return true;
      case LEAD_STEP_CITY:
        advance({ city: skip ? undefined : value.trim() }, LEAD_STEP_DOB);
        return true;
      case LEAD_STEP_DOB:
        if (!skip && !isValidDob(value)) {
          addMessage(botMessage('Please enter the date of birth as DD-MM-YYYY, or tap Skip.', ['Skip', 'Cancel']));
          return true;
        }
        advance({ dob: skip ? undefined : value.trim() }, LEAD_STEP_PAN);
        return true;
      case LEAD_STEP_PAN:
        if (!skip && !isValidPan(value)) {
          addMessage(botMessage('PAN should be 10 characters (AAAAA9999A), or tap Skip.', ['Skip', 'Cancel']));
          return true;
        }
        advance({ pan: skip ? undefined : value.toUpperCase().trim() }, LEAD_TOTAL_STEPS);
        return true;
      default:
        return false;
    }
  };

  const handleSend = useCallback((text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput('');
    const um = userMessage(q);
    addMessage(um);

    // Active lead-capture flow consumes the input directly.
    if (leadFlow) {
      handleLeadFlowInput(q);
      return;
    }

    if (approvalFlow) {
      const step = approvalFlow.stepIndex;
      const value = q.trim();
      const lowerValue = value.toLowerCase();

      if (lowerValue === 'cancel') {
        setApprovalFlow(null);
        addMessage(botMessage('Approval flow canceled. You can start again anytime using Start instant approval.', QUICK_CHIPS_WITH_CLINIC));
        return;
      }

      if (lowerValue === 'help') {
        addMessage(botMessage(`Sure! ${getApprovalPrompt(step)} Please answer the requested detail.`, ['Help', 'Cancel']));
        return;
      }

      if (step === 0) {
        setApprovalFlow((prev) => prev && ({ ...prev, stepIndex: 1, data: { ...prev.data, applicantName: value } }));
        addMessage(botMessage(getApprovalPrompt(1), ['Help', 'Cancel']));
        return;
      }

      if (step === 1) {
        if (!isValidMobile(value)) {
          addMessage(botMessage('Please enter a valid 10-digit mobile number.', ['Help', 'Cancel']));
          return;
        }
        setApprovalFlow((prev) => prev && ({ ...prev, stepIndex: 2, data: { ...prev.data, mobileNumber: normalizeDigits(value) } }));
        addMessage(botMessage(getApprovalPrompt(2), ['Help', 'Cancel']));
        return;
      }

      if (step === 2) {
        if (!isValidPan(value)) {
          addMessage(botMessage('PAN should be 10 characters in the format AAAAA9999A. Please enter the PAN again.', ['Help', 'Cancel']));
          return;
        }
        setApprovalFlow((prev) => prev && ({ ...prev, stepIndex: 3, data: { ...prev.data, panNumber: value.toUpperCase().trim() } }));
        addMessage(botMessage(getApprovalPrompt(3), ['Help', 'Cancel']));
        return;
      }

      if (step === 3) {
        if (!isValidAadhaar(value)) {
          addMessage(botMessage('Aadhaar number must be 12 digits. Please enter the Aadhaar number again.', ['Help', 'Cancel']));
          return;
        }
        setApprovalFlow((prev) => prev && ({ ...prev, stepIndex: 4, data: { ...prev.data, aadhaarNumber: normalizeDigits(value) } }));
        addMessage(botMessage(getApprovalPrompt(4), ['Help', 'Cancel']));
        return;
      }

      if (step === 4) {
        if (!isValidBankAccount(value)) {
          addMessage(botMessage('Please enter a valid bank account number between 9 and 18 digits.', ['Help', 'Cancel']));
          return;
        }
        setApprovalFlow((prev) => prev && ({ ...prev, stepIndex: 5, data: { ...prev.data, bankAccount: normalizeDigits(value) } }));
        addMessage(botMessage(getApprovalPrompt(5), ['Help', 'Cancel']));
        return;
      }

      if (step === 5) {
        if (!isValidOtp(value)) {
          addMessage(botMessage('OTP must be 4 to 6 digits. Please enter the OTP received on the applicant mobile.', ['Help', 'Cancel']));
          return;
        }
        const finalData = { ...approvalFlow.data, otp: normalizeDigits(value) };
        setApprovalFlow(null);
        addMessage(botMessage(compileApprovalResult(finalData), ['Account aggregator', 'Help']));
        return;
      }
    }

    const lowerQ = q.toLowerCase();

    // Start the guided lead-capture flow.
    if (lowerQ.includes('capture a lead') || lowerQ === 'new lead' || lowerQ === 'create lead') {
      if (!selectedClinic) {
        addMessage(botMessage('Select a hospital / clinic above first, then I can capture a lead for it.', QUICK_CHIPS_NO_CLINIC));
        return;
      }
      setLeadFlow({ stepIndex: 0, data: {} });
      const prompt = getLeadPrompt(0);
      addMessage(botMessage(
        `Let's capture a new lead for **${selectedClinic.name}**.\n\n${prompt.text}`,
        prompt.chips,
      ));
      return;
    }

    // Jump to the lead status tracking screen for the most recent submission.
    if (lowerQ.includes('track status')) {
      if (lastLeadId) {
        navigation.navigate('LeadDetails', { leadId: lastLeadId });
      } else {
        addMessage(botMessage('No recent lead to track yet. Tap **Capture a lead** to create one.', QUICK_CHIPS_WITH_CLINIC));
      }
      return;
    }

    setTimeout(() => {
      if (lowerQ.includes('start instant approval') || lowerQ.includes('instant approval') || lowerQ.includes('75k')) {
        if (!selectedClinic) {
          addMessage(botMessage('Select a clinic first to begin the instant approval flow.', QUICK_CHIPS_NO_CLINIC));
          return;
        }
        setApprovalFlow({ stepIndex: 0, data: {} });
        addMessage(getApprovalIntroMessage(selectedClinic.name));
        return;
      }

      const reply = generateBotResponse(q, {
        clinic: clinicDetail,
        clinicName: selectedClinic?.name,
      });
      addMessage(reply);
    }, 400);
  }, [input, addMessage, approvalFlow, leadFlow, clinicDetail, selectedClinic, lastLeadId, navigation, submitLead]);

  const handleChip = useCallback((chip: string) => {
    handleSend(chip);
  }, [handleSend]);

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => (
    <MessageBubble msg={item} />
  ), []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* Clinic selector bar */}
      <View style={styles.selectorBar}>
        <MaterialIcons name="local-hospital" size={18} color={BRAND.primary} />
        <TouchableOpacity
          style={styles.selectorBtn}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.75}
        >
          <RNText
            style={[styles.selectorText, !selectedClinic && styles.selectorPlaceholder]}
            numberOfLines={1}
          >
            {selectedClinic ? selectedClinic.name : 'Select Channel Partner / Hospital'}
          </RNText>
          <MaterialIcons name="expand-more" size={20} color={BRAND.primary} />
        </TouchableOpacity>
        {selectedClinic && (
          <TouchableOpacity
            onPress={() => {
              setSelectedClinic(null);
              setClinicDetail(null);
            }}
            style={styles.clearBtn}
          >
            <MaterialIcons name="close" size={18} color="#5A7A63" />
          </TouchableOpacity>
        )}
      </View>

      {/* Clinic detail header */}
      {selectedClinic && clinicDetail && (
        <View style={styles.clinicBadge}>
          <View style={styles.clinicBadgeIcon}>
            <MaterialIcons name="verified" size={14} color={BRAND.accent} />
          </View>
          <RNText style={styles.clinicBadgeText} numberOfLines={1}>
            {clinicDetail.name} · {clinicDetail.contactNumber || clinicDetail.email || 'Partner loaded'}
          </RNText>
        </View>
      )}

      {/* Chat messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Loading indicator */}
      {(loadingDetail || submittingLead) && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={BRAND.primary} />
          <RNText style={styles.loadingText}>
            {submittingLead ? 'Submitting lead to LMS...' : 'Loading clinic details...'}
          </RNText>
        </View>
      )}

      {/* Quick chips */}
      {lastChips.length > 0 && (
        <QuickChips chips={lastChips} onPress={handleChip} />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about this partner..."
          placeholderTextColor="#B0C8B8"
          multiline
          maxLength={400}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim()}
          activeOpacity={0.8}
        >
          <MaterialIcons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ClinicPicker
        visible={pickerVisible}
        clinics={clinics}
        onSelect={handleSelectClinic}
        onClose={() => {
          setPickerVisible(false);
          setSearchQuery('');
        }}
        search={searchQuery}
        onSearch={setSearchQuery}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F5',
  },
  selectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0EC',
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  selectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BRAND.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A2D1E',
  },
  selectorPlaceholder: {
    color: '#5A7A63',
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  clinicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#C8DFD0',
  },
  clinicBadgeIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clinicBadgeText: {
    flex: 1,
    fontSize: 12,
    color: BRAND.primaryDark,
    fontWeight: '600',
  },
  messageList: {
    padding: 16,
    gap: 12,
    paddingBottom: 8,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 8,
    maxWidth: '90%',
  },
  bubbleRowBot: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  bubbleRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 4,
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '85%',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleBot: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#DCEAE1',
  },
  bubbleUser: {
    backgroundColor: BRAND.primaryDark,
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 20,
  },
  bubbleTextBot: {
    color: '#10221A',
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  bubbleTextBold: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 10,
    color: '#B0C8B8',
    marginTop: 4,
    fontWeight: '500',
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#5A7A63',
    fontStyle: 'italic',
  },
  chipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: BRAND.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2A1D',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8F0EC',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F0F7F3',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A2D1E',
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: BRAND.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sendBtnDisabled: {
    backgroundColor: '#C8DFD0',
    elevation: 0,
    shadowOpacity: 0,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  pickerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#C8DFD0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A2D1E',
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A2D1E',
  },
  pickerList: {
    maxHeight: 360,
  },
  pickerEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  pickerEmptyText: {
    fontSize: 14,
    color: '#5A7A63',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7F3',
    gap: 12,
  },
  pickerItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BRAND.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2D1E',
  },
  pickerItemLoc: {
    fontSize: 12,
    color: '#5A7A63',
    marginTop: 2,
  },
  pickerItemStatus: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pickerItemStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
