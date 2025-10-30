import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Experience, Slot, PromoValidation } from '../types';
import { apiService } from '../services/api';

interface CheckoutState {
  experience: Experience;
  slot: Slot;
  participants: number;
}

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { experience, slot, participants } = location.state as CheckoutState;

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    promoCode: ''
  });
  const [promoValidation, setPromoValidation] = useState<PromoValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const basePrice = experience.price * participants;
  const discount = promoValidation?.discount_amount || 0;
  const finalPrice = basePrice - discount;

  useEffect(() => {
    if (!experience || !slot) {
      navigate('/');
    }
  }, [experience, slot, navigate]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email is invalid';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePromoCodeValidation = async () => {
    if (!formData.promoCode.trim()) return;

    try {
      const validation = await apiService.validatePromoCode(formData.promoCode, basePrice);
      setPromoValidation(validation);
    } catch (error) {
      console.error('Error validating promo code:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const bookingData = {
        experienceId: experience._id,
        slotId: slot._id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        participants: participants,
        promoCode: formData.promoCode || undefined
      };

      const response = await apiService.createBooking(bookingData);
      
      navigate('/booking-result', {
        state: {
          success: true,
          booking: response.booking
        }
      });
    } catch (error: any) {
      navigate('/booking-result', {
        state: {
          success: false,
          error: error.response?.data?.error || 'Booking failed. Please try again.'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Experience Summary */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience Details</h2>
              <div className="flex items-start space-x-4">
                <img
                  src={experience.imageUrl}
                  alt={experience.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{experience.title}</h3>
                  <p className="text-sm text-gray-600">{experience.location}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(slot.date)} • {formatTime(slot.startTime)} • {participants} {participants === 1 ? 'person' : 'people'}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className={`input-field ${errors.customerName ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className={`input-field ${errors.customerEmail ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className={`input-field ${errors.customerPhone ? 'border-red-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Promo Code</h2>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.promoCode}
                  onChange={(e) => {
                    setFormData({ ...formData, promoCode: e.target.value });
                    setPromoValidation(null);
                  }}
                  className="input-field flex-1"
                  placeholder="Enter promo code"
                />
                <button
                  type="button"
                  onClick={handlePromoCodeValidation}
                  className="btn-secondary whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {promoValidation && (
                <p className={`text-sm mt-2 ${
                  promoValidation.valid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {promoValidation.message}
                </p>
              )}
            </div>

            {/* Price Summary */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price</span>
                  <span className="text-gray-900">${basePrice.toFixed(2)}</span>
                </div>
                {promoValidation?.valid && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Processing...' : 'Complete Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;