import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useAppDispatch } from '../../store';
import type { StandingsSection } from '../../types';
import { toggleShowDelta } from '../../store/slices/uiSlice';
import SettingsPopover, { ToggleRow } from './SettingsPopover';

interface TableSettingsButtonProps {
  section: StandingsSection;
}

const TableSettingsButton: React.FC<TableSettingsButtonProps> = ({ section }) => {
  const dispatch = useAppDispatch();
  const showDelta = useSelector((state: RootState) =>
    section === 'drivers' ? state.ui.driverShowDelta : state.ui.teamShowDelta
  );
  const label = section === 'drivers' ? 'Driver table settings' : 'Constructor table settings';
  const description =
    section === 'drivers' ? 'Position arrows & gained points' : 'Gained points';

  return (
    <SettingsPopover ariaLabel={label} widthRem={14}>
      <ToggleRow
        label="Prediction changes"
        description={description}
        checked={showDelta}
        onChange={() => dispatch(toggleShowDelta(section))}
      />
    </SettingsPopover>
  );
};

export default TableSettingsButton;
