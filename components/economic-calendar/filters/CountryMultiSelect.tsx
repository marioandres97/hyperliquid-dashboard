'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';
import { COUNTRIES } from '@/lib/economic-calendar/filters';

interface CountryMultiSelectProps {
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
}

export function CountryMultiSelect({
  selectedCountries,
  onCountriesChange,
}: CountryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      onCountriesChange(selectedCountries.filter((c) => c !== code));
    } else {
      onCountriesChange([...selectedCountries, code]);
    }
  };

  const handleSelectAll = () => {
    onCountriesChange(COUNTRIES.map((c) => c.code));
  };

  const handleClearAll = () => {
    onCountriesChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg border border-emerald-500/20 bg-gray-900/50 backdrop-blur-xl hover:bg-gray-900/70 transition-all duration-300 min-w-[200px]"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-300">
            {selectedCountries.length === 0
              ? 'All Countries'
              : selectedCountries.length === COUNTRIES.length
              ? 'All Countries'
              : `${selectedCountries.length} selected`}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full max-w-md backdrop-blur-xl bg-gray-900/90 border border-emerald-500/20 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                  </button>
                )}
              </div>
            </div>

            {/* Select All / Clear All */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800">
              <button
                onClick={handleSelectAll}
                className="flex-1 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-300 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Country List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No countries found
                </div>
              ) : (
                filteredCountries.map((country) => {
                  const isSelected = selectedCountries.includes(country.code);
                  
                  return (
                    <button
                      key={country.code}
                      onClick={() => handleToggleCountry(country.code)}
                      className={`flex items-center gap-3 px-4 py-3 w-full hover:bg-emerald-500/10 cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <span className="flex-1 text-left text-sm font-medium text-gray-300">
                        {country.name}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
