'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { upload } from '@vercel/blob/client'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { UploadIcon, Loader2 } from 'lucide-react'

export default function BlobUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(async (files: File[]) => {
    setIsUploading(true)
    const newProgress: Record<string, number> = {}
    files.forEach(file => newProgress[file.name] = 0)
    setUploadProgress(newProgress)

    for (const file of files) {
      try {
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          onProgress: (progress) => {
            setUploadProgress(prev => ({...prev, [file.name]: progress}))
          },
        })
        toast({
          title: "File uploaded successfully",
          description: `File "${file.name}" has been uploaded to ${blob.url}`,
        })
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to upload "${file.name}". Please try again.`,
          variant: "destructive",
        })
        console.error('Upload error:', error)
      }
    }
    setIsUploading(false)
    setUploadProgress({})
  }, [toast])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleUpload(acceptedFiles)
  }, [handleUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? "Drop the files here..."
            : "Drag 'n' drop some files here, or click to select files"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          (Only *.jpeg, *.png, *.gif and *.pdf files under 10MB are accepted)
        </p>
      </div>
      <div className="mt-4 text-center">
        <Button onClick={handleButtonClick} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadIcon className="mr-2 h-4 w-4" />
              Select Files
            </>
          )}
        </Button>
      </div>
      {Object.entries(uploadProgress).map(([fileName, progress]) => (
        <div key={fileName} className="mt-2">
          <p className="text-sm">{fileName}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{width: `${progress}%`}}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}
