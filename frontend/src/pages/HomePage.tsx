import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Star, Clock, Users, MapPin } from 'lucide-react';
import { Experience } from '../types';
import { apiService } from '../services/api';

const HomePage: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const data = await apiService.getExperiences();
        setExperiences(data);
        setFilteredExperiences(data);
      } catch (err) {
        setError('Failed to load experiences');
        console.error('Error fetching experiences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  // Read search query from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredExperiences(experiences);
    } else {
      const filtered = experiences.filter(experience =>
        experience.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        experience.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        experience.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        experience.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExperiences(filtered);
    }
  }, [searchQuery, experiences]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search query
    const urlParams = new URLSearchParams();
    if (searchQuery.trim()) {
      urlParams.set('search', searchQuery);
      window.history.replaceState({}, '', `?${urlParams.toString()}`);
    } else {
      window.history.replaceState({}, '', '/');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    window.history.replaceState({}, '', '/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experiences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Indian Experiences</h1>
          <p className="text-gray-600">Discover amazing travel experiences across India</p>
          
          {/* Search Bar - Only show if not searching from navbar */}
          {!location.search.includes('search=') && (
            <div className="mt-6 max-w-2xl">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search experiences by name, location, or category..."
                  className="input-field flex-1"
                />
                <button type="submit" className="search-btn flex items-center space-x-2">
                  <span>Search</span>
                </button>
              </form>
            </div>
          )}

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredExperiences.length} of {experiences.length} experiences for "{searchQuery}"
              </p>
              <button
                onClick={clearSearch}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Experiences Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredExperiences.map((experience) => (
            <div key={experience._id} className="card p-4">
              <img
                src={experience.imageUrl}
                alt={experience.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&auto=format&fit=crop';
                }}
              />
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  {experience.category}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">
                    {experience.rating}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {experience.title}
              </h3>

              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{experience.location}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{experience.durationHours}h</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Max {experience.maxPeople}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{experience.price}
                  </span>
                  <span className="text-gray-600 text-sm ml-1">/ person</span>
                </div>
                <Link
                  to={`/experience/${experience._id}`}
                  className="btn-primary text-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredExperiences.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No experiences found</h3>
            <p className="text-gray-600">
              No experiences match your search for "{searchQuery}". Try different keywords.
            </p>
            <button
              onClick={clearSearch}
              className="btn-primary mt-4"
            >
              Show All Experiences
            </button>
          </div>
        )}

        {filteredExperiences.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500">No experiences available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;