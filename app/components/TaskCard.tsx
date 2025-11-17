'use client';

import React from 'react';
import { Edit, Trash2, Grid } from 'lucide-react';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: 'Extreme' | 'Moderate' | 'Low';
  dueDate: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const priorityColors = {
  Extreme: 'bg-red-100 text-red-800 border-red-200',
  Moderate: 'bg-green-100 text-green-800 border-green-200',
  Low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export default function TaskCard({
  id,
  title,
  description,
  priority,
  dueDate,
  onEdit,
  onDelete,
}: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(id)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit task"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <span
          className={`
            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
            ${priorityColors[priority]}
          `}
        >
          <Grid className="w-3 h-3" />
          {priority}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

      <div className="text-sm text-gray-500">
        Due {dueDate}
      </div>
    </div>
  );
}

