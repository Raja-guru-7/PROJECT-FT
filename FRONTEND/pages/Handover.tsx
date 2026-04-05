import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Transaction } from '../types';
import { ShieldCheck, Lock, CheckCircle, Video, Loader2, ChevronLeft, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import CameraCapture from '../components/CameraCapture';
import { jwtDecode } from 'jwt-decode';

const Handover: React.FC = () => {
  const { txId } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState<Transaction | null>(null);
  const searchParams = new URLSearchParams(window.location.search);
  const isReturnFlow = searchParams.get('type') === 'return';

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [ownerVideo, setOwnerVideo] = useState<Blob | null>(null);
  const [renterVideo, setRenterVideo] = useState<Blob | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [checklist, setChecklist] = useState({ condition: false, functionality: false, accessories: false });
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const currentUserId = currentUserData?._id || (() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser) { try { const u = JSON.parse(storedUser); return u?._id || u?.id; } catch { } }
    if (storedToken) { try { const d: any = jwtDecode(storedToken); return d.id || d._id || d.user?.id || d.user?._id; } catch { } }
    return localStorage.getItem('userId') || localStorage.getItem('currentUserId');
  })();

  const txOwnerId = typeof tx?.ownerId === 'object' ? (tx?.ownerId as any)?._id || (tx?.ownerId as any)?.id : tx?.ownerId;
  const txRenterId = typeof tx?.renterId === 'object' ? (tx?.renterId as any)?._id || (tx?.renterId as any)?.id : tx?.renterId;
  
  const isOwner = String(currentUserId) === String(txOwnerId);
  const isRenter = String(currentUserId) === String(txRenterId);

  useEffect(() => {
    if (txId) {
      api.getTransactionById(txId).then(data => { setTx(data || null); updateStepFromStatus(data?.status); })
        .catch(err => { console.error('Failed to fetch transaction:', err); setTx(null); });
    }
  }, [txId, currentUserData]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try { const u = await api.getCurrentUser(); setCurrentUserData(u); }
      catch (err) { console.error('Failed to fetch current user:', err); }
    };
    fetchCurrentUser();
  }, []);

  const updateStepFromStatus = (status: string | undefined) => {
    if (isReturnFlow && status === 'ACTIVE') { setStep(1); return; }
    if (status === 'PENDING_HANDOVER' || status === 'REQUESTED' || status === 'PENDING_OTP') setStep(1);
    else if (status === 'HANDOVER_IN_PROGRESS' || status === 'OTP_VERIFIED' || status === 'IN_PROGRESS') setStep(2);
    else if (status === 'ACTIVE' || status === 'ALLOCATED') setStep(4);
    else if (status === 'RETURN_IN_PROGRESS') setStep(2);
    else if (status === 'RETURN_INITIATED') setStep(1);
    else if (status === 'COMPLETED') setStep(4);
    else setStep(1);
  };

  useEffect(() => { if (isReturnFlow && tx?.status === 'ACTIVE') setStep(1); }, [isReturnFlow, tx?.status]);

  useEffect(() => {
    if (!txId || tx?.status === 'COMPLETED') return;
    const interval = setInterval(async () => {
      try {
        const updatedTx = await api.getTransactionById(txId);
        if (updatedTx) {
          setTx(updatedTx);
          if (updatedTx.status === 'COMPLETED') { setStep(4); return; }
          if ((updatedTx.status === 'HANDOVER_IN_PROGRESS' || updatedTx.status === 'OTP_VERIFIED') && step === 1) {
            setStep(2);
          }
          else if (updatedTx.ownerVideoUrl && step === 2) setStep(3);
          else if (updatedTx.status === 'ACTIVE' && step < 4) setStep(isReturnFlow ? 1 : 4);
          else if (updatedTx.status === 'RETURN_IN_PROGRESS') setStep(2);
          else if (updatedTx.status === 'RETURN_INITIATED') setStep(1);
        }
      } catch (err) { console.error('Sync error:', err); }
    }, 3000);
    return () => clearInterval(interval);
  }, [txId, step, tx?.status, isReturnFlow]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp);
    if (value && index < 3) otpRefs[index + 1].current?.focus();
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs[index - 1].current?.focus();
  };

  const verifyOtp = async () => {
    if (!txId) return; setIsVerifying(true);
    try {
      const otpString = otp.join('');
      if (tx?.status === 'RETURN_IN_PROGRESS' || tx?.status === 'RETURN_INITIATED') {
        const result = await api.completeReturn(txId, otpString);
        if (result.success) setStep(4);
        else { alert('Invalid Return Code.'); setOtp(['', '', '', '']); otpRefs[0].current?.focus(); }
      } else {
        const isValid = await api.verifyOtp(txId, otpString);
        if (isValid) {
          setStep(2);
        }
        else { alert('Invalid Code.'); setOtp(['', '', '', '']); otpRefs[0].current?.focus(); }
      }
    } catch { alert('Terminal error. Retry.'); }
    finally { setIsVerifying(false); }
  };

  const handleOwnerProofSubmit = async () => {
    if (!txId || !ownerVideo) return; setIsUploadingProof(true);
    try { await api.uploadHandoverProof(txId, ownerVideo, 'OWNER'); setStep(3); }
    catch { alert('Upload failed. Retry.'); }
    finally { setIsUploadingProof(false); }
  };

  const handleComplete = async () => {
    if (!txId || !renterVideo) return; setIsCompleting(true);
    try {
      await api.uploadHandoverProof(txId, renterVideo, 'RENTER');
      await api.completeTransaction(txId);
      alert('Handover Complete!');
      navigate('/dashboard');
    } finally { setIsCompleting(false); }
  };

  const isOtpComplete = otp.every(d => d !== '');
  const isChecklistComplete = checklist.condition && checklist.functionality && checklist.accessories;

  if (!currentUserId && currentUserData !== null) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F7' }}>
      <div className="text-center space-y-4">
        <ShieldCheck className="mx-auto" size={48} color="#94a3b8" />
        <h2 className="text-xl font-bold" style={{ color: '#0f172a' }}>Authentication Required</h2>
        <button onClick={() => navigate('/login')} style={{ backgroundColor: '#000000', color: '#ffffff' }} className="px-6 py-2.5 rounded-full font-medium mt-2 hover:opacity-80 transition-opacity">Go to Login</button>
      </div>
    </div>
  );

  if (!tx) return (
    <div className="min-h-screen flex items-center justify-center gap-3" style={{ backgroundColor: '#F5F5F7' }}>
      <Loader2 className="animate-spin" size={32} color="#94a3b8" />
      <span className="font-medium" style={{ color: '#64748b' }}>Syncing Ledger...</span>
    </div>
  );

  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-8 pb-24 relative" style={{ backgroundColor: '#F5F5F7' }}>
      <button onClick={() => navigate(-1)} className="absolute top-8 left-4 md:left-8 flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity group z-10" style={{ color: '#64748b' }}>
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>
      <div className="max-w-[700px] mx-auto">

        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: '#0f172a' }}>Secure Handover Protocol</h1>
          <p className="mt-2 text-sm font-medium" style={{ color: '#64748b' }}>Asset: <span className="font-semibold" style={{ color: '#000000' }}>{tx.itemTitle}</span></p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-12 px-4 relative max-w-[400px] mx-auto">
          <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1 -z-10" style={{ backgroundColor: '#e2e8f0' }} />
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-3 relative z-10" style={{ backgroundColor: '#F5F5F7' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2"
                   style={{ 
                     backgroundColor: step > s ? '#000000' : step === s ? '#ffffff' : '#f1f5f9',
                     color: step > s ? '#ffffff' : step === s ? '#000000' : '#94a3b8',
                     borderColor: step >= s ? '#000000' : '#e2e8f0',
                     boxShadow: step === s ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                   }}>
                {step > s ? <CheckCircle size={18} /> : s}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] p-6 sm:p-10 shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {tx.status === 'RETURN_INITIATED' ? (
                isOwner ? (
                  <div className="space-y-6 text-center">
                    <StepHeader icon={<Lock size={20} color="#000000" />} title="Enter Return Code" subtitle="Enter the 4-digit verification code." />
                    <div className="flex justify-center gap-3">
                      {otp.map((digit, i) => (
                        <input key={i} ref={otpRefs[i]} type="text" maxLength={1} value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
                          className="w-14 h-16 text-center text-2xl font-bold rounded-xl outline-none transition-colors"
                          style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', WebkitTextFillColor: '#0f172a' }} />
                      ))}
                    </div>
                    <button onClick={verifyOtp} disabled={!isOtpComplete || isVerifying} style={{ backgroundColor: '#000000', color: '#ffffff' }} className="w-full py-3.5 rounded-full font-semibold disabled:opacity-50 mt-4 flex items-center justify-center">
                      {isVerifying ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 text-center">
                    <StepHeader icon={<Loader2 className="animate-spin" size={20} color="#64748b" />} title="Waiting for Owner" subtitle="Owner must authenticate the code." />
                    <div className="p-6 rounded-2xl" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>Verification In Progress</p>
                    </div>
                  </div>
                )
              ) : isRenter ? (
                <div className="space-y-6 text-center">
                  <StepHeader icon={<Lock size={20} color="#000000" />} title="Enter 4-Digit Code" subtitle="Ask the lender for the code." />
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input key={i} ref={otpRefs[i]} type="text" maxLength={1} value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-14 h-16 text-center text-2xl font-bold rounded-xl outline-none transition-colors"
                        style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', WebkitTextFillColor: '#0f172a' }} />
                    ))}
                  </div>
                  <button onClick={verifyOtp} disabled={!isOtpComplete || isVerifying} style={{ backgroundColor: '#000000', color: '#ffffff' }} className="w-full py-3.5 rounded-full font-semibold disabled:opacity-50 mt-4 flex items-center justify-center">
                    {isVerifying ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
                  </button>
                </div>
              ) : isOwner && tx.status === 'RETURN_IN_PROGRESS' ? (
                <div className="space-y-6 text-center">
                  <StepHeader icon={<Lock size={20} color="#000000" />} title="Enter Return Code" subtitle="Enter the 4-digit code." />
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input key={i} ref={otpRefs[i]} type="text" maxLength={1} value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-14 h-16 text-center text-2xl font-bold rounded-xl outline-none transition-colors"
                        style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', WebkitTextFillColor: '#0f172a' }} />
                    ))}
                  </div>
                  <button onClick={verifyOtp} disabled={!isOtpComplete || isVerifying} style={{ backgroundColor: '#000000', color: '#ffffff' }} className="w-full py-3.5 rounded-full font-semibold disabled:opacity-50 mt-4 flex items-center justify-center">
                    {isVerifying ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <StepHeader icon={<Lock size={20} color="#000000" />} title={tx.status === 'RETURN_IN_PROGRESS' ? 'Request Sent' : 'Waiting for Renter'} subtitle="Share the code to proceed." />
                  <div className="rounded-2xl p-6" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <p className="font-semibold text-sm mb-2" style={{ color: '#0f172a' }}>Authorization Pending</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>Provide the 4-digit code to the renter to unlock the camera scan stage.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {isOwner ? (
                <>
                  <StepHeader icon={<Video size={20} color="#000000" />} title={isReturnFlow ? 'Renter Scan' : 'Baseline Scan'} subtitle="Record the asset state now." />
                  <div className="rounded-2xl overflow-hidden z-10 relative" style={{ border: '1px solid #e2e8f0' }}>
                    {tx.status === 'HANDOVER_IN_PROGRESS' || tx.status === 'OTP_VERIFIED' || isReturnFlow ? (
                      <CameraCapture label="Start Recording" mode="video" onCapture={(blob) => setOwnerVideo(blob)} />
                    ) : (
                      <div className="p-6 sm:p-12 text-center" style={{ backgroundColor: '#f8fafc' }}>
                        <Loader2 className="animate-spin mx-auto mb-4" size={32} color="#94a3b8" />
                        <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>Waiting for Renter Authorization...</p>
                      </div>
                    )}
                  </div>
                  <button onClick={handleOwnerProofSubmit} disabled={!ownerVideo || isUploadingProof} style={{ backgroundColor: '#000000', color: '#ffffff' }} className="w-full py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                    {isUploadingProof ? <Loader2 className="animate-spin" size={20} /> : 'Upload Proof'}
                  </button>
                </>
              ) : (
                <div className="text-center space-y-6">
                  <StepHeader icon={<Video size={20} color="#000000" />} title="Owner Scanning..." subtitle="Owner is recording the baseline telemetry." />
                  <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Loader2 className="animate-spin mx-auto mb-4" size={32} color="#94a3b8" />
                    <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>Syncing Optical Data</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {isRenter ? (
                <>
                  <StepHeader icon={<ClipboardCheck size={20} color="#000000" />} title={isReturnFlow ? 'Lender Verify' : 'Final Acceptance'} subtitle="Verify and capture receiving telemetry." />
                  <div className="space-y-3 p-5 rounded-2xl" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    {Object.keys(checklist).map((key) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors hover:opacity-80">
                        <input type="checkbox" checked={checklist[key as keyof typeof checklist]}
                          onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                          className="w-5 h-5 accent-black" />
                        <span className="font-medium text-sm capitalize" style={{ color: '#334155' }}>{key} Verified</span>
                      </label>
                    ))}
                  </div>
                  <div className="rounded-2xl overflow-hidden z-10 relative" style={{ border: '1px solid #e2e8f0' }}>
                    <CameraCapture label="Record Receiving Proof" mode="video" onCapture={(blob) => setRenterVideo(blob)} />
                  </div>
                  <button onClick={handleComplete} disabled={!renterVideo || !isChecklistComplete || isCompleting} style={{ backgroundColor: '#000000', color: '#ffffff' }} className="w-full py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                    {isCompleting ? <Loader2 className="animate-spin" size={20} /> : 'Finalize Handover'}
                  </button>
                </>
              ) : (
                // ✅ FIX: Strict Inline Styling to Prevent Purple Background
                <div className="text-center space-y-6">
                  <StepHeader icon={<Loader2 className="animate-spin" size={20} color="#64748b" />} title="Waiting for Renter" subtitle="Renter is verifying condition." />
                  <div className="rounded-2xl p-6 sm:p-8 flex flex-col items-center" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                      <CheckCircle size={32} color="#22c55e" />
                    </div>
                    <p className="font-bold text-[15px] mb-2" style={{ color: '#0f172a' }}>Lender Scan Complete</p>
                    <p className="text-xs max-w-xs mx-auto leading-relaxed" style={{ color: '#64748b' }}>The renter is now performing the final checklist and recording the receiving video proof. Please wait.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>
                {tx.status === 'COMPLETED' ? 'Return Finalized' : 'Protocol Completed'}
              </h2>
              <p className="text-sm font-medium mb-6" style={{ color: '#64748b' }}>
                {tx.status === 'COMPLETED' ? 'The asset return has been verified. Trust scores updated.' : 'The handover is officially verified and secured in the ledger.'}
              </p>
              <button onClick={() => navigate('/dashboard')} style={{ backgroundColor: '#000000', color: '#ffffff' }} className="w-full py-3.5 rounded-full font-semibold">
                Return to Dashboard
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const StepHeader = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => (
  <div className="flex flex-col items-center mb-6">
    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
      {icon}
    </div>
    <h2 className="text-xl font-bold tracking-tight mb-1" style={{ color: '#0f172a' }}>{title}</h2>
    <p className="text-xs font-medium" style={{ color: '#64748b' }}>{subtitle}</p>
  </div>
);

export default Handover;