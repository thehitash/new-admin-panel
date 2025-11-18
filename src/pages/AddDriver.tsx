import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle, User, Mail, Phone, Car, Hash, Palette } from 'lucide-react';
import { createDriver } from '../utils/apis';

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  carName: string;
  carNumber: string;
  carModel: string;
  carColor: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  carName?: string;
  carNumber?: string;
  carModel?: string;
  carColor?: string;
}

const AddDriver: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    carName: '',
    carNumber: '',
    carModel: '',
    carColor: '',
  });

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation (UK format)
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+44|0)[1-9]\d{8,10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid UK phone number (e.g., +447123456789 or 07123456789)';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)';
    }

    // Car details validation
    if (!formData.carName.trim()) {
      errors.carName = 'Car name is required';
    }

    if (!formData.carNumber.trim()) {
      errors.carNumber = 'Car number/plate is required';
    }

    if (!formData.carModel.trim()) {
      errors.carModel = 'Car model is required';
    }

    if (!formData.carColor.trim()) {
      errors.carColor = 'Car color is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setSuccess(false);

    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        userType: 'driver',
        carName: formData.carName.trim(),
        carNumber: formData.carNumber.trim(),
        carModel: formData.carModel.trim(),
        carColor: formData.carColor.trim(),
      };

      console.log('📤 Creating driver with payload:', { ...payload, password: '***' });

      const result = await createDriver(payload);

      console.log('✅ Driver created successfully:', result);

      setSuccess(true);
      setError('');

      // Show success message for 2 seconds, then navigate
      setTimeout(() => {
        navigate('/drivers');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Failed to create driver:', err);
      setError(err.message || 'Failed to create driver. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/drivers')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Drivers</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Driver</h1>
        <p className="text-gray-600 mt-1">Create a new driver account with vehicle details</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Driver created successfully!</h3>
            <p className="text-sm text-green-700 mt-1">Redirecting to drivers list...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error creating driver</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Personal Information Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.fullName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {formErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="john.doe@example.com"
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+447123456789"
                />
              </div>
              {formErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Minimum 8 characters"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must contain uppercase, lowercase, number, and special character
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Information Section */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Car className="w-5 h-5 text-blue-600" />
            <span>Vehicle Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Car Name */}
            <div>
              <label htmlFor="carName" className="block text-sm font-medium text-gray-700 mb-1">
                Car Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="carName"
                name="carName"
                value={formData.carName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.carName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Toyota Prius"
              />
              {formErrors.carName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.carName}</p>
              )}
            </div>

            {/* Car Number/Plate */}
            <div>
              <label htmlFor="carNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Car Number / Plate <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="carNumber"
                  name="carNumber"
                  value={formData.carNumber}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.carNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="AB12 CDE"
                />
              </div>
              {formErrors.carNumber && (
                <p className="mt-1 text-sm text-red-600">{formErrors.carNumber}</p>
              )}
            </div>

            {/* Car Model */}
            <div>
              <label htmlFor="carModel" className="block text-sm font-medium text-gray-700 mb-1">
                Car Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="carModel"
                name="carModel"
                value={formData.carModel}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.carModel ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="2020 Hybrid"
              />
              {formErrors.carModel && (
                <p className="mt-1 text-sm text-red-600">{formErrors.carModel}</p>
              )}
            </div>

            {/* Car Color */}
            <div>
              <label htmlFor="carColor" className="block text-sm font-medium text-gray-700 mb-1">
                Car Color <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="carColor"
                  name="carColor"
                  value={formData.carColor}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.carColor ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Silver"
                />
              </div>
              {formErrors.carColor && (
                <p className="mt-1 text-sm text-red-600">{formErrors.carColor}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/drivers')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Create Driver</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDriver;
