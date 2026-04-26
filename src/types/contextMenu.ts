export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  submenu?: ContextMenuItem[];
  searchable?: boolean;
  groupLabel?: string;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

