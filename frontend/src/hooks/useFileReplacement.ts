import { useState, useCallback } from "react";
import api from "../services/api";

interface UseFileReplacementResult {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  replacementFile: File | null;
  setReplacementFile: (file: File | null) => void;
  uploadingFile: boolean;
  error: string;
  success: string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReplaceFile: (e: React.FormEvent) => Promise<void>;
  resetMessages: () => void;
}

export const useFileReplacement = (
  activityId: string | undefined,
  onSuccess: () => void
): UseFileReplacementResult => {
  const [isOpen, setIsOpen] = useState(false);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReplacementFile(e.target.files[0]);
    }
  }, []);

  const handleReplaceFile = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!replacementFile || !activityId) return;

      setError("");
      setSuccess("");
      setUploadingFile(true);

      try {
        const formData = new FormData();
        formData.append("file", replacementFile);

        await api.post(`/api/activities/${activityId}/replace-file`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setSuccess("Fichier remplacé avec succès !");
        setReplacementFile(null);
        setIsOpen(false);

        // Reset file input
        const fileInput = document.getElementById("replacement-file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        onSuccess();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Erreur lors du remplacement du fichier");
      } finally {
        setUploadingFile(false);
      }
    },
    [replacementFile, activityId, onSuccess]
  );

  const resetMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    isOpen,
    setIsOpen,
    replacementFile,
    setReplacementFile,
    uploadingFile,
    error,
    success,
    handleFileChange,
    handleReplaceFile,
    resetMessages,
  };
};

export default useFileReplacement;
