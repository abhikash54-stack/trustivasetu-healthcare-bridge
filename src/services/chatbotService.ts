import { apiClient } from '../api/axios';
import { ClinicDetail } from '../types/auth';
import { formatCurrency } from '../utils/format';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  chips?: string[];
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function botMessage(text: string, chips?: string[]): ChatMessage {
  return { id: uid(), role: 'bot', text, timestamp: new Date(), chips };
}

export function userMessage(text: string): ChatMessage {
  return { id: uid(), role: 'user', text, timestamp: new Date() };
}

export async function fetchClinicForChat(clinicId: string): Promise<ClinicDetail | null> {
  try {
    const response = await apiClient.get(`/clinics/${clinicId}`);
    const raw = response.data?.data ?? response.data;
    return raw as ClinicDetail;
  } catch {
    return null;
  }
}

const PROCESS_STEPS = [
  "1. Partner submits patient's loan application form",
  '2. KYC documents collected (Aadhaar, PAN, bank statement)',
  '3. Application submitted to lender portal',
  '4. Lender reviews and approves within 2–4 working days',
  '5. Loan amount disbursed directly to hospital account',
  '6. Partner notified via TrustivaSetu app',
];

const DOCS_REQUIRED = [
  '📄 Aadhaar Card (patient + co-applicant)',
  '📄 PAN Card',
  '📄 Last 3 months salary slips (if salaried)',
  '📄 Bank statement — last 6 months',
  '📄 Medical estimate / hospital invoice',
  '📄 Loan application form (signed)',
];

const HELP_TEXT = `I can help you with:\n\n` +
  `• 📋 Clinic details & contact\n` +
  `• 💰 Business potential & targets\n` +
  `• 📈 Recent lead performance\n` +
  `• 📑 Documentation checklist\n` +
  `• 🔄 Loan process steps\n` +
  `• 🏥 Hospital information\n\n` +
  `Select a channel partner above and ask me anything!`;

const QUICK_CHIPS_NO_CLINIC = ['How to select a partner?', 'Loan process', 'Documents needed', 'Help'];
const QUICK_CHIPS_WITH_CLINIC = ['Contact info', 'Business potential', 'Lead status', 'Documents needed', 'Loan process'];

export function getGreeting(userName: string): ChatMessage {
  const first = userName.split(' ')[0];
  return botMessage(
    `Hello ${first}! 👋 I'm your Channel Partner Assistant.\n\nSelect a channel partner from the dropdown above and I'll help you with clinic details, loan queries, documentation, and more.`,
    QUICK_CHIPS_NO_CLINIC,
  );
}

export function getClinicSelectedMessage(clinicName: string): ChatMessage {
  return botMessage(
    `Great! I've loaded details for **${clinicName}**.\n\nWhat would you like to know?`,
    QUICK_CHIPS_WITH_CLINIC,
  );
}

interface BotResponseContext {
  clinic: ClinicDetail | null;
  clinicName?: string;
}

export function generateBotResponse(input: string, ctx: BotResponseContext): ChatMessage {
  const q = input.toLowerCase().trim();
  const { clinic } = ctx;

  if (!clinic) {
    if (q.includes('process') || q.includes('loan')) {
      return botMessage(
        `**Loan Process Steps:**\n\n${PROCESS_STEPS.join('\n')}`,
        ['Documents needed', 'Help'],
      );
    }
    if (q.includes('doc') || q.includes('document') || q.includes('kyc')) {
      return botMessage(
        `**Documentation Required:**\n\n${DOCS_REQUIRED.join('\n')}`,
        ['Loan process', 'Help'],
      );
    }
    if (q.includes('select') || q.includes('partner') || q.includes('how')) {
      return botMessage(
        `Tap the **"Select Channel Partner"** dropdown at the top of this screen to choose a clinic or hospital. Once selected, I can provide you with specific details about that partner.`,
        QUICK_CHIPS_NO_CLINIC,
      );
    }
    return botMessage(
      `Please select a channel partner from the dropdown above first, so I can provide specific information.\n\n${HELP_TEXT}`,
      QUICK_CHIPS_NO_CLINIC,
    );
  }

  // Clinic is selected — answer specific questions
  if (q.includes('contact') || q.includes('phone') || q.includes('number') || q.includes('call')) {
    const contact = clinic.contactPerson || clinic.contactNumber
      ? `**Contact Person:** ${clinic.contactPerson || '—'}\n**Phone:** ${clinic.contactNumber || '—'}\n**Email:** ${clinic.email || '—'}`
      : `No contact details available for this partner.`;
    return botMessage(contact, ['Business potential', 'Lead status', 'Help']);
  }

  if (q.includes('address') || q.includes('location') || q.includes('where')) {
    const addr = clinic.address || clinic.location || '—';
    return botMessage(`**Address:**\n${addr}`, ['Contact info', 'Business potential']);
  }

  if (q.includes('business') || q.includes('potential') || q.includes('revenue')) {
    const potential = clinic.businessPotential
      ? `**Business Potential:** ${formatCurrency(clinic.businessPotential)}`
      : `Business potential not set for this partner.`;
    const targets = clinic.currentTargets?.leadsTarget
      ? `\n**Monthly Lead Target:** ${clinic.currentTargets.leadsTarget}`
      : '';
    return botMessage(potential + targets, ['Lead status', 'Contact info']);
  }

  if (q.includes('target') || q.includes('goal')) {
    const t = clinic.currentTargets;
    if (t?.leadsTarget) {
      const text = `**Current Targets (${t.month} ${t.year}):**\n` +
        `• Lead Target: ${t.leadsTarget}\n` +
        `• Disbursal Target: ${formatCurrency(t.disbursalTarget)}\n` +
        `• Achieved Leads: ${t.achievedLeads}\n` +
        `• Achieved Disbursal: ${formatCurrency(t.achievedDisbursal)}`;
      return botMessage(text, ['Lead status', 'Business potential']);
    }
    return botMessage(`No current targets set for this partner.`, QUICK_CHIPS_WITH_CLINIC);
  }

  if (q.includes('lead') || q.includes('status') || q.includes('loan') && q.includes('status')) {
    const recent = clinic.recentLeads;
    if (recent && recent.length > 0) {
      const lines = recent
        .slice(0, 5)
        .map((l) => `• ${l.applicantName} — ${l.status} (${formatCurrency(l.amount)})`);
      return botMessage(`**Recent Leads:**\n${lines.join('\n')}`, ['Contact info', 'Business potential']);
    }
    return botMessage(
      `No recent leads found for this partner. Use the Leads section to create a new lead for **${clinic.name}**.`,
      ['Contact info', 'Business potential', 'Loan process'],
    );
  }

  if (q.includes('rm') || q.includes('manager') || q.includes('assigned')) {
    const rm = clinic.assignedRM || '—';
    return botMessage(`**Assigned Regional Manager:** ${rm}`, QUICK_CHIPS_WITH_CLINIC);
  }

  if (q.includes('account') || q.includes('bank')) {
    const acct = clinic.accountNumber || '—';
    return botMessage(`**Bank Account Number:** ${acct}`, ['Contact info', 'Business potential']);
  }

  if (q.includes('doc') || q.includes('document') || q.includes('kyc') || q.includes('required')) {
    return botMessage(
      `**Documentation Required for Loan Processing:**\n\n${DOCS_REQUIRED.join('\n')}`,
      ['Loan process', 'Contact info'],
    );
  }

  if (q.includes('process') || q.includes('step') || q.includes('how') || q.includes('procedure')) {
    return botMessage(
      `**Loan Process Steps:**\n\n${PROCESS_STEPS.join('\n')}`,
      ['Documents needed', 'Contact info'],
    );
  }

  if (q.includes('help') || q.includes('what can') || q.includes('?') && q.length < 4) {
    return botMessage(HELP_TEXT, QUICK_CHIPS_WITH_CLINIC);
  }

  if (q.includes('name') || q.includes('info') || q.includes('detail') || q.includes('about')) {
    const info = `**${clinic.name}**\n\n` +
      `📍 ${clinic.address || clinic.location || 'Address not available'}\n` +
      `👤 ${clinic.contactPerson || '—'}\n` +
      `📞 ${clinic.contactNumber || '—'}\n` +
      `📧 ${clinic.email || '—'}\n` +
      `💰 Business Potential: ${formatCurrency(clinic.businessPotential) || '—'}\n` +
      `🔄 Status: ${clinic.status || 'ACTIVE'}`;
    return botMessage(info, QUICK_CHIPS_WITH_CLINIC);
  }

  // Fallback
  return botMessage(
    `I'm not sure about that. Here's what I can help you with for **${clinic.name}**:\n\n` + HELP_TEXT,
    QUICK_CHIPS_WITH_CLINIC,
  );
}
