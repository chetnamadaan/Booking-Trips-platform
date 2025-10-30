import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { Booking } from '../types';

interface ResultState {
  success: boolean;
  booking?: Booking;
  error?: string;
}

const ResultPage: React.FC = () => {
  const location = useLocation();
  const { success, booking, error } = (location.state as ResultState) || {};

  if (!location.state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Session</h1>
          <p className="text-gray-600 mb-6">
            Please start your booking process from the beginning.
          </p>
          <Link to="/" className="btn-primary w-full">
            Browse Experiences
          </Link>
        </div>
      </div>
    );
  }

  if (success && booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed</h1>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Reference ID</div>
            <div className="font-mono text-lg font-bold text-gray-900">{booking.bookingReference}</div>
          </div>

          <div className="space-y-3 text-left bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Experience:</span>
              <span className="font-medium">{booking.experience.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Participants:</span>
              <span className="font-medium">{booking.participants}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Paid:</span>
              <span className="font-medium">${booking.finalPrice.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            A confirmation has been sent to {booking.customerEmail}
          </p>

          <Link to="/" className="btn-primary w-full">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card p-8 text-center max-w-md">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Failed</h1>
        <p className="text-gray-600 mb-6">
          {error || 'We encountered an issue while processing your booking. Please try again.'}
        </p>
        <div className="space-y-3">
          <Link to="/" className="btn-primary w-full">
            Browse Experiences
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;