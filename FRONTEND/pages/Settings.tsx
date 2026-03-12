import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Lock, CreditCard, Bell, UserCheck, KeyRound, Fingerprint, Database, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [settings, setSettings] = useState({
    biometricLogin: true,
    stealthMode: false,
    metadataEncryption: true,
    handoverAlerts: true,
    escrowSummaries: false,
  });

  // Load settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const user = await api.getCurrentUser();
        if ((user as any).settings) {
          setSettings((user as any).settings);
        }
      } catch (err) {
        console.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleToggle = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || ''
        },
        body: JSON.stringify({ [key]: !settings[key] })
      });
      const json = await res.json();
      if (res.ok) showToast('✅ Settings saved!');
      else showToast('❌ Save failed');
    } catch {
      showToast('❌ Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-[#093E28]" size={40} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#093E28] text-white px-6 py-3 rounded-xl shadow-2xl z-[100] font-bold">
          {toast}
        </div>
      )}

      {showPasswordModal && (
        <ChangePasswordModal 
          onClose={() => setShowPasswordModal(false)} 
          onSuccess={() => { setShowPasswordModal(false); showToast('✅ Password changed!'); }}
        />
      )}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-8 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">Settings</h1>
        <p className="text-lg text-slate-600">Manage your account, security, and notification preferences.</p>
        {saving && <p className="text-sm text-amber-600 font-semibold mt-2">Saving...</p>}
      </div>

      <div className="space-y-10">
        <SettingsSection icon={<UserCheck />} title="Identity & Verification">
          <div className="bg-green-50 text-green-700 p-4 rounded-xl font-semibold flex items-center gap-3">
            <ShieldCheck size={20} />
            Your account is active and secured.
          </div>
        </SettingsSection>

        <SettingsSection icon={<KeyRound />} title="Access & Security">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between py-3 px-1 hover:bg-gray-50 rounded-lg transition-all"
          >
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <Lock size={16} /> Change Password
            </span>
            <ChevronLeft size={20} className="text-slate-400 rotate-180" />
          </button>
          <ToggleItem
            label="Biometric Login"
            sub="Use FaceID/TouchID for quick access."
            value={settings.biometricLogin}
            onChange={() => handleToggle('biometricLogin')}
          />
        </SettingsSection>

        <SettingsSection icon={<Database />} title="Privacy & Data">
          <ToggleItem
            label="Stealth Mode"
            sub="Hide items from non-verified users."
            value={settings.stealthMode}
            onChange={() => handleToggle('stealthMode')}
          />
          <ToggleItem
            label="Metadata Encryption"
            sub="Encrypt all chat and video logs."
            value={settings.metadataEncryption}
            onChange={() => handleToggle('metadataEncryption')}
          />
        </SettingsSection>

        <SettingsSection icon={<Bell />} title="Notifications">
          <ToggleItem
            label="Handover Alerts"
            sub="Mobile notifications for handshakes."
            value={settings.handoverAlerts}
            onChange={() => handleToggle('handoverAlerts')}
          />
          <ToggleItem
            label="Escrow Summaries"
            sub="Receive transaction receipts via email."
            value={settings.escrowSummaries}
            onChange={() => handleToggle('escrowSummaries')}
          />
        </SettingsSection>

        <SettingsSection icon={<CreditCard />} title="Payment Method">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gray-800 rounded-md flex items-center justify-center font-bold text-xs text-white">VISA</div>
              <div>
                <p className="font-bold text-slate-800">Visa ending in 4210</p>
                <p className="text-sm text-slate-500">Expires 12/26</p>
              </div>
            </div>
            <p className="text-sm font-bold text-green-600">Active</p>
          </div>
          <button className="w-full flex items-center justify-between py-3 px-1 hover:bg-gray-50 rounded-lg transition-all">
            <span className="font-semibold text-slate-700">Update Payment Method</span>
            <ChevronLeft size={20} className="text-slate-400 rotate-180" />
          </button>
        </SettingsSection>
      </div>
    </div>
  );
};

const ChangePasswordModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match!');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      });
      const json = await res.json();
      if (res.ok) onSuccess();
      else setError(json.msg || 'Failed to change password');
    } catch {
      setError('Server error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6">Change Password</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none text-sm sm:text-base"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none text-sm sm:text-base"
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none text-sm sm:text-base"
            required
          />
          <div className="flex gap-2 sm:gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 sm:py-3 rounded-full border border-gray-200 font-bold text-sm sm:text-base text-slate-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2 sm:py-3 rounded-full bg-[#093E28] text-white font-bold text-sm sm:text-base hover:opacity-90 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section>
    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
      <div className="text-[#093E28]">{icon}</div>
      {title}
    </h2>
    <div className="bg-white rounded-2xl soft-shadow p-6 space-y-4">
      {children}
    </div>
  </section>
);

const ToggleItem = ({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: () => void }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <h4 className="font-semibold text-slate-700">{label}</h4>
      <p className="text-sm text-slate-500">{sub}</p>
    </div>
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full transition-all relative ${value ? 'bg-[#093E28]' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${value ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);

export default Settings;
