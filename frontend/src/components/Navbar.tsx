import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // If we're not on homepage, navigate to homepage with search query as URL parameter
      if (location.pathname !== '/') {
        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      } else {
        // If we're already on homepage, trigger search by updating URL
        navigate(`/?search=${encodeURIComponent(searchQuery)}`, { replace: true });
      }
    }
  };

  // Clear search when clicking on logo
  const handleLogoClick = () => {
    setSearchQuery('');
    if (location.pathname === '/' && location.search) {
      navigate('/');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3"
              onClick={handleLogoClick}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-lg">
                <span className="text-white font-bold text-lg">HD</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Highway</span>
                <span className="text-xl font-bold text-primary-500">Delight</span>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experiences by name, location..."
                className="input-field w-80"
              />
              <button 
                type="submit" 
                className="search-btn flex items-center space-x-2"
                disabled={!searchQuery.trim()}
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;