import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera } from 'lucide-react';
import { livenessCheck } from '../services/api';
import toast from 'react-hot-toast';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  onCapture?: (file: File) => void;
  mode?: 'verify' | 'capture';
}

const steps = [
  { text: 'Look straight ahead', duration: 2000 },
  { text: 'Please blink slowly', duration: 2000 },
  { text: 'Turn head slightly left', duration: 2000 },
];

export default function LivenessCamera({ onSuccess, onClose, onCapture, mode = 'verify' }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [phase, setPhase] = useState<'countdown' | 'detection' | 'done'>('countdown');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      toast.error('Camera access denied. Please allow camera access.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Countdown phase
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('detection');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Detection phase - cycle through steps
  useEffect(() => {
    if (phase !== 'detection') return;
    if (stepIndex >= steps.length) {
      captureFrame();
      return;
    }
    const t = setTimeout(() => {
      setStepIndex((i) => i + 1);
    }, steps[stepIndex].duration);
    return () => clearTimeout(t);
  }, [phase, stepIndex]);

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'liveness.jpg', { type: 'image/jpeg' });
      stopCamera();
      setPhase('done');

      if (mode === 'capture' && onCapture) {
        onCapture(file);
        onSuccess();
        return;
      }

      setIsSubmitting(true);
      try {
        const fd = new FormData();
        fd.append('liveSelfie', file);
        await livenessCheck(fd);
        toast.success('Liveness verified!');
        onSuccess();
      } catch {
        toast.error('Liveness check failed. Please try again.');
        onClose();
      } finally {
        setIsSubmitting(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const currentStep = steps[stepIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center"
    >
      <div className="w-full max-w-md px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">Liveness Check</h2>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-white/70 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Camera Feed */}
        <div className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-gray-900 mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Face oval overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div
                className="border-4 border-rose-400 rounded-full"
                style={{ width: '180px', height: '220px' }}
              />
              {phase === 'detection' && (
                <>
                  <div
                    className="absolute inset-0 border-4 border-rose-300/40 rounded-full liveness-ring"
                    style={{ width: '180px', height: '220px' }}
                  />
                  <div
                    className="absolute inset-0 border-4 border-rose-300/20 rounded-full liveness-ring"
                    style={{ width: '180px', height: '220px', animationDelay: '0.5s' }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Dark overlay corners */}
          <div className="absolute inset-0 bg-black/30 pointer-events-none" 
               style={{ maskImage: 'radial-gradient(ellipse 55% 45% at 50% 50%, transparent 70%, black 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 55% 45% at 50% 50%, transparent 70%, black 100%)' }} />

          {/* Countdown overlay */}
          <AnimatePresence>
            {phase === 'countdown' && countdown > 0 && (
              <motion.div
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                key={countdown}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-black/60 rounded-full w-20 h-20 flex items-center justify-center">
                  <span className="text-white text-5xl font-bold">{countdown}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instruction */}
        <AnimatePresence mode="wait">
          {phase === 'countdown' && (
            <motion.div key="countdown-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center text-white/80 text-base">
              Get ready for liveness check...
            </motion.div>
          )}
          {phase === 'detection' && currentStep && (
            <motion.div key={stepIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="text-center">
              <div className="bg-rose-600 rounded-2xl px-6 py-4">
                <p className="text-white text-lg font-semibold">{currentStep.text}</p>
                <div className="mt-3 bg-white/20 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: currentStep.duration / 1000, ease: 'linear' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
          {(phase === 'done' || isCapturing) && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center">
              <div className="bg-green-600 rounded-2xl px-6 py-4 flex items-center justify-center gap-2">
                <Camera size={20} className="text-white" />
                <p className="text-white text-lg font-semibold">
                  {isSubmitting ? 'Verifying...' : 'Capturing...'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
