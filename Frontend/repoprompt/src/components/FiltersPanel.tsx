const FiltersPanel = () => {
  const ignores = ['node_modules', 'dist', 'build'];

  return (
    <div className="filters">
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Filters</h3>
      <ul>
        {ignores.map((ig) => (
          <li key={ig}>
            {ig} <input type="checkbox" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FiltersPanel;