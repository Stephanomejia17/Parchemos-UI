export const TABLE_STATUS = {
  ACTIVE: "activa",
  INACTIVE: "inactiva",
} as const;

export type TableStatus = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS];

export interface Table {
  id: string;
  code: string;
  status: TableStatus;
  qrImageUrl: string;
}
