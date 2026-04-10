import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, CheckCircle, Camera } from 'lucide-react';
import { verifyKyc } from '../services/api';
import LivenessCamera from '../components/LivenessCamera';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';

export default function KycPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [liveSelfie, setLiveSelfie] = useState<File | null>(null);
  const [showLiveness, setShowLiveness] = useState(false);
  const [loading, setLoading] = useState(false);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file) setter(file);
  };

  const handleSubmit = async () => {
    if (!idFront || !idBack || !liveSelfie) {
      toast.error('All documents are required');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('idFront', idFront);
      fd.append('idBack', idBack);
      fd.append('liveSelfie', liveSelfie);
      await verifyKyc(fd);
      toast.success('KYC submitted successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'KYC submission failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    { label: 'ID Front', desc: 'Upload the front of your government-issued ID' },
    { label: 'ID Back', desc: 'Upload the back of your government-issued ID' },
    { label: 'Liveness', desc: 'Complete face verification' },
  ];

  const FileUploadCard = ({
    file, onUpload, label
  }: { file: File | null; onUpload: () => void; label: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center gap-4 transition-all cursor-pointer
        ${file ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-rose-300 hover:bg-rose-50'}`}
      onClick={onUpload}
    >
      {file ? (
        <>
          <CheckCircle size={48} className="text-green-500" />
          <div className="text-center">
            <p className="font-bold text-green-700 text-sm">Document Uploaded</p>
            <p className="text-green-600 text-xs mt-1 truncate max-w-[200px]">{file.name}</p>
          </div>
          {file.type.startsWith('image/') && (
            <img src={URL.createObjectURL(file)} alt="preview" className="w-32 h-20 object-cover rounded-xl border border-green-200" />
          )}
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center">
            <Upload size={28} className="text-rose-500" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-700 text-sm">{label}</p>
            <p className="text-gray-400 text-xs mt-1">Tap to upload • JPG, PNG, PDF</p>
          </div>
        </>
      )}
    </motion.div>
  );

  return (
    <PageWrapper className="min-h-screen bg-gray-50 pb-10">
      <AnimatePresence>
        {showLiveness && (
          <LivenessCamera
            mode="capture"
            onCapture={(file) => setLiveSelfie(file)}
            onSuccess={() => {
              setShowLiveness(false);
            }}
            onClose={() => setShowLiveness(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-red-500 pt-12 pb-8 px-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <button onClick={() => navigate(-1)} className="relative z-10 text-white/80 hover:text-white mb-4">
          <ArrowLeft size={24} />
        </button>
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold text-white">Identity Verification</h1>
          <p className="text-white/70 text-sm mt-1">Complete KYC to unlock all features</p>
        </div>

        {/* Step Progress */}
        <div className="relative z-10 flex items-center gap-2 mt-5">
          {stepLabels.map((_s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all
                ${step > i + 1 ? 'bg-white text-rose-600' : step === i + 1 ? 'bg-white text-rose-600 ring-2 ring-white/50 ring-offset-1 ring-offset-rose-500' : 'bg-white/30 text-white'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${step > i + 1 ? 'bg-white' : 'bg-white/30'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-white/80 text-xs mt-2 font-medium">
          {stepLabels[step - 1]?.label} — {stepLabels[step - 1]?.desc}
        </p>
      </div>

      <div className="px-5 py-6 space-y-5">
        {/* Step 1: ID Front */}
        {step === 1 && (
          <>
            <input ref={frontRef} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={(e) => handleFileChange(e, setIdFront)} />
            <FileUploadCard file={idFront} onUpload={() => frontRef.current?.click()} label="Upload ID Front" />
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
              <p className="font-semibold mb-1">💡 Tips for a good photo</p>
              <ul className="space-y-1 text-xs list-disc list-inside text-blue-600">
                <li>Ensure all corners are visible</li>
                <li>Good lighting, no glare</li>
                <li>Accepted: NIN Slip, Passport, Driver's License</li>
              </ul>
            </div>
            <button
              onClick={() => { if (idFront) setStep(2); else toast.error('Please upload ID front first'); }}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              Continue
            </button>
          </>
        )}

        {/* Step 2: ID Back */}
        {step === 2 && (
          <>
            <input ref={backRef} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={(e) => handleFileChange(e, setIdBack)} />
            <FileUploadCard file={idBack} onUpload={() => backRef.current?.click()} label="Upload ID Back" />
            <button
              onClick={() => { if (idBack) setStep(3); else toast.error('Please upload ID back first'); }}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              Continue
            </button>
          </>
        )}

        {/* Step 3: Liveness */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center gap-4">
              {liveSelfie ? (
                <>
                  <CheckCircle size={48} className="text-green-500" />
                  <p className="font-bold text-green-700">Liveness Captured!</p>
                  <p className="text-gray-500 text-sm text-center">Your face has been verified successfully.</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center">
                    <Camera size={36} className="text-rose-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800 text-base">Face Liveness Check</p>
                    <p className="text-gray-500 text-sm mt-1">We'll guide you through a quick face scan to verify your identity.</p>
                  </div>
                  <div className="w-full bg-gray-50 rounded-2xl p-4 space-y-2">
                    {['Look straight at the camera', 'Blink when prompted', 'Turn head slightly'].map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 bg-rose-100 text-rose-600 rounded-full text-xs flex items-center justify-center font-bold">{i + 1}</span>
                        {t}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowLiveness(true)}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Camera size={20} />
                    Start Liveness Check
                  </button>
                </>
              )}
            </div>

            {liveSelfie && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting KYC...
                  </span>
                ) : '✓ Submit KYC Documents'}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}
