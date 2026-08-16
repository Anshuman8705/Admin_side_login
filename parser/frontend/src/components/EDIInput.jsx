function EDIInput({ value, onChange }) {
  return (
    <>
      <label htmlFor="edi-text">
        EDI Content
      </label>

      <textarea
        id="edi-text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste your EDI 835 / 853 content here..."
        rows={12}
      />
    </>
  );
}

export default EDIInput;