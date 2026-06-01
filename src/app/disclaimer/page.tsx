import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer — Trustiva Setu',
  description: 'Important disclaimers regarding Trustiva Setu loan facilitation services, interest rates, and lender decisions.',
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Disclaimer</h1>
          <p className="text-sm text-gray-500 mt-2">Last updated: 1 June 2026</p>
          <p className="text-sm text-gray-500">For queries: <a href="mailto:legal@trustivasetu.com" className="text-blue-600 underline">legal@trustivasetu.com</a></p>
        </div>

        <div className="space-y-6">

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-red-900 mb-3">Loan Facilitation Disclosure</h2>
            <p className="text-red-800 text-sm leading-relaxed">
              <strong>Trustiva Setu is a loan facilitation platform. We are not a bank or a
              Non-Banking Financial Company (NBFC) registered with the Reserve Bank of India (RBI).</strong>{' '}
              We do not lend money directly. All loans are provided by our partner banks and NBFCs, which are
              independently regulated by the RBI. Loan approval, terms, interest rates, and disbursement are
              entirely at the discretion of the lending institution.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-amber-900 mb-3">No Guarantee of Approval</h2>
            <p className="text-amber-800 text-sm leading-relaxed">
              Submitting a loan application through this Platform does not guarantee loan approval. Eligibility
              scores and offers shown on the Platform are <strong>indicative only</strong> and are based on
              preliminary data. Final approval is subject to the lender&apos;s credit assessment, KYC
              verification, document validation, and applicable credit policies. Trustiva Setu makes no
              representation or warranty that any application will be approved.
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">EMI and Interest Rate Disclaimer</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              EMI amounts, interest rates, and repayment schedules displayed on this Platform are
              <strong> indicative only</strong>. Actual EMI may vary based on lender terms, processing fees,
              applicable taxes (including GST), and other charges determined by the lender at the time of
              final sanction. The lender&apos;s sanction letter constitutes the binding financial terms.
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Zero Interest / No Cost EMI Disclaimer</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Where a &ldquo;0% interest&rdquo;, &ldquo;Zero Interest&rdquo;, or &ldquo;No Cost EMI&rdquo; product is displayed, this is
              subject to a <strong>subvention arrangement</strong> between the partner healthcare clinic and
              the lending institution. Under this model, the interest cost is borne by the clinic (not the
              patient) by way of a subvention payment to the lender. This arrangement:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1 text-gray-700 text-sm">
              <li>Is available only at participating clinics that have entered into a subvention agreement</li>
              <li>Is subject to the clinic&apos;s continued participation in the subvention programme</li>
              <li>May not apply to all loan amounts or tenures</li>
              <li>Is subject to lender eligibility criteria and approval</li>
              <li>Terms and conditions of the subvention arrangement apply</li>
            </ul>
            <p className="mt-3 text-gray-700 text-sm">
              If the subvention arrangement is not applicable or is withdrawn, standard interest rates of the
              lender will apply.
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Credit Assessment Disclosure</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Trustiva Setu uses a preliminary eligibility assessment system that evaluates alternative
              signals (such as income, employment type, and KYC status) to generate indicative offers.
              This preliminary assessment <strong>does not constitute a credit score or bureau check</strong>,
              and may not reflect the outcome of the lender&apos;s formal credit evaluation. Partner lenders
              may conduct their own credit bureau enquiries (including CIBIL, Experian, Equifax, or CRIF) as
              part of their standard credit assessment process. Such enquiries may affect your credit score.
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Lender Decision Disclaimer</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Trustiva Setu has no influence over a lender&apos;s decision to approve or reject any loan
              application, or over the terms offered. We are not responsible for any losses or inconvenience
              arising from a lender&apos;s decision. Disputes regarding loan terms, disbursement, or repayment
              must be addressed directly with the relevant lending institution.
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Data Privacy Statement</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Personal data submitted through this Platform, including identity documents (PAN, Aadhaar),
              financial information, and contact details, will be shared with partner lenders and KYC
              verification agencies for the sole purpose of processing your loan application. This data
              handling is governed by our{' '}
              <a href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</a>{' '}
              and is compliant with the Digital Personal Data Protection Act, 2023 (DPDP Act). We do not
              sell your data to third parties for marketing purposes.
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">General Disclaimer</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              The information on this Platform is provided for general informational purposes only. It does
              not constitute financial, legal, or investment advice. You should seek independent professional
              advice before making any financial decisions. Trustiva Setu makes no representation that the
              information on this Platform is accurate, complete, or current, and accepts no liability for
              any errors or omissions.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Regulatory Information</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Trustiva Setu operates as a loan aggregator/facilitator. Our partner lenders are regulated by
              the Reserve Bank of India (RBI). For any regulatory complaints, you may contact the RBI
              Ombudsman at{' '}
              <a href="https://cms.rbi.org.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                cms.rbi.org.in
              </a>.
            </p>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p><strong>Company:</strong> Aarthsetu Technologies Private Limited</p>
              <p><strong>Address:</strong> 5/70, Friend&apos;s Colony, Chandranagar, Moradabad, Uttar Pradesh - 244001</p>
              <p><strong>Website:</strong>{' '}
                <a href="https://www.trustivasetu.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">www.trustivasetu.com</a>
              </p>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-500">
          <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>
          <a href="/terms" className="text-blue-600 hover:underline">Terms &amp; Conditions</a>
          <a href="mailto:legal@trustivasetu.com" className="text-blue-600 hover:underline">Contact Legal</a>
        </div>
      </div>
    </div>
  )
}
