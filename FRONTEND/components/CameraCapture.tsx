
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCcw, CheckCircle2, Video, ShieldAlert } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  label: string;
  mode?: 'photo' | 'video';
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, label, mode = 'photo' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: mode === 'video' 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        onCapture(blob);
        stopCamera();
      }
    }, 'image/jpeg');
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      setCapturedBlob(blob);
      onCapture(blob);
      stopCamera();
    };
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="w-full bg-slate-100 rounded-[2.5rem] overflow-hidden aspect-[4/3] relative flex flex-col items-center justify-center border-8 border-white floating-3d shadow-inner">
      {!stream && !capturedBlob ? (
        <div className="flex flex-col items-center text-center p-8">
           <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-6 text-blue-600 animate-bounce">
             <Camera size={40} />
           </div>
           <h3 className="text-xl font-extrabold text-slate-900 mb-2">{label}</h3>
           <p className="text-sm text-slate-500 font-medium mb-8 max-w-[200px]">We'll record a live proof for community safety.</p>
           <button 
             onClick={startCamera}
             className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95"
           >
             Activate Camera
           </button>
        </div>
      ) : capturedBlob ? (
        <div className="flex flex-col items-center text-center p-8 bg-green-50/50 w-full h-full justify-center animate-in fade-in zoom-in duration-500">
          <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl shadow-green-200 flex items-center justify-center mb-8">
            <CheckCircle2 size={64} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Verified Successfully</h2>
          <p className="text-sm text-green-700 font-bold uppercase tracking-widest mb-10">Encrypted Proof Captured</p>
          <button 
            onClick={() => { setCapturedBlob(null); startCamera(); }}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase transition-all"
          >
            <RefreshCcw size={14} /> Restart Handover
          </button>
        </div>
      ) : (
        <div className="w-full h-full relative group">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          
          <div className="absolute top-8 left-8 flex items-center gap-3">
             <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live Secure Feed</span>
             </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
            <button className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30 transition-all">
               <ShieldAlert size={20} />
            </button>
            {mode === 'photo' ? (
              <button 
                onClick={takePhoto}
                className="w-20 h-20 rounded-full border-[6px] border-white/50 bg-white shadow-2xl hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
              >
                 <div className="w-14 h-14 rounded-full bg-red-500" />
              </button>
            ) : (
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full border-[6px] border-white/50 shadow-2xl hover:scale-110 active:scale-90 transition-all flex items-center justify-center ${isRecording ? 'bg-white' : 'bg-red-500'}`}
              >
                {isRecording ? <div className="w-8 h-8 bg-red-600 rounded-lg" /> : <Video className="text-white" size={32} />}
              </button>
            )}
            <button onClick={stopCamera} className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30 transition-all">
               <RefreshCcw size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
