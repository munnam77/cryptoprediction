import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUpDown, Check } from 'lucide-react';

export type SortOption = {
  id: string;
  label: string;
};

interface SortDropdownProps {
  options: SortOption[];
  defaultOption?: string;
  onSort: (optionId: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

/**
 * SortDropdown Component
 * 
 * A dropdown menu for sorting cryptocurrency data
 * with options for sort field and direction
 */
const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  defaultOption,
  onSort,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>(defaultOption || options[0]?.id || '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle option selection
  const handleSelectOption = (optionId: string) => {
    if (selectedOption === optionId) {
      // Toggle direction if same option selected
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      onSort(optionId, newDirection);
    } else {
      // Set new option with default desc direction
      setSelectedOption(optionId);
      setSortDirection('desc');
      onSort(optionId, 'desc');
    }
    setIsOpen(false);
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get the label of the selected option
  const getSelectedLabel = () => {
    const option = options.find(opt => opt.id === selectedOption);
    return option ? option.label : 'Sort by';
  };
  
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center">
          <ArrowUpDown size={16} className="mr-2 text-gray-400" />
          <span>{getSelectedLabel()}</span>
          {sortDirection === 'asc' ? (
            <span className="ml-2 text-xs text-gray-400">(Asc)</span>
          ) : (
            <span className="ml-2 text-xs text-gray-400">(Desc)</span>
          )}
        </span>
        <ChevronDown 
          size={16} 
          className={`ml-2 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg">
          <ul 
            className="py-1 overflow-auto max-h-60" 
            role="listbox"
            aria-activedescendant={selectedOption}
          >
            {options.map((option) => (
              <li
                key={option.id}
                id={option.id}
                role="option"
                aria-selected={selectedOption === option.id}
                className={`px-4 py-2 cursor-pointer flex items-center justify-between ${
                  selectedOption === option.id ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
                onClick={() => handleSelectOption(option.id)}
              >
                <span>{option.label}</span>
                {selectedOption === option.id && (
                  <Check size={16} className="text-blue-500" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SortDropdown; 