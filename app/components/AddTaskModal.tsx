'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import Button from './Button';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    priority: string;
    todo_date: string;
  }) => Promise<void>;
}

export default function AddTaskModal({ isOpen, onClose, onSubmit }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    todo_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handlePriorityChange = (priority: string) => {
    setFormData((prev) => ({ ...prev, priority }));
    setError(null);
  };

  const handleClear = () => {
    setFormData({
      title: '',
      description: '',
      priority: '',
      todo_date: '',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.priority) {
      setError('Please select a priority');
      return;
    }
    if (!formData.todo_date) {
      setError('Date is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority.toLowerCase(),
        todo_date: formData.todo_date,
      });
      setFormData({
        title: '',
        description: '',
        priority: '',
        todo_date: '',
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span className="text-sm font-medium">Go Back</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="todo_date" className="block text-sm font-medium text-gray-700 mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="todo_date"
                name="todo_date"
                value={formData.todo_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priority
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="extreme"
                  checked={formData.priority === 'extreme'}
                  onChange={() => handlePriorityChange('extreme')}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.priority === 'extreme'
                      ? 'border-red-500 bg-red-500'
                      : 'border-gray-300'
                  }`}
                >
                  {formData.priority === 'extreme' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">Extreme</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="moderate"
                  checked={formData.priority === 'moderate'}
                  onChange={() => handlePriorityChange('moderate')}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.priority === 'moderate'
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  {formData.priority === 'moderate' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">Moderate</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="low"
                  checked={formData.priority === 'low'}
                  onChange={() => handlePriorityChange('low')}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.priority === 'low'
                      ? 'border-yellow-500 bg-yellow-500'
                      : 'border-gray-300'
                  }`}
                >
                  {formData.priority === 'low' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">Low</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
              Task Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Start writing here....."
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? 'Creating...' : 'Done'}
            </Button>
            <button
              type="button"
              onClick={handleClear}
              className="w-12 h-12 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
              aria-label="Clear form"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

