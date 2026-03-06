
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Transaction } from '../types';
import { ShieldCheck, Lock, CheckCircle, Video, Loader2, ChevronLeft, ClipboardCheck } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';

const Handover: React.FC = () => {
  const { txId } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState<Transaction | null>(null);
  
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [ownerVideo, setOwnerVideo] = useState<Blob | null>(null);
  const [renterVideo, setRenterVideo] = useState<Blob | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  
  const [checklist, setChecklist] = useState({
    condition: false,
    functionality: false,
    accessories: false
  });

  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    if (txId) api.getTransactionById(txId).then(data => setTx(data || null));
  }, [txId]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) otpRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs[index - 1].current?.focus();
  };

  const verifyOtp = async () => {
    if (!txId) return;
    setIsVerifying(true);
    try {
      const isValid = await api.verifyOtp(txId, otp.join(''));
      if (isValid) {
        setStep(2);
      } else {
        alert("Invalid Security Code.");
        setOtp(['', '', '', '']);
        otpRefs[0].current?.focus();
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      alert("An error occurred while verifying the code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOwnerProofSubmit = async () => {
    if (!txId || !ownerVideo) return;
    setIsUploadingProof(true);
    try {
      await api.uploadHandoverProof(txId, ownerVideo, 'OWNER');
      setStep(3);
    } catch (error) {
      console.error("Owner Proof Upload Error:", error);
      alert("Failed to upload proof. Please try again.");
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleComplete = async () => {
    if (!txId || !renterVideo) return;
    setIsCompleting(true);
    try {
      await api.uploadHandoverProof(txId, renterVideo, 'RENTER');
      await api.completeTransaction(txId);
      alert("Handover Successful! Rental is now ACTIVE.");
      navigate('/dashboard');
    } finally {
      setIsCompleting(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');
  const isChecklistComplete = checklist.condition && checklist.functionality && checklist.accessories;

  if (!tx) return <div className="p-20 text-center font-semibold text-slate-500">Loading Transaction...</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-12 pb-40">
      <button 
        type="button"
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-8"
      >
        <ChevronLeft size={20} />
        Back
      </button>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900">Secure Handover</h1>
        <p className="text-slate-500 font-semibold mt-2">Item: {tx.itemTitle}</p>
      </div>

      <div className="flex items-center justify-between mb-12 px-6">
        {[1, 2, 3].map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${step >= s ? 'bg-[#093E28] text-white' : 'bg-gray-200 text-slate-500'}`}>
                {step > s ? <CheckCircle size={20} /> : s}
              </div>
              <span className={`text-xs font-bold ${step >= s ? 'text-[#093E28]' : 'text-slate-400'}`}>
                {s === 1 ? 'Verify' : s === 2 ? 'Lender Proof' : 'Renter Proof'}
              </span>
            </div>
            {i < 2 && <div className={`flex-1 h-1 mx-4 rounded-full ${step > s ? 'bg-[#093E28]' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-3xl soft-shadow p-8 sm:p-10">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in">
            <StepHeader icon={<Lock />} title="Physical Verification" subtitle="Enter the 4-digit code from the item owner." />
            <div className="flex justify-center gap-4">
              {otp.map((digit, i) => (
                <input key={i} ref={otpRefs[i]} type="text" maxLength={1} value={digit} disabled={isVerifying} className="w-16 h-20 text-center text-4xl font-bold bg-gray-100 border-2 border-gray-200 rounded-2xl focus:border-[#093E28] outline-none text-slate-800 transition-all" onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} />
              ))}
            </div>
            <button onClick={verifyOtp} disabled={!isOtpComplete || isVerifying} className="w-full bg-[#FF7A59] text-white py-4 rounded-full font-bold text-lg hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-3">
              {isVerifying ? <Loader2 className="animate-spin" /> : 'Authorize'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in">
            <StepHeader icon={<Video />} title="Owner's Handover Proof" subtitle="Record a live video of the item being handed over." />
            <CameraCapture label="Capture Lender Proof" mode="video" onCapture={(blob) => setOwnerVideo(blob)} />
            <button onClick={handleOwnerProofSubmit} disabled={!ownerVideo || isUploadingProof} className="w-full bg-[#093E28] text-white py-4 rounded-full font-bold text-lg hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-3">
              {isUploadingProof ? <Loader2 className="animate-spin" /> : 'Proceed'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in">
            <StepHeader icon={<ClipboardCheck />} title="Final Condition Report" subtitle="Confirm the item's state and record your receiving proof." />
            <div className="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-200">
              {[{ key: 'condition', label: 'Item matches listed condition' }, { key: 'functionality', label: 'Functionality verified' }, { key: 'accessories', label: 'All accessories included' }].map((item) => (
                <label key={item.key} className="flex items-center gap-4 cursor-pointer">
                  <input type="checkbox" checked={checklist[item.key as keyof typeof checklist]} onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })} className="w-5 h-5 rounded-md border-gray-300 text-[#093E28] focus:ring-[#093E28]/50" />
                  <span className="font-semibold text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
            <CameraCapture label="Record Receiving Proof" mode="video" onCapture={(blob) => setRenterVideo(blob)} />
            <button onClick={handleComplete} disabled={!renterVideo || !isChecklistComplete || isCompleting} className="w-full bg-green-600 text-white py-4 rounded-full font-bold text-lg hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-3">
              {isCompleting ? <Loader2 className="animate-spin" /> : 'Complete Handover'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4 text-slate-500 p-4 bg-gray-50 rounded-2xl">
        <ShieldCheck size={24} className="shrink-0 text-green-600" />
        <p className="text-sm font-semibold">By finalizing, both parties confirm the asset state. Disputes without video proof are ineligible for claims.</p>
      </div>
    </div>
  );
};

const StepHeader = ({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) => (
  <div className="text-center">
    <div className="w-12 h-12 bg-[#E7EDE4] text-[#093E28] rounded-full flex items-center justify-center mx-auto mb-4">{icon}</div>
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    <p className="text-slate-500">{subtitle}</p>
  </div>
);

export default Handover;
