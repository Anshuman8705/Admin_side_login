function SegmentSummary({ summary }) {
  if (!summary) {
    return null;
  }

  return (
    <div className="result-section">
      <h3>Segment Composition</h3>

      <div className="segment-tags">
        {Object.entries(summary).map(
          ([segment, count]) => (
            <span
              className="segment-tag"
              key={segment}
            >
              {segment}: <strong>{count}</strong>
            </span>
          )
        )}
      </div>
    </div>
  );
}

export default SegmentSummary;