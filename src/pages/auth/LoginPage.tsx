import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';

type Step = 'credentials' | 'otp';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleLoginPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      const result = await authService.loginPassword(email, password);
      setInfo(`Codigo enviado a ${result.email}. Expira en ${result.expiresInMinutes} minutos.`);
      setStep('otp');
      setResendCooldown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeOverride?: string) => {
    setError(''); setInfo('');
    setLoading(true);
    try {
      const code = codeOverride || otp.join('');
      const result = await authService.verifyOtp(email, code);
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Codigo incorrecto');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx: number, value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 1);
    const next = [...otp];
    next[idx] = sanitized;
    setOtp(next);
    if (sanitized && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (sanitized && idx === 5) {
      const fullCode = next.join('');
      if (fullCode.length === 6) handleVerifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      handleVerifyOtp(paste);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(''); setInfo('');
    try {
      const result = await authService.resendOtp(email);
      setInfo(`Nuevo codigo enviado. Expira en ${result.expiresInMinutes} minutos.`);
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al reenviar');
    }
  };

  const handleBack = () => {
    setStep('credentials');
    setOtp(['', '', '', '', '', '']);
    setError(''); setInfo('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-4 text-4xl">🏥</div>
          <h1 className="text-3xl font-bold text-white">MedAssembly</h1>
          <p className="text-blue-100 mt-1 text-sm">Sistema de Primeros Auxilios</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          {step === 'credentials' ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Iniciar Sesion</h2>
              <p className="text-sm text-gray-500 mb-6">Ingresa tu correo y contrasena para recibir un codigo de verificacion</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl mb-4 text-sm flex items-start gap-2">
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLoginPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Correo electronico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="tu@correo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Contrasena</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold shadow-lg shadow-blue-600/20"
                >
                  {loading ? 'Verificando...' : 'Continuar'}
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  🔒 Se te enviara un codigo de verificacion a tu correo
                </p>
              </form>
            </>
          ) : (
            <>
              <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
                ← Volver
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Verificacion en dos pasos</h2>
              <p className="text-sm text-gray-500 mb-6">Enviamos un codigo de 6 digitos a <strong>{email}</strong></p>

              {info && <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl mb-4 text-sm">{info}</div>}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl mb-4 text-sm flex items-start gap-2">
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              <div className="flex justify-center gap-2 mb-5" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    disabled={loading}
                    className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                ))}
              </div>

              <button
                onClick={() => handleVerifyOtp()}
                disabled={loading || otp.some(d => !d)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold shadow-lg shadow-blue-600/20"
              >
                {loading ? 'Verificando...' : 'Verificar y entrar'}
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 font-medium"
                >
                  {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar codigo'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-blue-100 mt-6">© 2026 MedAssembly</p>
      </div>
    </div>
  );
}
