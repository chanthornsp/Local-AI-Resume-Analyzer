/**
 * CVUploader Component
 * 
 * Drag-and-drop file uploader for CV files (PDF, PNG, JPG).
 */

import { useState, useCallback } from 'react';

interface CVUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  disabled?: boolean;
}

export function CVUploader({
  onFilesSelected,
  accept = '.pdf,.png,.jpg,.jpeg',
  maxFiles = 50,
  disabled = false,
}: CVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [disabled]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const files = Array.from(e.target.files || []);
      handleFiles(files);
    },
    [disabled]
  );

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const ext = file.name.toLowerCase().split('.').pop();
      return ['pdf', 'png', 'jpg', 'jpeg'].includes(ext || '');
    });

    if (validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setSelectedFiles(validFiles);
    onFilesSelected(validFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const clearAll = () => {
    setSelectedFiles([]);
    onFilesSelected([]);
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="pointer-events-none">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {isDragging ? 'Drop files here' : 'Upload CV Files'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop files here, or click to select
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: PDF, PNG, JPG (Max {maxFiles} files)
          </p>
        </div>
      </div>

      {/* File List */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Files ({selectedFiles.length})
            </h4>
            <button
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">
                    {file.name.endsWith('.pdf') ? '📕' : '🖼️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-3 text-gray-400 hover:text-red-600 transition-colors p-1"
                  aria-label="Remove file"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
