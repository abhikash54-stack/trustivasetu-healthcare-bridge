export function ComplianceFooter({ dark = false }: { dark?: boolean }) {
  const text = dark ? 'text-white/50' : 'text-gray-500'
  const border = dark ? 'border-white/10' : 'border-gray-200'
  const link = dark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
  const heading = dark ? 'text-white/80' : 'text-gray-700'
  const disclaimer = dark ? 'text-white/40' : 'text-gray-400'

  return (
    <footer className={`border-t ${border} px-6 py-6 mt-auto`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className={`text-sm font-semibold ${heading} mb-1`}>
              Trustivasetu — A Division of Aarthsetu Technologies Private Limited
            </p>
            <p className={`text-xs ${text} mt-1`}>
              5/70, Friend&apos;s Colony, Chandranagar, Moradabad, Uttar Pradesh - 244001
            </p>
            <a
              href="https://www.trustivasetu.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs ${link} mt-0.5 block`}
            >
              www.trustivasetu.com
            </a>
          </div>

          <div>
            <p className={`text-sm font-semibold ${heading} mb-1`}>Legal</p>
            <div className="flex flex-col gap-1">
              <a href="/privacy-policy" className={`text-xs ${link}`}>Privacy Policy</a>
              <a href="/terms" className={`text-xs ${link}`}>Terms &amp; Conditions</a>
              <a href="/disclaimer" className={`text-xs ${link}`}>Disclaimer</a>
            </div>
          </div>

          <div>
            <p className={`text-sm font-semibold ${heading} mb-1`}>Regulatory</p>
            <p className={`text-xs ${text}`}>
              Trustiva Setu is a loan facilitation platform. Not a bank or NBFC. Loans are provided by
              partner banks and NBFCs regulated by the RBI.
            </p>
          </div>
        </div>

        <div className={`pt-4 border-t ${border} space-y-2`}>
          <p className={`text-[11px] ${disclaimer} leading-relaxed`}>
            <strong className={text}>Disclaimer:</strong> Trustiva Setu is a loan facilitation platform. We are not a bank or
            NBFC. Loans are provided by our partner banks and NBFCs. Interest rates, processing fees and
            terms are subject to lender policies. Loan approval is at the sole discretion of the lender.
            EMI amounts shown are indicative only. 0% interest is subject to subvention arrangement with
            partner clinics. Terms and conditions apply.
          </p>
          <p className={`text-[11px] ${disclaimer}`}>
            &copy; 2024 Aarthsetu Technologies Private Limited. All rights reserved. | Governing law: India
          </p>
        </div>
      </div>
    </footer>
  )
}
