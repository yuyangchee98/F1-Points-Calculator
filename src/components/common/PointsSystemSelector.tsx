import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { selectPointsSystem } from '../../store/slices/uiSlice';
import { POINTS_SYSTEMS } from '../../data/pointsSystems';

const PointsSystemSelector: React.FC = () => {
  const dispatch = useDispatch();
  const selectedSystem = useSelector((state: RootState) => state.ui.selectedPointsSystem);

  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(selectPointsSystem(e.target.value));
  };

  return (
    <div className="points-system-selector">
      <label htmlFor="points-system" className="sr-only">
        Points System
      </label>
      <select
        id="points-system"
        value={selectedSystem}
        onChange={handleSystemChange}
        className="form-select text-sm"
        title="Select Points System"
      >
        {Object.values(POINTS_SYSTEMS).map(system => (
          <option key={system.id} value={system.id}>
            {system.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PointsSystemSelector;