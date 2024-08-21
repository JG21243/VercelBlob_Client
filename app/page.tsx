"use client"; // Add this directive at the top

import { useToast } from "@/components/ui/use-toast";
import { useCallback, useState } from 'react';

const MyComponent = () => {
  const { addToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(async (files: File[]) => {
    setIsUploading(true);

    try {
      // Step 1: Get the upload URL
      const response = await fetch('/api/get-upload-url', {
        method: 'POST',
        body: JSON.stringify({ fileName: files[0].name }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { url, uploadUrl } = await response.json();

      // Step 2: Upload the file
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: files[0],
        headers: {
          "Content-Type": files[0].type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }

      addToast({
        title: "File uploaded successfully",
      });
    } catch (error) {
      addToast({
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  }, []);

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files)} />
      {isUploading && <p>Uploading...</p>}
    </div>
  );
};

export default MyComponent;