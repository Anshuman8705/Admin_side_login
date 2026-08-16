function IssuesList({
  title,
  items = [],
  type = "error",
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="result-section">
      <h3>{title}</h3>

      <div className="issue-list">
        {items.map((item, index) => (
          <div
            className={`issue-card ${type === "warning" ? "warning" : ""}`}
            key={index}
          >
            <strong>
              {item.message ||
                item.error ||
                item.warning ||
                String(item)}
            </strong>

            {item.line && (
              <span>
                Line: {item.line}
              </span>
            )}

            {item.segment && (
              <span>
                Segment: {item.segment}
              </span>
            )}

            {item.code && (
              <span>
                Code: {item.code}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default IssuesList;