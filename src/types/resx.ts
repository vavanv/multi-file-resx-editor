export interface ResxEntry {
  name: string;
  value: string;
  comment?: string;
}

export interface ResxData {
  entries: ResxEntry[];
}

export interface GridRow extends ResxEntry {
  id: string;
}

export interface FileTab {
  id: string;
  fileName: string;
  originalFileName: string;
  rows: GridRow[];
  hasChanges: boolean;
  language?: string; // Language code extracted from filename
  baseFileName: string; // Base filename without language code
}

export interface FileGroup {
  id: string;
  baseFileName: string;
  files: FileTab[];
  activeFileId: string | null;
}