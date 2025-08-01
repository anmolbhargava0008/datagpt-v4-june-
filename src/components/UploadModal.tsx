
import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const { selectedWorkspace, uploadDocument } = useWorkspace();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.includes("pdf")) {
        newFiles.push(file);
      }
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => {
        const combinedFiles = [...prev, ...newFiles];
        const uniqueFiles = combinedFiles.filter(
          (file, index, self) =>
            index === self.findIndex((f) => f.name === file.name)
        );
        return uniqueFiles;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles((files) =>
      files.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0 || !selectedWorkspace) return;

    try {
      setUploading(true);

      // Upload each file one by one
      for (const file of selectedFiles) {
        await uploadDocument(file);
      }

      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error("Failed to upload PDFs:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !uploading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload PDF documents to analyze with Edelweiss DataGpt
          </DialogDescription>
        </DialogHeader>

        {selectedFiles.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md p-2"
              >
                <div className="flex items-center overflow-hidden">
                  <FileText className="h-4 w-4 text-[#0A66C2] mr-2 flex-shrink-0" />
                  <span
                    className="text-sm text-gray-800 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 flex-shrink-0"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <div
            onDrop={(e) => {
              e.preventDefault();
              handleFileSelect(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
            className="w-full border-2 border-dashed border-gray-300 p-6 text-center rounded-md hover:border-[#A259FF] transition-colors cursor-pointer"
            onClick={handleUploadClick}
          >
            <Upload className="mx-auto mb-2 text-[#A259FF]" />
            <p className="text-sm text-gray-600">Drag & drop PDF files here or click to select</p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
            multiple
            disabled={uploading}
          />
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          {selectedFiles.length > 0 && (
            <Button
              type="button"
              className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
              onClick={handleUploadSubmit}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <span className="mr-2">Uploading...</span>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full" />
                </>
              ) : (
                <>
                  Upload {selectedFiles.length} {selectedFiles.length === 1 ? "File" : "Files"}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;