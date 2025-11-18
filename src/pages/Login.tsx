import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Car, Phone, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, requestOTP, verifyOTP } = useAuth();

  if (user) {
    return <Navigate to="/rides" replace />;
  }

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await requestOTP(phoneNumber);

      if (result.success) {
        setOtpSent(true);
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await verifyOTP(phoneNumber, otp);

      if (result.success) {
        setSuccess(result.message);
        // Navigation will happen automatically via AuthContext
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Dunfermline Taxi Admin</h1>
            <p className="text-gray-600 mt-2">
              {otpSent ? 'Enter OTP to verify' : 'Sign in with phone number'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {!otpSent ? (
            // Step 1: Request OTP
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </div>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="+447123456789"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your registered phone number (with country code)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            // Step 2: Verify OTP
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Enter OTP
                  </div>
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the 6-digit OTP sent to {phoneNumber}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Change Phone Number
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Didn't receive OTP? Resend
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              <strong>Admin Access Required:</strong><br />
              Only users with admin privileges (isAdmin: true) can access this panel.
              <br /><br />
              <strong>Note:</strong> You must have `isAdmin: true` in your user document.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
