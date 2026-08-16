import { useState } from "react";
import {
  validateEDI,
  convertEDI,
  downloadMIR,
} from "../services/api";

function useEDIWorkflow() {
  const [ediText, setEdiText] = useState("");
  const [fileName, setFileName] = useState("");

  const [validation, setValidation] = useState(null);
  const [mirResult, setMirResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);

  const [error, setError] = useState("");

  /*
   * Handle file loaded from EDIUploader
   */
  const handleFileLoaded = ({ name, content }) => {
    setFileName(name);
    setEdiText(content);

    setValidation(null);
    setMirResult(null);
    setError("");
  };

  /*
   * Handle manual EDI text changes
   */
  const handleEDIChange = (value) => {
    setEdiText(value);

    setFileName("");
    setValidation(null);
    setMirResult(null);
    setError("");
  };

  /*
   * Validate EDI using existing Django API
   */
  const handleValidate = async () => {
    if (!ediText.trim()) {
      setError(
        "Please upload a file or paste EDI content."
      );
      return;
    }

    setLoading(true);
    setError("");
    setValidation(null);
    setMirResult(null);

    try {
      const data = await validateEDI(ediText);

      setValidation(data.report);
    } catch (err) {
      setError(
        err.message || "Validation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Convert validated EDI to MIR
   */
  const handleConvert = async () => {
    if (!ediText.trim()) {
      setError(
        "Please provide EDI content before conversion."
      );
      return;
    }

    if (!validation?.is_valid) {
      setError(
        "Only valid EDI files can be converted."
      );
      return;
    }

    setConverting(true);
    setError("");
    setMirResult(null);

    try {
      const data = await convertEDI(ediText);

      setMirResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Failed to convert EDI to MIR."
      );
    } finally {
      setConverting(false);
    }
  };

  /*
   * Copy generated MIR content
   */
  const handleCopy = async () => {
    if (!mirResult?.text) {
      setError("No MIR output available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        mirResult.text
      );
    } catch {
      setError(
        "Failed to copy MIR output."
      );
    }
  };

  /*
   * Download MIR using existing Django endpoint
   */
  const handleDownload = async () => {
    if (!mirResult?.text) {
      setError(
        "No MIR content available for download."
      );
      return;
    }

    try {
      setError("");

      const baseName = fileName
        ? fileName.replace(/\.[^/.]+$/, "")
        : "output";

      const finalFileName = `${baseName}.mir`;

      const blob = await downloadMIR(
        mirResult.text,
        finalFileName
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = finalFileName;

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.message ||
          "Failed to download MIR file."
      );
    }
  };

  /*
   * Reset entire workflow
   */
  const handleClear = () => {
    setEdiText("");
    setFileName("");

    setValidation(null);
    setMirResult(null);

    setLoading(false);
    setConverting(false);

    setError("");
  };

  return {
    ediText,
    fileName,

    validation,
    mirResult,

    loading,
    converting,

    error,

    handleFileLoaded,
    handleEDIChange,
    handleValidate,
    handleConvert,
    handleCopy,
    handleDownload,
    handleClear,

    setError,
  };
}

export default useEDIWorkflow;