'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type Lang = 'en' | 'hi'

interface Message {
  role: 'bot' | 'user'
  text: string
}

interface ChatData {
  clinicId: string
  clinicName: string
  clinicAddress: string
  name: string
  phone: string
  email: string
  dob: string
  amount: string
  purpose: string
  employment: string
  income: string
  existingEmi: string
  pan: string
  aadhaar: string
}

const EMPTY: ChatData = {
  clinicId: '', clinicName: '', clinicAddress: '',
  name: '', phone: '', email: '',
  dob: '', amount: '', purpose: '',
  employment: '', income: '', existingEmi: '',
  pan: '', aadhaar: '',
}

const T = {
  en: {
    intro: 'Hi! 👋 I\'m your loan guide from Trustiva Setu. I\'ll help you apply for a medical loan in just a few minutes. Let\'s get started!',
    askClinic: 'To begin, please enter your Clinic / Hospital ID (e.g. TSC-ABC123). You can find this at the clinic reception.',
    clinicOk: (name: string) => `Great! I found your clinic: **${name}**. Let's continue.`,
    clinicFail: 'Invalid Clinic ID. Please check with your healthcare provider and try again.',
    askName: 'What is your full name? (as per Aadhaar)',
    askPhone: (name: string) => `Nice to meet you, ${name}! 📱 What is your 10-digit mobile number?`,
    otpSent: (phone: string) => `I've sent an OTP to +91 ${phone}. Please enter the 6-digit OTP below:`,
    otpFail: 'Incorrect OTP. Please try again or type "resend" to get a new OTP.',
    otpOk: 'Phone verified! ✅',
    askEmail: 'What is your email address? (optional — type "skip" to skip)',
    askDob: 'What is your date of birth? (format: DD/MM/YYYY)',
    askAmount: 'How much loan amount do you need? (in ₹, minimum ₹10,000)',
    askPurpose: 'What is the purpose of this loan? Choose one:',
    askEmployment: 'What is your employment type?',
    askIncome: 'What is your monthly income? (in ₹)',
    askExistingEmi: 'Do you have existing EMIs? Enter the total monthly amount in ₹ (or 0 if none):',
    askPan: 'Please enter your PAN card number (e.g. AAAAA0000A):',
    askAadhaar: 'Please enter the last 4 digits of your Aadhaar number:',
    submitting: 'Submitting your application... ⏳',
    done: (ref: string) => `Your application has been submitted! 🎉\n\nReference ID: **${ref}**\n\nOur team will call you within 2 hours.`,
    error: 'Something went wrong. Please try again.',
    back: '← Back',
    send: 'Send →',
    inputPlaceholder: 'Type your answer...',
    skip: 'Skip',
    resend: 'Resend OTP',
  },
  hi: {
    intro: 'नमस्ते! 👋 मैं Trustiva Setu से आपका लोन सहायक हूँ। मैं आपको कुछ मिनटों में मेडिकल लोन के लिए आवेदन करने में मदद करूँगा।',
    askClinic: 'शुरू करने के लिए, अपना क्लिनिक / अस्पताल ID दर्ज करें (उदा. TSC-ABC123)। यह क्लिनिक के रिसेप्शन पर मिलेगा।',
    clinicOk: (name: string) => `बढ़िया! आपका क्लिनिक मिला: **${name}**।`,
    clinicFail: 'गलत Clinic ID। कृपया अपने स्वास्थ्य प्रदाता से जांचें और दोबारा प्रयास करें।',
    askName: 'आपका पूरा नाम क्या है? (आधार के अनुसार)',
    askPhone: (name: string) => `${name} जी, आपका 10-अंकीय मोबाइल नंबर क्या है?`,
    otpSent: (phone: string) => `+91 ${phone} पर OTP भेजा गया। नीचे 6-अंकीय OTP दर्ज करें:`,
    otpFail: 'गलत OTP। फिर कोशिश करें या "resend" लिखें।',
    otpOk: 'फोन सत्यापित! ✅',
    askEmail: 'आपका ईमेल पता? (वैकल्पिक — छोड़ने के लिए "skip" लिखें)',
    askDob: 'आपकी जन्मतिथि क्या है? (फॉर्मेट: DD/MM/YYYY)',
    askAmount: 'आपको कितने लोन की आवश्यकता है? (₹ में, न्यूनतम ₹10,000)',
    askPurpose: 'इस लोन का उद्देश्य चुनें:',
    askEmployment: 'आपका रोजगार प्रकार?',
    askIncome: 'आपकी मासिक आय? (₹ में)',
    askExistingEmi: 'क्या आपकी कोई मौजूदा EMI है? कुल मासिक राशि ₹ में दर्ज करें (न हो तो 0):',
    askPan: 'अपना PAN कार्ड नंबर दर्ज करें (उदा. AAAAA0000A):',
    askAadhaar: 'अपने आधार के अंतिम 4 अंक दर्ज करें:',
    submitting: 'आवेदन जमा हो रहा है... ⏳',
    done: (ref: string) => `आपका आवेदन सफलतापूर्वक जमा हो गया! 🎉\n\nReference ID: **${ref}**\n\nहमारी टीम 2 घंटे के भीतर आपको कॉल करेगी।`,
    error: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
    back: '← वापस',
    send: 'भेजें →',
    inputPlaceholder: 'यहाँ टाइप करें...',
    skip: 'छोड़ें',
    resend: 'OTP दोबारा भेजें',
  },
}

const PURPOSE_OPTIONS = [
  'Dental', 'Hair Transplant', 'IVF / Fertility', 'LASIK Eye',
  'Cosmetology', 'Orthopaedics', 'Cardiology', 'Bariatric Surgery',
  'General Surgery', 'Hearing (ENT)', 'Other',
]

const EMPLOYMENT_OPTIONS = ['Salaried', 'Self-Employed', 'Business Owner', 'Other']

type StepId =
  | 'CLINIC' | 'NAME' | 'PHONE' | 'OTP' | 'EMAIL'
  | 'DOB' | 'AMOUNT' | 'PURPOSE' | 'EMPLOYMENT'
  | 'INCOME' | 'EXISTING_EMI' | 'PAN' | 'AADHAAR'
  | 'DONE'

const STEP_ORDER: StepId[] = [
  'CLINIC', 'NAME', 'PHONE', 'OTP', 'EMAIL',
  'DOB', 'AMOUNT', 'PURPOSE', 'EMPLOYMENT',
  'INCOME', 'EXISTING_EMI', 'PAN', 'AADHAAR', 'DONE',
]

function formatBotText(text: string) {
  return text.split('**').map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-bold">{part}</strong>
      : <span key={i}>{part}</span>
  )
}

function BotBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-[#bef264] flex items-center justify-center shrink-0 mb-0.5">
        <span className="text-[#07111f] font-bold text-xs">T</span>
      </div>
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%] shadow-sm">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
          {formatBotText(text)}
        </p>
      </div>
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end mb-3">
      <div className="bg-[#07111f] rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
        <p className="text-sm text-[#bef264] leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-[#bef264] flex items-center justify-center shrink-0">
        <span className="text-[#07111f] font-bold text-xs">T</span>
      </div>
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Chatbot({ initialClinicId }: { initialClinicId: string | null }) {
  const [lang, setLang] = useState<Lang>('en')
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState<StepId>('CLINIC')
  const [data, setData] = useState<ChatData>({ ...EMPTY })
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [quickOptions, setQuickOptions] = useState<string[] | null>(null)
  const [refId, setRefId] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const t = T[lang]

  function scrollBottom() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function botSay(text: string, opts?: { delay?: number; options?: string[] }) {
    const delay = opts?.delay ?? 600
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(m => [...m, { role: 'bot', text }])
      if (opts?.options) setQuickOptions(opts.options)
      scrollBottom()
    }, delay)
  }

  function userSay(text: string) {
    setMessages(m => [...m, { role: 'user', text }])
    setQuickOptions(null)
    scrollBottom()
  }

  // Boot sequence
  useEffect(() => {
    botSay(t.intro, { delay: 300 })
    if (initialClinicId) {
      setTimeout(() => validateClinic(initialClinicId), 1200)
    } else {
      setTimeout(() => botSay(t.askClinic), 1200)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function validateClinic(clinicId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/public/clinic/${encodeURIComponent(clinicId)}`)
      const json = await res.json()
      if (res.ok && json.data) {
        const c = json.data
        setData(d => ({ ...d, clinicId: c.id, clinicName: c.name, clinicAddress: c.address }))
        if (initialClinicId) {
          userSay(clinicId)
        }
        botSay(t.clinicOk(c.name), { delay: 400 })
        setTimeout(() => {
          setStep('NAME')
          botSay(t.askName)
        }, 1400)
      } else {
        botSay(t.clinicFail)
      }
    } catch {
      botSay(t.error)
    } finally {
      setLoading(false)
    }
  }

  async function sendOtp(phone: string) {
    setOtpSending(true)
    try {
      const res = await fetch('/api/public/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const json = await res.json()
      if (res.ok) {
        botSay(t.otpSent(phone))
        setStep('OTP')
      } else {
        botSay(json.error ?? t.error)
      }
    } catch {
      botSay(t.error)
    } finally {
      setOtpSending(false)
    }
  }

  async function verifyOtp(otp: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/public/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone, otp }),
      })
      const json = await res.json()
      if (json.verified) {
        botSay(t.otpOk, { delay: 300 })
        setTimeout(() => {
          setStep('EMAIL')
          botSay(t.askEmail)
        }, 900)
      } else {
        botSay(json.message ?? t.otpFail)
      }
    } catch {
      botSay(t.error)
    } finally {
      setLoading(false)
    }
  }

  async function submitLead() {
    setLoading(true)
    botSay(t.submitting, { delay: 300 })
    try {
      const res = await fetch('/api/public/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: data.clinicId,
          applicantName: data.name,
          phone: data.phone,
          email: data.email || undefined,
          amount: parseFloat(data.amount),
          treatmentName: data.purpose || undefined,
          dateOfBirth: data.dob || undefined,
          employmentType: data.employment || undefined,
          monthlyIncome: data.income ? parseFloat(data.income) : undefined,
          existingEMI: data.existingEmi ? parseFloat(data.existingEmi) : undefined,
          panNumber: data.pan || undefined,
          aadhaarLast4: data.aadhaar || undefined,
          source: 'CHATBOT',
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setRefId(json.referenceId)
        setTimeout(() => {
          setStep('DONE')
          botSay(t.done(json.referenceId), { delay: 800 })
        }, 1200)
      } else {
        botSay(json.error ?? t.error)
      }
    } catch {
      botSay(t.error)
    } finally {
      setLoading(false)
    }
  }

  function advanceStep(currentStep: StepId, value: string) {
    userSay(value)

    switch (currentStep) {
      case 'CLINIC':
        validateClinic(value.trim())
        break

      case 'NAME':
        setData(d => ({ ...d, name: value.trim() }))
        setStep('PHONE')
        botSay(t.askPhone(value.trim()))
        break

      case 'PHONE': {
        const ph = value.trim().replace(/\D/g, '')
        if (ph.length !== 10) { botSay('Please enter a valid 10-digit number.'); return }
        setData(d => ({ ...d, phone: ph }))
        botSay(`Sending OTP to +91 ${ph}...`, { delay: 200 })
        setTimeout(() => sendOtp(ph), 900)
        break
      }

      case 'OTP':
        if (value.trim().toLowerCase() === 'resend') {
          botSay(`Resending OTP to +91 ${data.phone}...`, { delay: 200 })
          setTimeout(() => sendOtp(data.phone), 600)
        } else {
          setData(d => ({ ...d }))
          verifyOtp(value.trim())
        }
        break

      case 'EMAIL':
        if (value.trim().toLowerCase() === 'skip') {
          setData(d => ({ ...d, email: '' }))
        } else {
          setData(d => ({ ...d, email: value.trim() }))
        }
        setStep('DOB')
        botSay(t.askDob)
        break

      case 'DOB':
        setData(d => ({ ...d, dob: value.trim() }))
        setStep('AMOUNT')
        botSay(t.askAmount)
        break

      case 'AMOUNT': {
        const amt = parseFloat(value.replace(/[,₹\s]/g, ''))
        if (!amt || amt < 10000) { botSay('Minimum loan amount is ₹10,000. Please enter a valid amount.'); return }
        setData(d => ({ ...d, amount: String(amt) }))
        setStep('PURPOSE')
        botSay(t.askPurpose, { options: PURPOSE_OPTIONS })
        break
      }

      case 'PURPOSE':
        setData(d => ({ ...d, purpose: value.trim() }))
        setStep('EMPLOYMENT')
        botSay(t.askEmployment, { options: EMPLOYMENT_OPTIONS })
        break

      case 'EMPLOYMENT':
        setData(d => ({ ...d, employment: value.trim() }))
        setStep('INCOME')
        botSay(t.askIncome)
        break

      case 'INCOME': {
        const inc = parseFloat(value.replace(/[,₹\s]/g, ''))
        if (!inc || inc < 0) { botSay('Please enter a valid monthly income.'); return }
        setData(d => ({ ...d, income: String(inc) }))
        setStep('EXISTING_EMI')
        botSay(t.askExistingEmi)
        break
      }

      case 'EXISTING_EMI': {
        const emi = parseFloat(value.replace(/[,₹\s]/g, '')) || 0
        setData(d => ({ ...d, existingEmi: String(emi) }))
        setStep('PAN')
        botSay(t.askPan)
        break
      }

      case 'PAN': {
        const pan = value.trim().toUpperCase()
        if (pan !== 'SKIP' && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
          botSay('Invalid PAN format. Please enter a valid PAN (e.g. AAAAA0000A) or type "skip".')
          return
        }
        setData(d => ({ ...d, pan: pan === 'SKIP' ? '' : pan }))
        setStep('AADHAAR')
        botSay(t.askAadhaar)
        break
      }

      case 'AADHAAR': {
        const aadh = value.trim().replace(/\D/g, '')
        if (aadh !== '' && aadh.length !== 4) {
          botSay('Please enter only the last 4 digits of your Aadhaar, or type "skip".')
          return
        }
        setData(d => ({ ...d, aadhaar: aadh }))
        submitLead()
        break
      }

      default:
        break
    }
  }

  function handleSend() {
    const val = input.trim()
    if (!val || loading) return
    setInput('')
    advanceStep(step, val)
    inputRef.current?.focus()
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const progressIndex = Math.max(0, STEP_ORDER.indexOf(step))
  const progress = step === 'DONE' ? 100 : Math.round((progressIndex / (STEP_ORDER.length - 1)) * 100)

  const isDone = step === 'DONE'

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5] overflow-hidden">
      {/* Header */}
      <div className="bg-[#07111f] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#bef264] flex items-center justify-center shrink-0">
            <span className="text-[#07111f] font-bold text-sm">T</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Trustiva Setu</p>
            <p className="text-[#bef264] text-xs">
              {data.clinicName ? `📍 ${data.clinicName}` : 'Loan Assistance'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
          className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition border border-white/20"
        >
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-[#07111f] px-4 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-[#bef264] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white/60 text-[10px] shrink-0">{progress}%</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((m, i) =>
          m.role === 'bot'
            ? <BotBubble key={i} text={m.text} />
            : <UserBubble key={i} text={m.text} />
        )}
        {typing && <TypingIndicator />}

        {/* Quick reply options */}
        {quickOptions && !typing && !isDone && (
          <div className="flex flex-wrap gap-2 mt-2 ml-9">
            {quickOptions.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { setInput(opt); setTimeout(() => { setInput(''); advanceStep(step, opt) }, 50) }}
                className="bg-white text-[#07111f] text-sm font-medium px-3 py-1.5 rounded-full border-2 border-[#07111f]/10 hover:border-[#bef264] hover:bg-[#bef264]/10 transition"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {!isDone && (
        <div className="bg-[#f0f0f0] px-3 py-3 shrink-0">
          {step === 'OTP' && (
            <button
              type="button"
              onClick={() => { userSay('resend'); setTimeout(() => sendOtp(data.phone), 300) }}
              disabled={otpSending}
              className="w-full text-center text-xs text-blue-600 mb-2 hover:underline disabled:opacity-50"
            >
              {t.resend}
            </button>
          )}
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
            {(step === 'EMAIL' || step === 'PAN' || step === 'AADHAAR') && (
              <button
                type="button"
                onClick={() => { setInput('skip'); setTimeout(() => { setInput(''); advanceStep(step, 'skip') }, 50) }}
                className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
              >
                {t.skip}
              </button>
            )}
            <input
              ref={inputRef}
              type={step === 'PHONE' || step === 'OTP' || step === 'INCOME' || step === 'EXISTING_EMI' || step === 'AMOUNT' ? 'tel' : 'text'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t.inputPlaceholder}
              maxLength={step === 'PAN' ? 10 : step === 'AADHAAR' ? 4 : step === 'OTP' ? 6 : step === 'PHONE' ? 10 : undefined}
              disabled={loading || otpSending}
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400 min-w-0"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || loading || otpSending}
              className="w-9 h-9 bg-[#bef264] rounded-full flex items-center justify-center shrink-0 hover:bg-[#a3cc52] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-[#07111f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Done bottom card */}
      {isDone && (
        <div className="bg-white border-t border-gray-200 px-4 py-4 shrink-0 text-center">
          <div className="bg-green-50 rounded-xl px-4 py-3 inline-block">
            <p className="text-xs text-gray-500">Reference ID</p>
            <p className="font-mono font-bold text-lg text-gray-800">{refId}</p>
          </div>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Trustiva Setu is a loan facilitation platform. Loans by partner banks/NBFCs. Approval at lender&apos;s discretion.
          </p>
        </div>
      )}
    </div>
  )
}

function ChatPage() {
  const searchParams = useSearchParams()
  const clinicParam = searchParams.get('clinic')
  return <Chatbot initialClinicId={clinicParam} />
}

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#07111f]">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-[#bef264] border-t-transparent" />
      </div>
    }>
      <ChatPage />
    </Suspense>
  )
}
