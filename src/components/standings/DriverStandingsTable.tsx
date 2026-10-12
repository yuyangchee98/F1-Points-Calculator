import React, { Fragment, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { DriverStanding } from '../../types';
import type { RootState } from '../../store';
import { selectDriversByIdMap, getDriverLastName, selectTeamsByIdMap } from '../../store/selectors/dataSelectors';
import { useStandingsAnimation } from '../../hooks/useStandingsAnimation';
import { teamFillStyle } from '../../utils/color';
import { useDriverHref } from '../../hooks/useDriverHref';
import { selectTitleRace } from '../../store/selectors/titleRaceSelectors';
import { fmtPoints } from '../../utils/drivers';

interface DriverStandingsTableProps {
  standings: DriverStanding[];
}

const DriverStandingsTable: React.FC<DriverStandingsTableProps> = ({ standings }) => {
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);
  const showDelta = useSelector((state: RootState) => state.ui.driverShowDelta);
  const driverHref = useDriverHref();
  const titleRace = useSelector(selectTitleRace);

  // The title line: drivers above it are within the points still to be won and
  // can take the title; those below fade. It moves with every drag. Once the
  // lead is bigger than what is left, the line sits under P1 and P1 gets the
  // trophy; with nothing left there is no line, only the trophy.
  const gapById = new Map(titleRace?.chasers.map((c) => [c.driverId, c]) ?? []);
  const lineAt = titleRace && titleRace.pointsLeft > 0
    ? standings.findIndex((s, i) => i > 0 && gapById.get(s.driverId)?.alive === false)
    : -1;
  const champion = titleRace && titleRace.lead > titleRace.pointsLeft ? titleRace.leaderId : null;

  const animationOptions = useMemo(() => ({
    getItemId: (standing: DriverStanding) => standing.driverId,
    compareItems: (current: DriverStanding, prev: DriverStanding) => {
      return current.driverId === prev.driverId;
    }
  }), []);

  const animatedDrivers = useStandingsAnimation(standings, animationOptions);
  
  return (
    <div>
      {standings.length === 0 ? (
        <div className="text-center p-4 text-ink-muted text-sm">
          No driver standings available yet. Try placing drivers in race positions.
        </div>
      ) : (
        <table className="w-full min-w-full table-auto">
          <thead>
            <tr className="text-ink-muted">
              <th className="w-10 text-left py-1 px-2 font-medium text-2xs uppercase tracking-wider">Pos</th>
              <th className="text-left py-1 font-medium text-2xs uppercase tracking-wider">Driver</th>
              <th className="text-right py-1 pr-2 font-medium text-2xs uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing) => {
              const driver = driverById[standing.driverId];
              if (!driver) return null;

              const team = teamById[driver.team];
              const index = standings.indexOf(standing);
              const chase = gapById.get(standing.driverId);
              const out = lineAt > 0 && index >= lineAt;

              return (
                <Fragment key={standing.driverId}>
                {index === lineAt && titleRace && (
                  <tr aria-label={`Title line: drivers above it can still win, with ${fmtPoints(titleRace.pointsLeft)} points left`}>
                    <td colSpan={3} className="px-2 py-0.5" title={`Above the line: within ${fmtPoints(titleRace.pointsLeft)} points of the lead, the most anyone can still score`}>
                      <div className="flex items-center gap-1.5 text-2xs font-semibold text-success tnum">
                        <span className="flex-1 h-px bg-success/40" />
                        <svg className="w-3 h-3" viewBox="0 0 12 12" aria-hidden="true">
                          <path d="M2.5 1v10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          <path d="M3 1.5h3v2.5H3zM6 4h3v2.5H6z" fill="currentColor" />
                          <path d="M3 1.5h6v5H3z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                        </svg>
                        <span>{fmtPoints(titleRace.pointsLeft)} left</span>
                        <span className="flex-1 h-px bg-success/40" />
                      </div>
                    </td>
                  </tr>
                )}
                <tr
                  title={chase ? `${fmtPoints(chase.gap)} behind${out ? ', out of the title fight' : ''}` : undefined}
                  className={`
                    hover:bg-carbon-50
                    ${out ? 'opacity-50' : ''}
                    ${animatedDrivers[standing.driverId] === 'up' ? 'animate-position-up' : ''}
                    ${animatedDrivers[standing.driverId] === 'down' ? 'animate-position-down' : ''}
                  `}
                >
                  <td className="py-1.5 px-2 text-center font-bold text-ink-secondary text-sm w-10 tnum font-display">
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span>{standing.position}</span>
                      {showDelta && standing.positionChange !== 0 && (
                        <span
                          className={`text-2xs font-bold ${
                            standing.positionChange > 0 ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {standing.positionChange > 0 ? '↑' : '↓'}{Math.abs(standing.positionChange)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-1.5">
                    <div className="flex items-center">
                      <div
                        className="h-3.5 w-1 mr-2 rounded-full shrink-0"
                        style={teamFillStyle(team)}
                      />
                      <div className="flex items-center">
                        {driverHref(driver.id) ? (
                          <a
                            href={driverHref(driver.id)!}
                            className="font-medium text-sm text-ink hover:underline"
                          >
                            {getDriverLastName(driver.id)}
                          </a>
                        ) : (
                          <div className="font-medium text-sm text-ink">{getDriverLastName(driver.id)}</div>
                        )}
                        {champion === standing.driverId && (
                          <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5 text-gold" viewBox="0 0 16 16" role="img" aria-label="Champion">
                            <path d="M4 1.5h8v4a4 4 0 0 1-8 0zM4 3H1.8v1.2A2.3 2.3 0 0 0 4 6.5M12 3h2.2v1.2A2.3 2.3 0 0 1 12 6.5M8 9.5v3M5.2 14.5h5.6l-.6-2H5.8z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </td>
                  <td
                    className={`py-1.5 px-2 font-bold text-sm text-right text-ink tnum font-display ${animatedDrivers[standing.driverId] ? 'animate-points-update' : ''}`}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <span>{standing.points} pts</span>
                      {showDelta && standing.predictionPointsGained > 0 && (
                        <span className="text-2xs font-semibold text-success bg-green-50 px-1.5 py-0.5 rounded-sm tnum">
                          +{standing.predictionPointsGained}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DriverStandingsTable;