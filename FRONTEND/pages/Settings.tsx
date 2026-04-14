import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Lock, CreditCard, Bell, UserCheck, KeyRound, Database, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const cardStyle = {
  background: '#ffffff',
  borderRadius: '1.5rem',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  padding: '1.5rem'
};

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [settings, setSettings] = useState({ biometricLogin: true, stealthMode: false, metadataEncryption: true, handoverAlerts: true, escrowSummaries: false });
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const user = await api.getCurrentUser();
        setUserData(user);
        if ((user as any).settings) setSettings((user as any).settings);
      } catch (err) { console.error('Failed to load settings'); }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleToggle = async (key: keyof typeof settings) => {
    const newValue = !settings[key];
    const newSettings = { ...settings, [key]: newValue };
    setSettings(newSettings);
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
        body: JSON.stringify({ [key]: newValue })
      });
      if (res.ok) showToast('Preferences Synced');
      else { showToast('Sync failed'); setSettings(settings); }
    } catch { showToast('Network Error'); setSettings(settings); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7]">
      <Loader2 className="animate-spin text-slate-400" size={40} />
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#F5F5F7] pb-24 relative">
      <button type="button" onClick={() => navigate(-1)}
        className="absolute top-4 sm:top-8 left-4 md:left-8 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group z-10">
        <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px] group-hover:-translate-x-1 transition-transform" /> Back
      </button>
      <div className="max-w-[800px] mx-auto px-4 md:px-8 py-6 sm:py-12 mt-8 sm:mt-0">

        {showPasswordModal && (
          <ChangePasswordModal
            onClose={() => setShowPasswordModal(false)}
            onSuccess={() => { setShowPasswordModal(false); showToast('Password changed!'); }}
          />
        )}

        {toast && (
          <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[3000] px-4 py-2 rounded-full font-semibold text-white text-[10px] sm:text-xs tracking-wide bg-slate-800 shadow-lg whitespace-nowrap">
            {toast}
          </div>
        )}

        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-800">Settings</h1>
            {saving && <Loader2 size={16} className="animate-spin text-slate-400" />}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Manage your account, security, and notification preferences.</p>
        </div>

        <div className="space-y-4 sm:space-y-8">

          {/* Identity & Verification */}
          <SettingsSection icon={<UserCheck className="w-4 h-4 sm:w-6 sm:h-6" />} title="Identity & Verification">
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-slate-100 flex flex-col items-center gap-2 sm:gap-3 text-center shadow-sm">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 ${userData?.isVerified ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                <ShieldCheck size={20} className="sm:w-6 sm:h-6" />
              </div>
              <p className="text-slate-800 font-semibold text-xs sm:text-sm">
                Status: <span className={userData?.isVerified ? 'text-green-600' : 'text-amber-600'}>{userData?.isVerified ? 'KYC Verified' : 'Pending Verification'}</span>
              </p>
              <p className="text-[10px] sm:text-xs font-medium text-slate-500 max-w-sm">
                {userData?.isVerified ? 'Your identity is anchored to the trust ledger.' : 'Complete your KYC to anchor your identity to the network.'}
              </p>
            </div>
          </SettingsSection>

          {/* Access & Security */}
          <SettingsSection icon={<KeyRound className="w-4 h-4 sm:w-6 sm:h-6" />} title="Access & Security">
            <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
              <span className="font-semibold text-xs sm:text-sm text-slate-700 flex items-center gap-2 sm:gap-3"><Lock size={14} className="sm:w-4 sm:h-4 text-slate-400" /> Change Password</span>
              <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px] rotate-180 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
            <div className="h-px w-full bg-slate-100 my-1 sm:my-2" />
            <ToggleItem label="Biometric Login" sub="Use FaceID/TouchID for quick access." value={settings.biometricLogin} onChange={() => handleToggle('biometricLogin')} />
          </SettingsSection>

          {/* Privacy & Data */}
          <SettingsSection icon={<Database className="w-4 h-4 sm:w-6 sm:h-6" />} title="Privacy & Data">
            <ToggleItem label="Stealth Mode" sub="Hide items from non-verified users." value={settings.stealthMode} onChange={() => handleToggle('stealthMode')} />
            <div className="h-px w-full bg-slate-100 my-1 sm:my-2" />
            <ToggleItem label="Metadata Encryption" sub="Encrypt all chat and video logs." value={settings.metadataEncryption} onChange={() => handleToggle('metadataEncryption')} />
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection icon={<Bell className="w-4 h-4 sm:w-6 sm:h-6" />} title="Notifications">
            <ToggleItem label="Handover Alerts" sub="Mobile notifications for handshakes." value={settings.handoverAlerts} onChange={() => handleToggle('handoverAlerts')} />
            <div className="h-px w-full bg-slate-100 my-1 sm:my-2" />
            <ToggleItem label="Escrow Summaries" sub="Receive transaction receipts via email." value={settings.escrowSummaries} onChange={() => handleToggle('escrowSummaries')} />
          </SettingsSection>

          {/* Payment Method */}
          <SettingsSection icon={<CreditCard className="w-4 h-4 sm:w-6 sm:h-6" />} title="Payment Method">
            {userData?.paymentMethod?.last4 ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-7 sm:w-12 sm:h-8 rounded-md flex items-center justify-center font-bold text-[8px] sm:text-[10px] text-slate-600 uppercase bg-slate-100 border border-slate-200">
                    {userData.paymentMethod.cardType || 'CARD'}
                  </div>
                  <div>
                    <p className="font-semibold text-xs sm:text-sm text-slate-800">{userData.paymentMethod.cardType || 'Card'} ending in {userData.paymentMethod.last4}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Expires {userData.paymentMethod.expiry}</p>
                  </div>
                </div>
                <div className="flex self-start sm:self-auto items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-green-50 text-green-700 w-max">
                  <CheckCircle2 size={10} className="sm:w-3 sm:h-3" /> <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">Active</span>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center bg-slate-50 border-2 border-dashed border-slate-200">
                <p className="font-medium text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">No active payment method linked.</p>
                <button onClick={() => showToast('Payment flow initialization...')}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-semibold text-white bg-black hover:bg-slate-800 transition-colors w-full sm:w-auto">
                  Add Method
                </button>
              </div>
            )}
          </SettingsSection>

        </div>
      </div>
    </div>
  );
};

// Change Password Modal 
const ChangePasswordModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match!'); return; }
    if (form.newPassword.length < 6) { setError('Password must be at least 6 characters!'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      });
      const json = await res.json();
      if (res.ok) onSuccess(); else setError(json.msg || 'Failed to change password');
    } catch { setError('Server error. Try again.'); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', // slightly less round for mobile
    padding: '10px 14px', fontSize: '0.875rem', color: '#0f172a', WebkitTextFillColor: '#0f172a', outline: 'none'
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-md shadow-2xl mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6">Change Password</h2>
        {error && <div className="mb-4 sm:mb-5 p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-red-600 bg-red-50 border border-red-100">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 mb-1 sm:mb-1.5 ml-1 uppercase tracking-wide">Current Password</label>
            <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} style={inputStyle} required />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 mb-1 sm:mb-1.5 ml-1 uppercase tracking-wide">New Password</label>
            <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} style={inputStyle} required />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 mb-1 sm:mb-1.5 ml-1 uppercase tracking-wide">Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} style={inputStyle} required />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button type="button" onClick={onClose} className="w-full sm:flex-1 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors order-2 sm:order-1">Cancel</button>
            <button type="submit" disabled={loading} className="w-full sm:flex-1 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-black hover:bg-slate-800 transition-colors disabled:opacity-60 order-1 sm:order-2">
              {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section className="bg-white rounded-[1.25rem] sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="px-4 sm:px-6 py-3 sm:py-5 border-b border-slate-50 flex items-center gap-2 sm:gap-3 bg-slate-50/50">
      <div className="text-slate-400">{icon}</div>
      <h2 className="text-sm sm:text-base font-bold text-slate-800">{title}</h2>
    </div>
    <div className="p-3 sm:p-6 space-y-1 sm:space-y-2">
      {children}
    </div>
  </section>
);

const ToggleItem = ({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: () => void }) => (
  <div className="flex items-center justify-between py-2 sm:py-3 px-1 sm:px-2">
    <div className="pr-2">
      <h4 className="font-semibold text-slate-700 text-xs sm:text-sm">{label}</h4>
      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-snug">{sub}</p>
    </div>
    <button onClick={onChange} className={`w-10 sm:w-11 h-5 sm:h-6 rounded-full relative transition-colors shrink-0 ${value ? 'bg-black' : 'bg-slate-200'}`}>
      <div className={`absolute top-0.5 sm:top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${value ? 'left-[22px] sm:left-6' : 'left-1'}`} />
    </button>
  </div>
);

export default Settings;