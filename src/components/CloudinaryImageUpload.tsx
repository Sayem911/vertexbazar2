import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { CloudinaryUploadResult } from '@/lib/cloudinary';

interface CloudinaryImageUploadProps {
  onImageUpload: (imageUrl: string, file: File) => void;
  currentImageUrl?: string;
}

const CloudinaryImageUpload: React.FC<CloudinaryImageUploadProps> = ({ onImageUpload, currentImageUrl }) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data: CloudinaryUploadResult = await response.json();
      onImageUpload(data.secure_url, file);
      setPreview(data.secure_url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': []},
    multiple: false
  });

  return (
    <div className="mt-2">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer ${
          isDragActive ? 'border-primary' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt="Preview" className="mx-auto max-h-40 mb-2" />
        ) : (
          <p>Drag & drop an image here, or click to select one</p>
        )}
      </div>
      <Button 
        type="button" 
        onClick={() => {
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          fileInput?.click();
        }} 
        className="mt-2" 
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Browse Files'}
      </Button>
    </div>
  );
};

export default CloudinaryImageUpload;
