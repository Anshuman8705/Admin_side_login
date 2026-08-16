import Navbar from "../components/Navbar";
import EDIUploader from "../components/EDIUploader";
import EDIInput from "../components/EDIInput";
import ValidationResult from "../components/ValidationResult";
import ConversionButton from "../components/ConversionButton";
import MIRResult from "../components/MIRResult";
import useEDIWorkflow from "../hooks/useEDIWorkflow";

function EdiStudio() {
  const {
    ediText,
    fileName,

    validation,
    mirResult,

    loading,
    converting,

    error,
      setError,
    handleFileLoaded,
    handleEDIChange,
    handleValidate,
    handleConvert,
    handleCopy,
    handleDownload,
    handleClear,
  } = useEDIWorkflow();

  return (
    <>
      <Navbar />

      <main className="container">
        <section className="card">
          <h1>EDI 835 / 853 Studio</h1>

          <p>
            Upload your EDI file or paste EDI
            content below.
          </p>

         <EDIUploader
  fileName={fileName}
  onFileLoaded={handleFileLoaded}
  onError={setError}
/>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <div className="divider">
            <span>OR</span>
          </div>

          <EDIInput
            value={ediText}
            onChange={handleEDIChange}
          />

          <div className="actions">
            <button
              type="button"
              onClick={handleValidate}
              disabled={
                loading || !ediText.trim()
              }
            >
              {loading
                ? "Validating..."
                : "Validate File"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={
                loading ||
                converting ||
                (!ediText && !fileName)
              }
            >
              Clear
            </button>
          </div>
        </section>

        <ValidationResult
          report={validation}
        />

        <ConversionButton
          isValid={validation?.is_valid}
          loading={converting}
          onConvert={handleConvert}
        />

        <MIRResult
          result={mirResult}
          onCopy={handleCopy}
          onDownload={handleDownload}
        />
      </main>
    </>
  );
}

export default EdiStudio;