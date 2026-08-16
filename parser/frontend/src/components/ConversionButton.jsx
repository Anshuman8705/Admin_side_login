function ConversionButton({
  isValid,
  loading,
  onConvert,
}) {
  if (!isValid) {
    return null;
  }

  return (
    <div className="convert-section">
      <button
        type="button"
        className="convert-button"
        onClick={onConvert}
        disabled={loading}
      >
        {loading
          ? "Converting to MIR..."
          : "Submit & Convert to MIR File"}
      </button>
    </div>
  );
}

export default ConversionButton;