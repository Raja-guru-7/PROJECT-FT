import React, { useRef, useState, useEffect } from 'react';
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
  const [recordingTime, setRecordingTime] = useState(0); // Optional: track seconds
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error('Video play error:', err));
    }
  }, [stream]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCamera = async (overrideMode?: 'user' | 'environment') => {
    const currentMode = overrideMode || facingMode;
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentMode }, 
        audio: mode === 'video'
      });
      setStream(s);
      if (overrideMode) setFacingMode(overrideMode);
    } catch (err) {
      console.error('Preferred camera access denied, attempting fallback', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true, 
          audio: mode === 'video'
        });
        setStream(fallbackStream);
      } catch (fallbackErr) {
        console.error('All camera access failed', fallbackErr);
        alert('Camera/Microphone access denied. Please allow permissions.');
      }
    }
  };

  const handleToggleFacingMode = () => {
    startCamera(facingMode === 'user' ? 'environment' : 'user');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (isRecording) {
      stopRecording();
    }
  };

  // --- PHOTO LOGIC ---
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

  // --- VIDEO LOGIC ---
  const startRecording = () => {
    if (!stream) return;
    
    chunksRef.current = [];
    try {
      // Use standard mp4/webm depending on browser support
      const mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setCapturedBlob(blob);
        onCapture(blob);
        stopCamera();
        setIsRecording(false);
        setRecordingTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start a simple timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
        // Optional: Auto stop after 10 seconds for proof
        if (seconds >= 10) {
           stopRecording();
        }
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} className="w-full rounded-[2rem] overflow-hidden aspect-[4/3] relative flex flex-col items-center justify-center shadow-sm">

      {!stream && !capturedBlob ? (
        <div className="flex flex-col items-center text-center p-8">
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9' }} className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm">
            {mode === 'video' ? <Video size={32} color="#94a3b8" /> : <Camera size={32} color="#94a3b8" />}
          </div>
          <h3 style={{ color: '#0f172a' }} className="text-xl font-bold mb-2">{label}</h3>
          <p style={{ color: '#64748b' }} className="text-xs font-medium mb-8 max-w-[220px]">
            Please capture a live {mode === 'video' ? 'video' : 'photo'} proof for security and community trust.
          </p>
          <button
            onClick={() => startCamera()}
            style={{ backgroundColor: '#000000', color: '#ffffff' }}
            className="px-8 py-3 rounded-full font-semibold text-sm hover:opacity-80 transition-all shadow-md"
          >
            Activate Camera
          </button>
        </div>
      ) : capturedBlob ? (
        <div style={{ backgroundColor: '#ffffff' }} className="flex flex-col items-center text-center p-8 w-full h-full justify-center">
          <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #22c55e' }} className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle2 size={48} color="#22c55e" />
          </div>
          <h2 style={{ color: '#0f172a' }} className="text-2xl font-bold mb-2">
            {mode === 'video' ? 'Video' : 'Photo'} Captured
          </h2>
          <p style={{ color: '#64748b' }} className="text-sm font-medium mb-10">Asset verification successfully saved.</p>
          
          {mode === 'video' && (
            <video 
              src={URL.createObjectURL(capturedBlob)} 
              controls 
              className="w-48 h-32 object-cover rounded-xl border border-slate-200 shadow-sm mb-6 bg-black" 
            />
          )}

          <button
            onClick={() => { setCapturedBlob(null); startCamera(); }}
            style={{ border: '1px solid #e2e8f0', color: '#475569', backgroundColor: '#ffffff' }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs uppercase hover:bg-slate-50 transition-all"
          >
            <RefreshCcw size={14} color="#475569" /> Retake
          </button>
        </div>
      ) : (
        <div style={{ backgroundColor: '#000000' }} className="w-full h-full relative flex items-center justify-center">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

          <div className="absolute top-6 left-6 flex gap-2">
            <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }} className="px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
              <div style={{ backgroundColor: '#ef4444' }} className="w-2 h-2 rounded-full animate-pulse" />
              <span style={{ color: '#ffffff' }} className="text-[10px] font-bold uppercase tracking-wider">Live Feed</span>
            </div>
            
            {isRecording && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)' }} className="px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
                <span style={{ color: '#fca5a5' }} className="text-[10px] font-bold uppercase tracking-wider">
                  00:0{recordingTime} / 00:10
                </span>
              </div>
            )}
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
            <button onClick={stopCamera} disabled={isRecording} style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', opacity: isRecording ? 0.5 : 1 }} className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/60 transition-all">
              <ShieldAlert size={18} color="#ffffff" />
            </button>

            <button 
              onClick={mode === 'video' ? (isRecording ? stopRecording : startRecording) : takePhoto} 
              style={{ border: isRecording ? '4px solid rgba(239, 68, 68, 0.8)' : '4px solid rgba(255,255,255,0.4)' }} 
              className="w-18 h-18 rounded-full p-1 transition-all hover:scale-105 active:scale-95"
            >
              <div style={{ backgroundColor: '#ffffff' }} className="w-full h-full rounded-full flex items-center justify-center">
                {mode === 'video' && isRecording ? (
                   <Square size={20} color="#ef4444" fill="#ef4444" />
                ) : (
                  <div style={{ backgroundColor: mode === 'video' ? '#ef4444' : '#ffffff', border: mode === 'photo' ? '2px solid #e2e8f0' : 'none' }} className="w-14 h-14 rounded-full" />
                )}
              </div>
            </button>

            <button disabled={isRecording} onClick={handleToggleFacingMode} style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', opacity: isRecording ? 0.5 : 1 }} className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/60 transition-all">
              <SwitchCamera size={18} color="#ffffff" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;