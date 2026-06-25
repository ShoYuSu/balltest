export interface TableColumnModel {
  id?: string;
  columnDef: string;
  header: string;
  tag:
    | "text"
    | "text-color"
    | "image"
    | "image-mobile"
    | "edit"
    | "delete"
    | "audio"
    | "download"
    | "icon"
    | "badge"
    | "manage"
    | "reset"
    | "action"
    | "action-menu"
    | "advisors"
    | "name";
    
  stickyEnd?: boolean;
  countField?: string;
  color?: string;
  align?: "left" | "center" | "right";
  display: boolean;
  width?: "small" | "medium" | "large";
  cell: (val: any) => any;
}
