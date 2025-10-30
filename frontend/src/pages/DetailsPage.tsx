import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Users, MapPin, Calendar } from 'lucide-react';
import { Experience, Slot } from '../types';
import { apiService } from '../services/api';

const DetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [participants, setParticipants] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperience = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await apiService.getExperience(id);
        setExperience(data);
      } catch (err) {
        setError('Failed to load experience details');
        console.error('Error fetching experience:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id]);

  const handleBookNow = () => {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    if (!experience) return;

    navigate('/checkout', {
      state: {
        experience,
        slot: selectedSlot,
        participants
      }
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experience details...</p>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Experience not found'}</p>
        </div>
      </div>
    );
  }

  const maxParticipants = selectedSlot ? Math.min(selectedSlot.availableSpots, experience.maxPeople) : experience.maxPeople;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Experience Details</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Description */}
          <div className="lg:col-span-2">
            <img
              src={experience.imageUrl}
              alt={experience.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
            
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{experience.title}</h2>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-700">{experience.rating}</span>
                  <span className="text-gray-500">({experience.reviewCount} reviews)</span>
                </div>
                <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                  {experience.category}
                </span>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">{experience.location}</span>
              </div>

              <div className="flex items-center space-x-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{experience.durationHours} hours</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  <span>Max {experience.maxPeople} people</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About this experience</h3>
                <p className="text-gray-700 leading-relaxed">
                  {experience.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Section */}
          <div className="card p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Book this Experience</h2>
            
            <div className="space-y-6">
              {/* Price */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Price per person</span>
                <span className="text-2xl font-bold text-gray-900">₹{experience.price}</span>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Participants
                </label>
                <select
                  value={participants}
                  onChange={(e) => setParticipants(parseInt(e.target.value))}
                  className="input-field"
                  disabled={!selectedSlot}
                >
                  {[...Array(maxParticipants)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i + 1 === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
                {!selectedSlot && (
                  <p className="text-sm text-gray-500 mt-1">Select a time slot first</p>
                )}
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Available Time Slots
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {experience.slots && experience.slots.length > 0 ? (
                    experience.slots.map((slot) => (
                      <div
                        key={slot._id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedSlot?._id === slot._id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setParticipants(1);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatDate(slot.date)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {slot.availableSpots} spots
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No available slots
                    </div>
                  )}
                </div>
              </div>

              {/* Total Price */}
              {selectedSlot && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{(experience.price * participants).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBookNow}
                disabled={!selectedSlot}
                className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {selectedSlot ? 'Continue to Book' : 'Select Time Slot'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;