'use client'

import { useState } from 'react'
import { EMI_PRODUCTS } from '@/lib/los/constants'
import { useLos } from '../LosProvider'
import { btnPrimary, Field, inputCls, selectCls } from '../ui'

function calcEmi(principal: number, rate: number, tenure: number) {
  const r = rate / 12 / 100
  if (r === 0) return principal / tenure
  return (principal * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1)
}

export function EmiCalculatorModule() {
  const { db, saveEmiQuote, notify } = useLos()
  const [loanAmount, setLoanAmount] = useState(500000)
  const [advanceEmi, setAdvanceEmi] = useState(0)
  const [tenure, setTenure] = useState(12)
  const [processingFee, setProcessingFee] = useState(2)
  const [interestRate, setInterestRate] = useState(18)
  const [productCode, setProductCode] = useState<string>(EMI_PRODUCTS[0].code)
  const [leadId, setLeadId] = useState('')
  const [result, setResult] = useState<{
    monthlyEmi: number
    totalPayable: number
    netDisbursal: number
    upfront: number
  } | null>(null)

  function generate() {
    const pf = (loanAmount * processingFee) / 100
    const net = loanAmount - pf - advanceEmi
    const monthly = calcEmi(net, interestRate, tenure)
    const total = monthly * tenure + advanceEmi + pf
    setResult({
      monthlyEmi: Math.round(monthly),
      totalPayable: Math.round(total),
      netDisbursal: Math.round(net),
      upfront: Math.round(advanceEmi + pf),
    })
  }

  async function saveQuote() {
    if (!result) return
    await saveEmiQuote({
      leadId: leadId || undefined,
      loanAmount,
      advanceEmi,
      tenure,
      processingFee,
      interestRate,
      productCode,
      ...result,
    })
    notify('ok', 'EMI quote saved')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-lime-300">Finance Estimator / EMI Calculator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
        <Field label="Loan amount (₹)">
          <input type="number" className={inputCls} value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} />
        </Field>
        <Field label="Advance EMI (₹)">
          <input type="number" className={inputCls} value={advanceEmi} onChange={(e) => setAdvanceEmi(Number(e.target.value))} />
        </Field>
        <Field label="Tenure (months)">
          <input type="number" className={inputCls} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} />
        </Field>
        <Field label="Processing fee (%)">
          <input type="number" className={inputCls} value={processingFee} onChange={(e) => setProcessingFee(Number(e.target.value))} />
        </Field>
        <Field label="Interest rate (% p.a.)">
          <input type="number" className={inputCls} value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
        </Field>
        <Field label="Product">
          <select className={selectCls} value={productCode} onChange={(e) => setProductCode(e.target.value)}>
            {EMI_PRODUCTS.map((p) => (
              <option key={p.code} value={p.code} className="text-black">{p.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Attach to lead (optional)">
          <select className={selectCls} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
            <option value="">None</option>
            {db.leads.map((l) => (
              <option key={l.id} value={l.id} className="text-black">{l.id} — {l.applicantName}</option>
            ))}
          </select>
        </Field>
        <div className="flex items-end gap-2">
          <button type="button" className={btnPrimary} onClick={generate}>Generate Quote</button>
          {result && (
            <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={saveQuote}>
              Save to lead
            </button>
          )}
        </div>
      </div>
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-lime-300/10 border border-lime-300/30 p-4 rounded-xl">
            <p className="text-xs text-gray-400">Monthly EMI</p>
            <p className="text-xl font-bold">₹{result.monthlyEmi.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-xs text-gray-400">Upfront</p>
            <p className="text-xl font-bold">₹{result.upfront.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-xs text-gray-400">Total payable</p>
            <p className="text-xl font-bold">₹{result.totalPayable.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-xs text-gray-400">Net disbursal</p>
            <p className="text-xl font-bold">₹{result.netDisbursal.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  )
}
