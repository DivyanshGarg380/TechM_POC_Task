function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search employee by name..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "20px"
      }}
    />
  );
}

export default SearchBar;