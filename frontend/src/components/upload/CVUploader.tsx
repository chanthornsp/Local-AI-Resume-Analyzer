import { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, X, ClipboardPaste } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CVUploaderProps {
  onUpload: (files: File[]) => void;
  onPasteText?: (text: string) => void;
  isUploading?: boolean;
  maxFiles?: number;
}

export function CVUploader({ 
  onUpload, 
  onPasteText, 
  isUploading, 
  maxFiles = 50 
}: CVUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.type === 'application/pdf' ||
        file.type.startsWith('image/')
    );

    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);
  }, [selectedFiles, maxFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const handlePasteSubmit = () => {
    if (pastedText.trim() && onPasteText) {
      onPasteText(pastedText);
      setPastedText('');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="upload">
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </TabsTrigger>
        <TabsTrigger value="paste">
          <ClipboardPaste className="h-4 w-4 mr-2" />
          Paste Text
        </TabsTrigger>
      </TabsList>

      {/* File Upload Tab */}
      <TabsContent value="upload" className="space-y-4">
        {/* Drop Zone */}
        <Card
          className={cn(
            'border-2 border-dashed transition-colors',
            isDragging && 'border-primary bg-primary/5',
            !isDragging && 'border-muted-foreground/25'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className={cn(
              'rounded-full p-4 mb-4 transition-colors',
              isDragging ? 'bg-primary/10' : 'bg-muted'
            )}>
              <Upload className={cn(
                'h-8 w-8',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )} />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {isDragging ? 'Drop files here' : 'Upload CV Files'}
            </h3>
            
            <p className="text-sm text-muted-foreground text-center mb-4">
              Drag and drop PDF or image files here, or click to browse
            </p>

            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            
            <label htmlFor="file-upload">
              <Button variant="outline" asChild disabled={isUploading}>
                <span className="cursor-pointer">Browse Files</span>
              </Button>
            </label>

            <p className="text-xs text-muted-foreground mt-4">
              Supported: PDF, PNG, JPG (Max {maxFiles} files)
            </p>
          </CardContent>
        </Card>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">
                  Selected Files ({selectedFiles.length})
                </h4>
                {!isUploading && (
                  <Button
                    size="sm"
                    onClick={() => setSelectedFiles([])}
                    variant="ghost"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    {!isUploading && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || selectedFiles.length === 0}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Paste Text Tab */}
      <TabsContent value="paste" className="space-y-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cv-text">Paste CV Text *</Label>
              <Textarea
                id="cv-text"
                placeholder="Paste the candidate's CV text here...&#10;&#10;The AI will automatically extract the candidate's name and details during analysis."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                disabled={isUploading}
                rows={18}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {pastedText.length} characters • Name will be extracted automatically by AI
              </p>
            </div>

            <Button
              onClick={handlePasteSubmit}
              disabled={isUploading || !pastedText.trim() || pastedText.length < 50}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <ClipboardPaste className="h-4 w-4 mr-2" />
                  Submit CV Text {pastedText.length < 50 && `(min 50 chars)`}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
