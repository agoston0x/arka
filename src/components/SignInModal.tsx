'use client';

import { useState } from 'react';
import ArkaLogo from './ArkaLogo';

type Step = 'email' | 'code';

interface Props {
  open: boolean;
  onClose: () => void;
  onSignIn: (email: string) => void;
}

export default function SignInModal({ open, onClose, onSignIn }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  if (!open) return null;

  const handleEmailSubmit = () => {
    if (!email.includes('@')) return;
    setStep('code');
  };

  const handleCodeSubmit = () => {
    if (code.length < 1) return;
    onSignIn(email);
    setStep('email');
    setEmail('');
    setCode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex flex-col items-center">
          <ArkaLogo size={48} />
          <h2 className="mt-3 text-xl font-bold text-arka-text">Sign in to Arka</h2>
          <p className="mt-1 text-sm text-black/50">Powered by Dynamic</p>
        </div>

        {step === 'email' ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-black/70">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-black/10 bg-arka-card px-4 py-3 text-sm outline-none focus:border-arka-pink focus:ring-1 focus:ring-arka-pink"
                autoFocus
              />
            </div>
            <button
              onClick={handleEmailSubmit}
              disabled={!email.includes('@')}
              className="w-full rounded-xl bg-arka-pink py-3 text-sm font-semibold text-white transition hover:bg-arka-pink/90 disabled:opacity-40"
            >
              Continue
            </button>
            <p className="text-center text-xs text-black/40">
              A verification code will be sent to your email
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm text-black/60">
              Enter the code sent to <span className="font-semibold text-arka-text">{email}</span>
            </p>
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
                placeholder="Enter code"
                className="w-full rounded-xl border border-black/10 bg-arka-card px-4 py-3 text-center text-lg font-semibold tracking-widest outline-none focus:border-arka-pink focus:ring-1 focus:ring-arka-pink"
                autoFocus
              />
            </div>
            <button
              onClick={handleCodeSubmit}
              disabled={code.length < 1}
              className="w-full rounded-xl bg-arka-pink py-3 text-sm font-semibold text-white transition hover:bg-arka-pink/90 disabled:opacity-40"
            >
              Verify & Sign In
            </button>
            <button
              onClick={() => setStep('email')}
              className="w-full text-center text-xs text-black/40 hover:text-black/60"
            >
              ← Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
