import { useRef } from "react";

const ALLOWED_EXTENSIONS = [
  ".835",
  ".853",
  ".x12",
  ".txt",
  ".edi",
];

function EDIUploader({
  fileName,
  onFileLoaded,
  onError,
}) {
  const fileInputRef = useRef(null);

  const isValidFileType = (file) => {
    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    return ALLOWED_EXTENSIONS.includes(extension);
  };

  const processFile = (file) => {
    if (!file) return;

    if (!isValidFileType(file)) {
      onError(
        "Invalid file type. Please upload an .835, .853, .x12, .txt, or .edi file."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      onFileLoaded({
        name: file.name,
        content: event.target.result || "",
      });
    };

    reader.onerror = () => {
      onError("Failed to read the selected file.");
    };

    reader.readAsText(file);
  };

  const handleFileChange = (event) => {
    processFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    processFile(event.dataTransfer.files?.[0]);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className="drop-zone"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="upload-icon">↑</div>

      <h3>
        {fileName || "Click or drag & drop your EDI file"}
      </h3>

      <p>
        Supported formats: .835, .853, .x12, .txt, .edi
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".835,.853,.x12,.txt,.edi"
        onChange={handleFileChange}
        hidden
      />
    </div>
  );
}

export default EDIUploader;