export function toBoolean(value: unknown): boolean {
    if (typeof value === 'string') {
      const cleanedValue = value.toLowerCase().trim();
      return ['true', 'yes', '1'].includes(cleanedValue);
    } else if (typeof value === 'boolean') {
      return value;
    } else if (typeof value === 'number') {
      return value !== 0;
    }
    return false;
  }