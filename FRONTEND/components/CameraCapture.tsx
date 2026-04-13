import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCcw, CheckCircle2, Video, ShieldAlert, Square, SwitchCamera } from 'lucide-react';

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
  const [recordingTime, setRecordingTime] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error(err));
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCamera = async (overrideMode?: 'user' | 'environment') => {
    const currentMode = overrideMode || facingMode;
    try {
      if (stream) { stream.getTracks().forEach(track => track.stop()); }
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentMode },
        audio: mode === 'video'
      });
      setStream(s);
      if (overrideMode) setFacingMode(overrideMode);
    } catch (err) {
      console.error(err);
      alert('Camera access denied.');
    }
  };

  const handleToggleFacingMode = () => {
    startCamera(facingMode === 'user' ? 'environment' : 'user');
  };

  const stopCamera = () => {
    if (stream) { stream.getTracks().forEach(track => track.stop()); setStream(null); }
    if (isRecording) { stopRecording(); }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) { setCapturedBlob(blob); onCapture(blob); stopCamera(); }
    }, 'image/jpeg');
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setCapturedBlob(blob); onCapture(blob); stopCamera(); setIsRecording(false); setRecordingTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
      };
      mediaRecorder.start();
      setIsRecording(true);
      let seconds = 0;
      timerRef.current = setInterval(() => { seconds++; setRecordingTime(seconds); if (seconds >= 10) stopRecording(); }, 1000);
    } catch (err) { console.error(err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} className="w-full rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden aspect-square sm:aspect-[4/3] relative flex flex-col items-center justify-center shadow-sm">
      {!stream && !capturedBlob ? (
        <div className="flex flex-col items-center text-center p-6 sm:p-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4 sm:mb-6">
            {mode === 'video' ? <Video size={28} className="text-slate-400" /> : <Camera size={28} className="text-slate-400" />}
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-2 text-slate-900">{label}</h3>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 mb-6 sm:mb-8 max-w-[200px]">Live {mode} proof required for security.</p>
          <button onClick={() => startCamera()} className="px-6 py-2.5 sm:px-8 sm:py-3 bg-black text-white rounded-full font-semibold text-xs sm:text-sm">Activate Camera</button>
        </div>
      ) : capturedBlob ? (
        <div className="flex flex-col items-center text-center p-6 w-full h-full justify-center bg-white">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-50 border-2 border-green-500 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-1">Captured!</h2>
          <button onClick={() => { setCapturedBlob(null); startCamera(); }} className="flex items-center gap-2 px-5 py-2 border rounded-full font-bold text-[10px] uppercase mt-4"><RefreshCcw size={12} /> Retake</button>
        </div>
      ) : (
        <div className="w-full h-full bg-black relative">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="px-2.5 py-1 bg-black/50 border border-white/20 rounded-full flex items-center gap-2 backdrop-blur-md">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[9px] text-white font-bold uppercase tracking-wider">Live</span>
            </div>
          </div>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4 sm:gap-6">
            <button onClick={stopCamera} disabled={isRecording} className="w-10 h-10 rounded-full bg-black/40 border border-white/20 flex items-center justify-center backdrop-blur-md">
              <ShieldAlert size={18} color="white" />
            </button>
            <button onClick={mode === 'video' ? (isRecording ? stopRecording : startRecording) : takePhoto} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 border-4 ${isRecording ? 'border-red-500/50' : 'border-white/40'}`}>
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                {isRecording ? <Square size={16} className="text-red-500 fill-red-500" /> : <div className={`w-10 h-10 rounded-full ${mode === 'video' ? 'bg-red-500' : 'bg-white border border-slate-200'}`} />}
              </div>
            </button>
            <button disabled={isRecording} onClick={handleToggleFacingMode} className="w-10 h-10 rounded-full bg-black/40 border border-white/20 flex items-center justify-center backdrop-blur-md">
              <SwitchCamera size={18} color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;