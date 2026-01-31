/**
 * JobForm Component
 * 
 * Form for creating and editing jobs.
 */

import { useState } from 'react';
import type { Job, CreateJobDto } from '@/lib/types';

interface JobFormProps {
  job?: Job | null;
  onSubmit: (data: CreateJobDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function JobForm({ job, onSubmit, onCancel, isLoading = false }: JobFormProps) {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    company: job?.company || '',
    description: job?.description || '',
    requirements: job?.requirements?.join('\n') || '',
    skills: job?.skills?.join(', ') || '',
    location: job?.location || '',
    salary_range: job?.salary_range || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const submitData: CreateJobDto = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      description: formData.description.trim(),
      requirements: formData.requirements
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean),
      skills: formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      location: formData.location.trim() || undefined,
      salary_range: formData.salary_range.trim() || undefined,
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g. Senior React Developer"
          disabled={isLoading}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Company */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.company ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g. Tech Innovations Inc."
          disabled={isLoading}
        />
        {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Job Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe the role, responsibilities, and what you're looking for..."
          disabled={isLoading}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Requirements */}
      <div>
        <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
          Requirements
        </label>
        <textarea
          id="requirements"
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="One requirement per line, e.g.&#10;5+ years React experience&#10;TypeScript proficiency&#10;Strong problem-solving skills"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">Enter one requirement per line</p>
      </div>

      {/* Skills */}
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
          Required Skills
        </label>
        <input
          type="text"
          id="skills"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. React, TypeScript, Redux, Node.js, SQL"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">Comma-separated skills</p>
      </div>

      {/* Location & Salary (Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. New York, NY (Remote)"
            disabled={isLoading}
          />
        </div>

        {/* Salary Range */}
        <div>
          <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700 mb-1">
            Salary Range
          </label>
          <input
            type="text"
            id="salary_range"
            name="salary_range"
            value={formData.salary_range}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. $100,000 - $150,000"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>{job ? 'Update Job' : 'Create Job'}</>
          )}
        </button>
      </div>
    </form>
  );
}
