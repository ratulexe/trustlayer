import React, { useEffect, useState } from 'react';
import { Coins, Lock, Sparkles, Store } from 'lucide-react';

export default function InclusionScreen() {
  const [profile, setProfile] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loanAmount, setLoanAmount] = useState('10000');
  const [loanStatus, setLoanStatus] = useState(null);
  const [isDisbursing, setIsDisbursing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, ledgerRes] = await Promise.all([
          fetch('/api/merchants/ramu-tea-stall/credit-profile'),
          fetch('/api/ledger')
        ]);
        const pData = await profileRes.json();
        const lData = await ledgerRes.json();

        setProfile(pData);
        setLedgerEntries(lData.entries || []);
      } catch (err) {
        console.error('Failed to load inclusion profile', err);
      }
    }
    loadData();
  }, []);

  const handleDrawdown = async (e) => {
    e.preventDefault();
    setIsDisbursing(true);
    setLoanStatus(null);

    try {
      const res = await fetch('/api/credit/drawdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(loanAmount), tenureDays: 30 })
      });
      const data = await res.json();
      if (data.success) {
        setLoanStatus({
          type: 'success',
          message: `${data.message} Auto-repayment: ₹${data.loan.dailyDeduction}/day`
        });
      } else {
        setLoanStatus({ type: 'error', message: data.error || 'Drawdown rejected' });
      }
    } catch (err) {
      setLoanStatus({ type: 'error', message: err.message });
    } finally {
      setIsDisbursing(false);
    }
  };

  const merchant = profile?.merchant;
  const assessment = profile?.creditAssessment;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FINANCIAL INCLUSION & ALTERNATIVE CREDIT RAIL</span>
        </div>
        <h2 className="text-2xl font-bold text-[#0F1F17] tracking-tight font-display">
          Informal Merchant Cashflow Underwriting
        </h2>
        <p className="text-sm text-[#5C6B63] max-w-xl mx-auto">
          Unlocking formal credit for 60M+ street vendors with zero CIBIL history using real-time UPI transaction continuity.
        </p>
      </div>

      {/* Top Banner: Merchant Profile & TrustScore */}
      <div className="sage-card rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#047857] to-[#059669] text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#0F1F17] font-display">
                  {merchant?.name || 'Ramu Tea & Snacks Corner'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase font-mono">
                  Nano-Merchant
                </span>
              </div>
              <p className="text-xs text-[#5C6B63] mt-1">
                VPA: <strong className="font-mono text-[#24352C]">{merchant?.vpa || 'ramu.tea@upi'}</strong> • Indiranagar, Bengaluru • Bureau History: <span className="text-rose-600 font-semibold font-mono">CIBIL Invisible</span>
              </p>
            </div>
          </div>

          {/* Dynamic TrustScore Box */}
          <div className="flex items-center gap-6 bg-[#F7FAF8] border border-[#D4E0D5] px-6 py-3.5 rounded-2xl shrink-0">
            <div>
              <span className="text-[11px] text-[#5C6B63] uppercase tracking-wider font-semibold block font-mono">
                TrustScore (300-900)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-brand-600 font-mono">
                  {assessment?.trustScore || 785}
                </span>
                <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {assessment?.ratingBand || 'Excellent'}
                </span>
              </div>
            </div>
            <div className="border-l border-[#D4E0D5] pl-6">
              <span className="text-[11px] text-[#5C6B63] uppercase tracking-wider font-semibold block font-mono">
                Pre-Approved Working Capital
              </span>
              <span className="text-2xl font-black text-emerald-600 font-mono">
                ₹{assessment?.preApprovedLimit ? assessment.preApprovedLimit.toLocaleString('en-IN') : '15,000'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Middle Grid: 4 Scoring Pillars + Instant Loan Drawdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: 4 Scoring Pillars */}
        <div className="lg:col-span-7 sage-card rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="border-b border-[#E2EAE3] pb-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-[#0F1F17] font-display">
                Algorithmic Underwriting Pillars
              </h4>
              <p className="text-xs text-[#5C6B63]">
                Evaluating 30-day UPI cashflows instead of traditional collateral
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold bg-[#EAF0EB] px-2 py-0.5 rounded text-[#5C6B63]">
              3,120 Txns
            </span>
          </div>

          <div className="space-y-3">
            {(assessment?.scoringBreakdown || [
              { pillar: 'Transaction Continuity', weight: '25%', score: 240, status: 'High' },
              { pillar: 'Customer Diversity (Anti-Wash Trade)', weight: '25%', score: 235, status: 'Robust' },
              { pillar: 'Revenue Regularity', weight: '30%', score: 280, status: 'Strong' },
              { pillar: 'Dispute & Chargeback Resilience', weight: '20%', score: 195, status: 'Near-Zero' }
            ]).map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#D4E0D5] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0F1F17] font-display">{item.pillar}</span>
                    <span className="text-[11px] font-mono text-[#8E9C94]">({item.weight} wt)</span>
                  </div>
                  <span className="text-xs text-[#5C6B63] font-mono">
                    Status: <strong className="text-emerald-700">{item.status}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black font-mono text-brand-600">{item.score}</span>
                  <span className="text-[11px] text-[#8E9C94] block font-mono">Points</span>
                </div>
              </div>
            ))}
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#F7FAF8] border border-[#D4E0D5]">
              <span className="text-[11px] text-[#8E9C94] block">DAILY VOLUME:</span>
              <span className="font-bold text-[#0F1F17]">₹2,840/day</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F7FAF8] border border-[#D4E0D5]">
              <span className="text-[11px] text-[#8E9C94] block">UNIQUE PAYERS:</span>
              <span className="font-bold text-[#0F1F17]">342 Customers</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F7FAF8] border border-[#D4E0D5]">
              <span className="text-[11px] text-[#8E9C94] block">STABILITY:</span>
              <span className="font-bold text-emerald-600">94.8% Active</span>
            </div>
          </div>
        </div>

        {/* Right: Instant 1-Click Working Capital Loan Simulator */}
        <div className="lg:col-span-5 sage-card rounded-3xl p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#E2EAE3] pb-3 mb-4">
              <h4 className="font-bold text-sm text-[#0F1F17] font-display">
                1-Click Micro-Credit Drawdown
              </h4>
              <p className="text-xs text-[#5C6B63]">
                Working capital disbursed instantly to merchant UPI VPA
              </p>
            </div>

            <form onSubmit={handleDrawdown} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#24352C] font-semibold mb-1">
                  Loan Amount (Max: ₹15,000)
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  min="1000"
                  max="15000"
                  step="500"
                  className="w-full bg-[#F7FAF8] border border-[#D4E0D5] rounded-xl px-3 py-2.5 text-[#0F1F17] font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  required
                />
              </div>

              <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#D4E0D5] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#5C6B63]">Interest (APR):</span>
                  <span className="text-[#0F1F17] font-bold">11.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C6B63]">Tenure:</span>
                  <span className="text-[#0F1F17] font-bold">30 Days</span>
                </div>
                <div className="flex justify-between border-t border-[#D4E0D5] pt-1.5">
                  <span className="text-[#5C6B63]">Auto Daily Repayment:</span>
                  <span className="text-emerald-600 font-bold">₹{Math.round(parseFloat(loanAmount || 0) * 1.009 / 30)}/day</span>
                </div>
                <span className="text-[11px] text-[#8E9C94] block italic">
                  Deducted automatically from daily incoming UPI settlements.
                </span>
              </div>

              {loanStatus && (
                <div className={`p-3 rounded-xl border text-xs font-mono ${
                  loanStatus.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {loanStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isDisbursing}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition font-display flex items-center justify-center gap-2"
              >
                <Coins className="w-4 h-4" />
                <span>{isDisbursing ? 'Disbursing via UPI...' : 'Disburse Instant Capital (UPI) →'}</span>
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Bottom: Cryptographic Audit Ledger */}
      <div className="sage-card rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2EAE3] pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-600" />
            <h4 className="font-bold text-sm text-[#0F1F17] font-display">
              Cryptographic Audit Ledger (Non-Repudiation)
            </h4>
          </div>
          <span className="text-[11px] font-mono text-[#5C6B63]">
            Chained Hash: SHA-256 with Masked PII
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#D4E0D5] text-[#5C6B63] uppercase text-[11px] bg-[#F7FAF8]">
                <th className="py-2.5 px-3 rounded-l-lg">#</th>
                <th className="py-2.5 px-3">Txn ID</th>
                <th className="py-2.5 px-3">Payer (Masked)</th>
                <th className="py-2.5 px-3">Payee VPA</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 rounded-r-lg">Entry Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAE3]">
              {ledgerEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-4 text-center text-[#8E9C94]">
                    No transactions committed to chain yet.
                  </td>
                </tr>
              ) : (
                ledgerEntries.slice(0, 5).map((entry, idx) => (
                  <tr key={idx} className="hover:bg-[#F7FAF8] transition">
                    <td className="py-2.5 px-3 text-[#8E9C94]">{entry.index}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#0F1F17]">{entry.txnId}</td>
                    <td className="py-2.5 px-3 text-[#5C6B63]">{entry.payload?.payerMasked}</td>
                    <td className="py-2.5 px-3 text-brand-600 font-medium">{entry.payload?.payeeVpa}</td>
                    <td className="py-2.5 px-3 text-[#0F1F17] font-bold">₹{entry.payload?.amount}</td>
                    <td className="py-2.5 px-3 font-bold text-[#24352C]">{entry.payload?.riskScore}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        entry.status === 'SETTLED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#8E9C94] text-[11px]">{entry.entryHash?.substring(0, 12)}...</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
