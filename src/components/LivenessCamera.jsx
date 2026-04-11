import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

// Strictly defined steps so the user knows exactly what to do
const STEPS = [
  { id: 'load',  msg: 'Loading AI Models...', icon: '🧠', hint: 'Please wait' },
  { id: 'face',  msg: 'Look straight at camera', icon: '👤', hint: 'Position face in oval' },
  { id: 'left',  msg: 'Now tilt head LEFT', icon: '⬅️', hint: 'Just a slight tilt' },
  { id: 'right', msg: 'Now tilt head RIGHT', icon: '➡️', hint: 'Just a slight tilt' },
  { id: 'blink', msg: 'Blink ONCE to finish', icon: '😑', hint: 'Quick blink' },
  { id: 'done',  msg: 'Success! Capturing...', icon: '✅', hint: 'Hold still' },
];

const getDistance = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
const getEAR = (eye) => (getDistance(eye[1], eye[5]) + getDistance(eye[2], eye[4])) / (2.0 * getDistance(eye[0], eye[3]));

export default function LivenessCamera({ onCapture, onCancel }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [camError, setCamError] = useState('');
  const [ready, setReady] = useState(false);

  // ML State tracking
  const isBlinkingRef = useRef(false);
  const blinkCountRef = useRef(0);
  const detectionLoopRef = useRef(null);
  
  // THE LOCK: Prevents multiple pictures and triple popups
  const hasCapturedRef = useRef(false); 

  const stopStream = useCallback(() => {
    cancelAnimationFrame(detectionLoopRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const captureFrame = useCallback(() => {
    if (hasCapturedRef.current) return; // If already captured, abort!
    hasCapturedRef.current = true;      // Lock it down
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(blob => {
      const file = new File([blob], 'live_selfie.jpg', { type: 'image/jpeg' });
      stopStream();
      onCapture(file); // Only sends to backend ONCE
    }, 'image/jpeg', 0.92);
  }, [onCapture, stopStream]);

  const detectFace = useCallback(async () => {
    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
    const video = videoRef.current;

    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

    if (!detection) {
      setStepIdx(1); 
      setProgress(10);
    } else {
      const landmarks = detection.landmarks;
      const nose = landmarks.getNose()[0];
      const jaw = landmarks.getJawOutline();
      
      const yawRatio = getDistance(nose, jaw[0]) / getDistance(nose, jaw[16]);
      const avgEAR = (getEAR(landmarks.getLeftEye()) + getEAR(landmarks.getRightEye())) / 2;

      setStepIdx((currentStep) => {
        // If we already finished, do nothing else
        if (currentStep === 5) return 5; 

        if (currentStep <= 1) {
          setProgress(25);
          return 2; // Tell them to Turn Left
        } 
        else if (currentStep === 2) {
          if (yawRatio < 0.90) { setProgress(50); return 3; } // Tell them to Turn Right
        }
        else if (currentStep === 3) {
          if (yawRatio > 1.10) { setProgress(75); return 4; } // Tell them to Blink
        }
        else if (currentStep === 4) {
          if (avgEAR < 0.28) {
            if (!isBlinkingRef.current) { blinkCountRef.current += 1; isBlinkingRef.current = true; }
          } else {
            isBlinkingRef.current = false;
          }
          if (blinkCountRef.current >= 1) { 
            setProgress(100); 
            setTimeout(captureFrame, 300); // Wait 0.3s then take ONE picture
            return 5; // Move to Done state
          } 
        }
        return currentStep;
      });
    }

    // Only continue looping if we haven't finished
    if (!hasCapturedRef.current) {
      detectionLoopRef.current = requestAnimationFrame(detectFace);
    }
  }, [captureFrame]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        
        if (!mounted) return;
        setStepIdx(1);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
          detectFace();
        }
      } catch (e) {
        if (mounted) setCamError('Camera access denied. Please allow camera and retry.');
      }
    })();
    return () => { mounted = false; stopStream(); };
  }, [detectFace, stopStream]);

  return (
    <div className="flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-black mx-1" style={{ aspectRatio: '3/4' }}>
        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />

        {/* Oval guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-44 h-60 border-[3px] border-rose-400 rounded-full transition-all duration-500"
            style={{
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.52)',
              borderColor: ready ? '#f43f5e' : 'rgba(255,255,255,0.3)',
            }} />
        </div>

        {/* Scan line */}
        {ready && stepIdx > 0 && stepIdx < 5 && (
          <div className="absolute left-1/2 -translate-x-1/2 w-44 overflow-hidden" style={{ top: '12%', height: '65%' }}>
            <motion.div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent"
              animate={{ y: ['0%', '6000%'] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }} />
          </div>
        )}

        {/* Corner decorations */}
        {['top-[8%] left-[20%]', 'top-[8%] right-[20%]', 'bottom-[14%] left-[20%]', 'bottom-[14%] right-[20%]'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-5 h-5 pointer-events-none`}
            style={{
              borderColor: '#f43f5e', borderWidth: '2.5px', borderStyle: 'solid', borderRadius: '2px',
              borderRight: i % 2 === 0 ? 'none' : '2.5px solid #f43f5e',
              borderLeft:  i % 2 === 1 ? 'none' : '2.5px solid #f43f5e',
              borderBottom: i < 2 ? 'none' : '2.5px solid #f43f5e',
              borderTop:    i >= 2 ? 'none' : '2.5px solid #f43f5e',
            }} />
        ))}

        {/* Step label */}
        <AnimatePresence mode="wait">
          <motion.div key={stepIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute bottom-4 left-4 right-4 rounded-2xl px-4 py-3 text-center"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}>
            <span className="text-2xl mr-2">{STEPS[stepIdx]?.icon}</span>
            <span className="text-white text-sm font-semibold">{STEPS[stepIdx]?.msg}</span>
            {STEPS[stepIdx]?.hint && <p className="text-white/50 text-xs mt-0.5">{STEPS[stepIdx].hint}</p>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress */}
      <div className="mx-2 mt-4">
        <div className="flex justify-between text-xs text-white/40 mb-1.5">
          <span>Liveness Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div className="h-2 rounded-full" style={{ background: 'linear-gradient(90deg,#e11d48,#7c3aed)' }}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      <button onClick={() => { stopStream(); onCancel?.() }}
        className="mx-2 mt-4 mb-2 py-3 rounded-2xl border border-white/10 text-white/40 text-sm font-medium hover:text-white/70 hover:border-white/20 transition-all">
        Cancel
      </button>
    </div>
  );
}