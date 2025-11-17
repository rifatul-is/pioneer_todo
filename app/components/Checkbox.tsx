'use client';

import React from 'react';

interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function Checkbox({
  label,
  name,
  checked,
  onChange,
  className = '',
}: CheckboxProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
      />
      <label
        htmlFor={name}
        className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
}

