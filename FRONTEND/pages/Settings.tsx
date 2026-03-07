
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Lock, CreditCard, Bell, UserCheck, KeyRound, Fingerprint, Mail, Eye, Database } from 'lucide-react';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
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
      </div>

      <div className="space-y-10">
        <SettingsSection icon={<UserCheck />} title="Identity & Verification">
          <div className="bg-green-50 text-green-700 p-4 rounded-xl font-semibold flex items-center gap-3">
             <ShieldCheck size={20} />
             Your identity is fully verified.
          </div>
        </SettingsSection>
        
        <SettingsSection icon={<KeyRound />} title="Access & Security">
          <SettingsItem label="Change Password" />
          <ToggleItem label="Biometric Login" sub="Use FaceID/TouchID for quick access." initial={true} />
        </SettingsSection>

        <SettingsSection icon={<Database />} title="Privacy & Data">
          <ToggleItem label="Stealth Mode" sub="Hide items from non-verified users." initial={false} />
          <ToggleItem label="Metadata Encryption" sub="Encrypt all chat and video logs." initial={true} />
        </SettingsSection>

        <SettingsSection icon={<Bell />} title="Notifications">
          <ToggleItem label="Handover Alerts" sub="Mobile notifications for handshakes." initial={true} />
          <ToggleItem label="Escrow Summaries" sub="Receive transaction receipts via email." initial={false} />
        </SettingsSection>

        <SettingsSection icon={<CreditCard />} title="Payment Method">
           <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
             <div className="flex items-center gap-4">
               <div className="w-12 h-8 bg-gray-800 border border-gray-300 rounded-md flex items-center justify-center font-bold text-xs text-white">VISA</div>
               <div>
                 <p className="font-bold text-slate-800">Visa ending in 4210</p>
                 <p className="text-sm text-slate-500">Expires 12/26</p>
               </div>
             </div>
             <p className="text-sm font-bold text-green-600">Active</p>
           </div>
           <SettingsItem label="Update Payment Method" />
        </SettingsSection>
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

const SettingsItem = ({ label }: { label: string }) => (
  <div className="flex items-center justify-between py-2">
    <span className="font-semibold text-slate-700">{label}</span>
    <ChevronLeft size={20} className="text-slate-400 rotate-180" />
  </div>
);

const ToggleItem = ({ label, sub, initial }: { label: string, sub: string, initial: boolean }) => {
  const [active, setActive] = useState(initial);
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <h4 className="font-semibold text-slate-700">{label}</h4>
        <p className="text-sm text-slate-500">{sub}</p>
      </div>
      <button onClick={() => setActive(!active)} className={`w-12 h-7 rounded-full transition-all relative ${active ? 'bg-[#093E28]' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${active ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
};

export default Settings;
