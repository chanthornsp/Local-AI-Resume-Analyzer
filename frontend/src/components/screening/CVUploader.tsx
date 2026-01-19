import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CVUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

export function CVUploader({
  onFilesSelected,
  maxFiles = 50,
}: CVUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pdfFiles = acceptedFiles.filter(
        (f) => f.type === "application/pdf",
      );
      const newFiles = [...files, ...pdfFiles].slice(0, maxFiles);
      setFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [files, maxFiles, onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const clearAll = () => {
    setFiles([]);
    onFilesSelected([]);
  };

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">
          {isDragActive ? "Drop CVs here..." : "Drag & drop CV files here"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to select files (PDF only, max {maxFiles} files)
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {files.length} files selected
            </span>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
