/**
 * DateRange Value Object & Helper
 * Standardizes date window calculations across reports, closings, and shift operations.
 */
export interface DateWindow {
  start: string; // ISO timestamp or YYYY-MM-DD
  end: string;   // ISO timestamp or YYYY-MM-DD
}

export class DateRange {
  /**
   * Returns today's date string in YYYY-MM-DD format.
   */
  static todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Returns a DateWindow for the entire current day (YYYY-MM-DD).
   */
  static today(): DateWindow {
    const today = DateRange.todayStr();
    return { start: `${today}T00:00:00.000Z`, end: `${today}T23:59:59.999Z` };
  }

  /**
   * Returns a DateWindow for yesterday.
   */
  static yesterday(): DateWindow {
    const y = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return { start: `${y}T00:00:00.000Z`, end: `${y}T23:59:59.999Z` };
  }

  /**
   * Returns a DateWindow for the last N days.
   */
  static lastDays(days: number): DateWindow {
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = DateRange.todayStr();
    return { start: `${start}T00:00:00.000Z`, end: `${end}T23:59:59.999Z` };
  }

  /**
   * Returns the YYYY-MM prefix for the current month.
   */
  static currentMonthPrefix(): string {
    return new Date().toISOString().slice(0, 7);
  }

  /**
   * Returns a DateWindow covering the entire month for a given YYYY-MM prefix.
   */
  static monthWindow(prefix: string): DateWindow {
    return { start: `${prefix}-01T00:00:00.000Z`, end: `${prefix}-31T23:59:59.999Z` };
  }

  /**
   * Checks if an ISO timestamp falls strictly within (or on boundary of) a window.
   */
  static isWithin(timestamp: string, start: string, end: string): boolean {
    if (!timestamp) return false;
    return timestamp > start && timestamp <= end;
  }
}
