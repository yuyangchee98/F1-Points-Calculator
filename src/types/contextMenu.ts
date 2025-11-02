// Context Menu Type Definitions

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string; // Optional emoji or icon
  onClick?: () => void; // Optional when submenu is present
  disabled?: boolean;
  divider?: boolean; // Render divider after this item
  submenu?: ContextMenuItem[]; // Nested menu items
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuState {
  isOpen: boolean;
  position: ContextMenuPosition;
  items: ContextMenuItem[];
}
