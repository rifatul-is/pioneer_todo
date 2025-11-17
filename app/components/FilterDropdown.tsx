'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  days?: number;
}

interface FilterDropdownProps {
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

const filterOptions: FilterOption[] = [
  { id: 'today', label: 'Deadline Today', days: 0 },
  { id: '5days', label: 'Expires in 5 days', days: 5 },
  { id: '10days', label: 'Expires in 10 days', days: 10 },
  { id: '30days', label: 'Expires in 30 days', days: 30 },
];

export default function FilterDropdown({ selectedFilters, onFilterChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterToggle = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter((f) => f !== filterId)
      : [...selectedFilters, filterId];
    onFilterChange(newFilters);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <ArrowUpDown className="w-4 h-4" />
        Filter By
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {filterOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(option.id)}
                  onChange={() => handleFilterToggle(option.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

