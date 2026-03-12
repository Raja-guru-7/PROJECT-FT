import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Upload, CheckCircle2, Loader2, ChevronLeft } from 'lucide-react';

interface VideoUploadBoxProps {
  title: string;
  onUpload: (file: File) => void;
  isUploaded: boolean;
  progress: number;
  isUploading: boolean;
}

const VideoUploadBox: React.FC<VideoUploadBoxProps> = ({ title, onUpload, isUploaded, progress, isUploading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-[#093E28]/30 transition-colors group relative overflow-hidden">
      {isUploaded ? (
        <div className="flex flex-col items-center gap-2 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <span className="text-green-600 font-bold">Uploaded Successfully</span>
        </div>
      ) : isUploading ? (
        <div className="w-full space-y-4 px-4">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#093E28] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-[#093E28]/5 group-hover:text-[#093E28] transition-colors">
            <Video size={32} />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 mt-1">MP4, MOV up to 50MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 bg-[#093E28] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
          >
            <Upload size={16} /> Upload Video
          </button>
        </>
      )}
    </div>
  );
};

const ProofOfCondition: React.FC = () => {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState({
    before: { progress: 0, done: false, uploading: false, url: '' },
    after: { progress: 0, done: false, uploading: false, url: '' }
  });
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const uploadToCloudinary = async (file: File, type: 'before' | 'after') => {
    setUploads(prev => ({ ...prev, [type]: { ...prev[type], uploading: true, progress: 10 } }));

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('video', file, file.name);
      formData.append('type', type);

      // Simulate progress while uploading
      let p = 10;
      const progressInterval = setInterval(() => {
        p += 10;
        if (p < 90) {
          setUploads(prev => ({ ...prev, [type]: { ...prev[type], progress: p } }));
        }
      }, 300);

      const res = await fetch('http://localhost:5000/api/transaction/upload-proof-file', {
        method: 'POST',
        headers: { 'x-auth-token': token || '' },
        body: formData
      });

      clearInterval(progressInterval);

      if (res.ok) {
        const json = await res.json();
        setUploads(prev => ({ ...prev, [type]: { progress: 100, done: true, uploading: false, url: json.url || '' } }));
        showToast(`✅ ${type === 'before' ? 'Before' : 'After'} video uploaded!`);
      } else {
        throw new Error('Upload failed');
      }
    } catch {
      setUploads(prev => ({ ...prev, [type]: { progress: 0, done: false, uploading: false, url: '' } }));
      showToast('❌ Upload failed. Try again.');
    }
  };

  const bothUploaded = uploads.before.done && uploads.after.done;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#093E28] text-white px-6 py-3 rounded-xl shadow-2xl z-[100] font-bold">
          {toast}
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-8">
        <ChevronLeft size={20} /> Back
      </button>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-4">Proof-of-Condition</h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Protect yourself by documenting the item's condition before pickup and after return.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <VideoUploadBox
          title="Before Pickup Video"
          onUpload={(file) => uploadToCloudinary(file, 'before')}
          isUploaded={uploads.before.done}
          progress={uploads.before.progress}
          isUploading={uploads.before.uploading}
        />
        <VideoUploadBox
          title="After Return Video"
          onUpload={(file) => uploadToCloudinary(file, 'after')}
          isUploaded={uploads.after.done}
          progress={uploads.after.progress}
          isUploading={uploads.after.uploading}
        />
      </div>

      {bothUploaded && (
        <div className="mt-8 text-center animate-in fade-in">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#093E28] text-white px-10 py-4 rounded-full font-bold text-lg hover:opacity-90"
          >
            ✅ Submit Proof & Continue
          </button>
        </div>
      )}

      <div className="mt-12 bg-blue-50 border border-blue-100 p-6 rounded-3xl flex gap-4 items-start">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 mb-1">Why is this important?</h4>
          <p className="text-blue-800/70 text-sm leading-relaxed">
            Video evidence is the primary way we resolve disputes. Ensure the video shows all sides of the item and its functionality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProofOfCondition;
