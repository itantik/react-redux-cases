import React from 'react';
import useFilter from '../../use-cases/filter/useFilter';

export function Filter() {
  const { filter, updateFilter } = useFilter();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter(event.target.value);
  };

  const handleClear = () => {
    updateFilter('');
  };

  return (
    <div className="input-row">
      <input type="text" value={filter} placeholder="Filter..." onChange={handleChange} />
      <button type="button" onClick={handleClear}>
        ×
      </button>
    </div>
  );
}
