export function nextId(prefix: string, existing: string[]): string {
  const nums = existing
    .map((id) => parseInt(id.replace(`${prefix}-`, ''), 10))
    .filter((n) => !Number.isNaN(n))
  const n = (nums.length ? Math.max(...nums) : 0) + 1
  return `${prefix}-${String(n).padStart(4, '0')}`
}
