import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, CheckCircle2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProofOfCondition: React.FC = () => {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState({ before: { progress: 0, done: false, uploading: false, url: '' }, after: { progress: 0, done: false, uploading: false, url: '' } });
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const uploadToCloudinary = async (file: File, type: 'before' | 'after') => {
    setUploads(prev => ({ ...prev, [type]: { ...prev[type], uploading: true, progress: 10 } }));
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('video', file, file.name); formData.append('type', type);
      let p = 10;
      const pi = setInterval(() => { p += 10; if (p < 90) setUploads(prev => ({ ...prev, [type]: { ...prev[type], progress: p } })); }, 300);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transaction/upload-proof-file`, { method: 'POST', headers: { 'x-auth-token': token || '' }, body: formData });
      clearInterval(pi);
      if (res.ok) { const json = await res.json(); setUploads(prev => ({ ...prev, [type]: { progress: 100, done: true, uploading: false, url: json.url || '' } })); showToast(`[${type.toUpperCase()}] SCAN VALIDATED`); }
      else throw new Error('Upload failed');
    } catch { setUploads(prev => ({ ...prev, [type]: { progress: 0, done: false, uploading: false, url: '' } })); showToast('TRANSMISSION FAILED'); }
  };

  const bothUploaded = uploads.before.done && uploads.after.done;

  return (
    <div className="bg-[#F5F5F7] min-h-screen px-4 md:px-8 py-8 sm:py-12 pb-24 relative">
      <button onClick={() => navigate(-1)} className="absolute top-6 sm:top-12 left-4 md:left-8 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group z-10">
        <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px] group-hover:-translate-x-1 transition-transform" /> Back
      </button>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[3000] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-white text-[10px] sm:text-xs tracking-wide bg-slate-800 shadow-lg whitespace-nowrap">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[800px] mx-auto relative z-10 pt-8 sm:pt-0">

        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-800 mb-2 sm:mb-3">Condition Protocols</h1>
          <p className="font-medium text-xs sm:text-sm text-slate-500 max-w-md mx-auto px-4">Execute visual scans pre and post engagement to ensure integrity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <VideoUploadBox title="Pre-Engagement Scan" onUpload={(f) => uploadToCloudinary(f, 'before')} isUploaded={uploads.before.done} progress={uploads.before.progress} isUploading={uploads.before.uploading} />
          <VideoUploadBox title="Post-Engagement Scan" onUpload={(f) => uploadToCloudinary(f, 'after')} isUploaded={uploads.after.done} progress={uploads.after.progress} isUploading={uploads.after.uploading} />
        </div>

        {bothUploaded && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 sm:mt-10 flex justify-center">
            <button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-full bg-black text-white text-sm sm:text-base font-semibold hover:bg-slate-800 transition-colors shadow-md">
              Submit Logs & Exit
            </button>
          </motion.div>
        )}

        <div className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-2xl flex gap-3 sm:gap-4 items-start bg-blue-50 border border-blue-100">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
            <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div>
            <h4 className="text-blue-800 font-bold mb-1 text-xs sm:text-sm">Protocol Imperative</h4>
            <p className="text-[10px] sm:text-xs font-medium text-blue-600/80 leading-relaxed">Visual logs form immutable evidence within the network. Ensure optical sensors capture all asset facets to prevent allocation disputes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoUploadBox: React.FC<{ title: string; onUpload: (f: File) => void; isUploaded: boolean; progress: number; isUploading: boolean; }> = ({ title, onUpload, isUploaded, progress, isUploading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) onUpload(f); };

  return (
    // ERROR FIXED HERE: div kulla iruntha duplicate className thookitu single class aakitenn
    <div onClick={() => !isUploaded && !isUploading && fileInputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-3 sm:gap-4 p-5 sm:p-8 rounded-2xl sm:rounded-3xl cursor-pointer transition-all border-2 bg-white sm:min-h-[220px] ${isUploaded ? 'border-solid border-green-200 shadow-sm' : 'border-dashed border-slate-200 hover:bg-slate-50'
        }`} style={{ minHeight: '180px' }}>
      {isUploaded ? (
        <div className="flex flex-col items-center gap-1.5 sm:gap-2 text-green-600">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="font-bold text-xs sm:text-sm">Upload Complete</span>
        </div>
      ) : isUploading ? (
        <div className="w-full space-y-2 sm:space-y-3 px-3 sm:px-4">
          <div className="flex justify-between text-[10px] sm:text-xs font-semibold text-slate-500">
            <span className="animate-pulse">Uploading...</span><span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-black transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400">
            <Video size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-slate-800 text-xs sm:text-sm">{title}</h3>
            <p className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400">MP4, MOV / 50MB MAX</p>
          </div>
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
          <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="mt-1 sm:mt-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            Select Video
          </button>
        </>
      )}
    </div>
  );
};

export default ProofOfCondition;