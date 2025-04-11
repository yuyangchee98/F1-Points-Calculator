// Constants for drag item types
export const ItemTypes = {
  DRIVER: 'driver'
};

// Interface for the driver drag item
export interface DriverDragItem {
  type: string;
  driverId: string;
  sourceRaceId?: string;
  sourcePosition?: number;
}
