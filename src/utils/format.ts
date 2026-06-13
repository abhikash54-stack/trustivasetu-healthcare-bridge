export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return String(isoString);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  if (isNaN(num)) return String(value);
  if (num >= 10_000_000) return `₹${(num / 10_000_000).toFixed(2)} Cr`;
  if (num >= 100_000) return `₹${(num / 100_000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatStatus(status: string | null | undefined): string {
  if (!status) return '—';
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const STATUS_COLOR_MAP: Record<string, string> = {
  ACTIVE: '#27AE60',
  INACTIVE: '#E67E22',
  PENDING: '#F39C12',
  APPROVED: '#27AE60',
  DISBURSED: '#3498DB',
  REJECTED: '#E74C3C',
  CANCELLED: '#95A5A6',
  IN_PROGRESS: '#8E44AD',
  COMPLETED: '#27AE60',
  PROCESSING: '#3498DB',
  CLOSED: '#555555',
  REVIEW: '#E67E22',
};

export function statusColor(status: string | null | undefined): string {
  if (!status) return '#999999';
  return STATUS_COLOR_MAP[status.toUpperCase()] ?? '#555555';
}
