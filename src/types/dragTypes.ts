export const ItemTypes = {
  DRIVER: 'driver'
};

export interface DriverDragItem {
  type: string;
  driverId: string;
  sourceRaceId?: string;
  sourcePosition?: number;
}
