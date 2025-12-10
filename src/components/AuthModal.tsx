import React, { useState } from 'react';
import { X, Shield, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInAsGuest, signInAsAdmin, signUpAsAdmin } = useAuth();
  const [mode, setMode] = useState<'select' | 'login' | 'register'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGuestAccess = () => {
    signInAsGuest();
    onClose();
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInAsAdmin(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signUpAsAdmin(email, password);
      alert('Registration successful! Please check your email to confirm your account, then you can login and wait for admin approval.');
      setMode('login'); // Switch to login mode instead of closing
      setEmail(''); // Clear the form
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            {mode === 'select' ? 'Choose Access Type' : 
             mode === 'login' ? 'Admin Login' : 'Admin Registration'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'select' && (
          <div className="space-y-4">
            <button
              onClick={handleGuestAccess}
              className="w-full p-4 border-2 border-slate-200 hover:border-emerald-500 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200">
                  <Eye className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-800">Guest Access</h3>
                  <p className="text-sm text-slate-500">View-only access, no registration needed</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('login')}
              className="w-full p-4 border-2 border-slate-200 hover:border-blue-500 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-800">Admin Access</h3>
                  <p className="text-sm text-slate-500">Full tournament management access</p>
                </div>
              </div>
            </button>

            <div className="text-center">
              <button
                onClick={() => setMode('register')}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Need admin access? Register here
              </button>
            </div>
          </div>
        )}

        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={mode === 'login' ? handleAdminLogin : handleAdminRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Register'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
