import ValidationStats from "./ValidationStats";
import IssuesList from "./IssuesList";
import SegmentSummary from "./SegmentSummary";

function ValidationResult({ report }) {
  if (!report) {
    return null;
  }

  return (
    <section className="card validation-card">
      <h2>Validation Result</h2>

      <div
        className={`validation-status ${
          report.is_valid
            ? "success"
            : "error"
        }`}
      >
        {report.is_valid
          ? "✓ EDI File Valid"
          : "✕ EDI File Invalid"}
      </div>

      <ValidationStats report={report} />

      <IssuesList
        title="Errors Found"
        items={report.errors}
        type="error"
      />

      <IssuesList
        title="Warnings & Discrepancies"
        items={report.warnings}
        type="warning"
      />

      <SegmentSummary
        summary={report.segment_summary}
      />
    </section>
  );
}

export default ValidationResult;