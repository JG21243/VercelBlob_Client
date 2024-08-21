'use client'

import { useState, useRef } from 'react'
import { upload } from '@vercel/blob/client'
import { PutBlobResult } from '@vercel/blob'
import { UploadIcon, ImageIcon } from 'lucide-react'

export default function Component() {
  const [dragActive, setDragActive] = useState(false)
  const [blob, setBlob] = useState<PutBlobResult | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Drag event:', e.type) // Debugging: Log drag events
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    console.log('File dropped:', e.dataTransfer.files) // Debugging: Log dropped files
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    console.log('File selected:', e.target.files) // Debugging: Log selected files
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0])
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      console.log('Uploading file:', file.name) // Debugging: Log file upload start
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/avatar/upload',
      })
      console.log('Upload successful:', newBlob.url) // Debugging: Log successful upload
      setBlob(newBlob)
    } catch (err) {
      console.error('Upload error:', err) // Debugging: Log upload errors
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Upload Your Avatar</h1>
      <div 
        className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-primary' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept="image/*"
        />
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Drag and drop your image here, or click to select a file</p>
        <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Select File'}
        </button>
      </div>
      {blob && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Uploaded Avatar</h2>
          <div className="relative aspect-square w-32 mx-auto overflow-hidden rounded-full">
            <img src={blob.url} alt="Uploaded avatar" className="object-cover w-full h-full" />
          </div>
          <p className="mt-2 text-sm text-center">
            <a href={blob.url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              View full size
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
