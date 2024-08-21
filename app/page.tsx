import { useToast } from "@/components/ui/use-toast";

const { toast } = useToast(); // Change this line

const handleUpload = useCallback(async (files: File[]) => {
  setIsUploading(true);
  const newProgress: Record<string, number> = {};
  files.forEach((file) => (newProgress[file.name] = 0));
  setUploadProgress(newProgress);

  const debouncedSetUploadProgress = debounce(setUploadProgress, 100);

  const uploadFile = async (file: File) => {
    try {
      // Step 1: Get the upload URL
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { url, uploadUrl } = await response.json();

      // Step 2: Upload the file
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }

      toast({ // Change this line
        title: "File uploaded successfully",
        description: `File "${file.name}" has been uploaded.`,
      });

      // Update progress to 100%
      debouncedSetUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
    } catch (error) {
      toast({ // Change this line
        title: "Upload failed",
        description: `Failed to upload "${file.name}". Please try again.`,
        variant: "destructive",
      });
      console.error("Upload error:", error);
    }
  };

  await Promise.all(files.map(uploadFile));

  setIsUploading(false);
  setUploadProgress({});
}, [toast]); // Change this line
