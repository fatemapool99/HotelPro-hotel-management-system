/**
 * HotelPro Formatting Utilities
 * Standardizes currency (INR - ₹) and date (DD/MM/YYYY) representation across the app.
 */

/**
 * Format a number to Indian Rupee (INR - ₹) currency format.
 * Example: 5400 -> ₹5,400
 */
export const formatINR = (amount) => {
  const numericAmount = Number(amount) || 0;
  return `₹${numericAmount.toLocaleString('en-IN')}`;
};

/**
 * Format a Date object or ISO string to DD/MM/YYYY format.
 * Example: '2026-11-20' -> '20/11/2026'
 */
export const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format a Date object or ISO string to DD/MM/YYYY with day name.
 * Example: '2026-11-20' -> 'Fri, 20/11/2026'
 */
export const formatDateWithDay = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = days[d.getDay()];
  return `${dayName}, ${formatDateDDMMYYYY(d)}`;
};
