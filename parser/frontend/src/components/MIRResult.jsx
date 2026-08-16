import ValidationStats from "./ValidationStats";

function MIRResult({
  result,
  onCopy,
  onDownload,
}) {
  if (!result) {
    return null;
  }

  return (
    <section className="card mir-card">
      <h2>MIR Conversion Result</h2>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="val">
            {result.claims_count ?? 0}
          </div>

          <div className="lbl">
            Claims Parsed
          </div>
        </div>

        <div className="stat-box">
          <div className="val">
            {result.services_count ?? 0}
          </div>

          <div className="lbl">
            Service Lines
          </div>
        </div>

        <div className="stat-box">
          <div className="val">
            {result.records_count ?? 0}
          </div>

          <div className="lbl">
            MIR Records
          </div>
        </div>
      </div>

      <div className="mir-header">
        <h3>Generated MIR Output</h3>

        <div className="mir-actions">
          <button
            type="button"
            onClick={onCopy}
          >
            Copy Text
          </button>

          <button
            type="button"
            onClick={onDownload}
          >
            Download .mir File
          </button>
        </div>
      </div>

      <pre className="mir-output">
        {result.text}
      </pre>
    </section>
  );
}

export default MIRResult;