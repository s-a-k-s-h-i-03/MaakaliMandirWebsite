export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <label className="admin-search">
      <span className="sr-only">{placeholder}</span>
      <input
        aria-label={placeholder}
        className="admin-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
