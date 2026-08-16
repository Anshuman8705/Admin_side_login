function ValidationStats({ report }) {
  const stats = [
    {
      value: report?.total_segments ?? 0,
      label: "Total Segments",
    },
    {
      value:
        report?.claims ??
        report?.claims_found ??
        0,
      label: "Claims",
    },
    {
      value: report?.errors?.length ?? 0,
      label: "Errors",
    },
    {
      value: report?.warnings?.length ?? 0,
      label: "Warnings",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div className="stat-box" key={stat.label}>
          <div className="val">
            {stat.value}
          </div>

          <div className="lbl">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ValidationStats;