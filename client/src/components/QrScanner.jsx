import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Camera, ImageUp, X, Loader2 } from 'lucide-react';

// Real QR scanning with the browser's built-in BarcodeDetector (Chrome on Android, Edge,
// Chrome desktop on most systems). No extra library. Camera needs HTTPS or localhost.
const hasDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

async function makeDetector() {
  if (!hasDetector) return null;
  try {
    const formats = await window.BarcodeDetector.getSupportedFormats();
    if (!formats.includes('qr_code')) return null;
    return new window.BarcodeDetector({ formats: ['qr_code'] });
  } catch {
    return null;
  }
}

export default function QrScanner({ onResult, onClose }) {
  const { t } = useLanguage();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const doneRef = useRef(false);
  const fileRef = useRef(null);
  const [status, setStatus] = useState('starting'); // starting | scanning | unsupported | denied | nocamera | error
  const [message, setMessage] = useState('');
  // Keep the latest callback without restarting the camera when the parent re-renders
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const finish = useCallback(
    (raw) => {
      if (doneRef.current) return;
      doneRef.current = true;
      stopCamera();
      if (navigator.vibrate) navigator.vibrate(60);
      onResultRef.current(String(raw).trim());
    },
    [stopCamera]
  );

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    (async () => {
      const detector = await makeDetector();
      detectorRef.current = detector;
      if (!detector) {
        if (!cancelled) setStatus('unsupported');
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) setStatus('nocamera');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        setStatus('scanning');

        const scan = async () => {
          if (cancelled || doneRef.current) return;
          try {
            if (video.readyState >= 2) {
              const codes = await detector.detect(video);
              if (codes.length && codes[0].rawValue) {
                finish(codes[0].rawValue);
                return;
              }
            }
          } catch {
            // a frame failed to decode; keep trying
          }
          timer = setTimeout(scan, 250);
        };
        scan();
      } catch (err) {
        if (cancelled) return;
        if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') setStatus('denied');
        else if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') setStatus('nocamera');
        else setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopCamera();
    };
  }, [finish, stopCamera]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMessage('');
    const detector = detectorRef.current || (await makeDetector());
    if (!detector) {
      setStatus('unsupported');
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const codes = await detector.detect(bitmap);
      if (codes.length && codes[0].rawValue) finish(codes[0].rawValue);
      else setMessage(t.qrNoneInPhoto);
    } catch {
      setMessage(t.qrNoneInPhoto);
    }
  };

  const statusText = {
    starting: t.qrStarting,
    scanning: t.qrPointCamera,
    unsupported: t.qrUnsupported,
    denied: t.qrDenied,
    nocamera: t.qrNoCamera,
    error: t.qrCameraError
  }[status];

  return (
    <div role="dialog" aria-modal="true" aria-label={t.qrScanTitle} className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-float">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2EAE3]">
          <h3 className="text-base font-bold text-[#0F1F17] font-display flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-600" />
            {t.qrScanTitle}
          </h3>
          <button type="button" onClick={onClose} aria-label={t.qrClose} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#5C6B63] hover:bg-[#EAF0EB]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera view */}
        <div className="relative bg-slate-900 aspect-square">
          <video ref={videoRef} playsInline muted className={`w-full h-full object-cover ${status === 'scanning' ? '' : 'opacity-0'}`} />
          {status === 'scanning' && (
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/5 aspect-square rounded-3xl border-4 border-white/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]" />
            </div>
          )}
          {status === 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
          {status !== 'scanning' && status !== 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white text-sm leading-relaxed">
              {statusText}
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          {(status === 'scanning' || status === 'starting') && (
            <p className="text-sm text-[#5C6B63] text-center" aria-live="polite">{statusText}</p>
          )}
          {message && (
            <p role="alert" className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-center">{message}</p>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-12 rounded-xl border border-[#D4E0D5] bg-white hover:border-brand-200 text-[#0F1F17] font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <ImageUp className="w-5 h-5 text-brand-600" />
            {t.qrUpload}
          </button>
        </div>
      </div>
    </div>
  );
}
