/**
 * Security Utilities for TRISHIP Dropshipping Platform
 * Provides input validation, sanitization, and security checks
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .slice(0, 500); // Limit length
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

/**
 * Validate phone number (basic)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
};

/**
 * Validate price is positive number
 */
export const validatePrice = (price: any): boolean => {
  const parsed = parseFloat(price);
  return !isNaN(parsed) && parsed > 0;
};

/**
 * Validate order amount is within reasonable range
 */
export const validateOrderAmount = (amount: number): boolean => {
  return amount > 0 && amount < 1000000; // Max $1M per order
};

/**
 * Get safe user agent string (limit length)
 */
export const getSafeUserAgent = (): string => {
  return (navigator.userAgent || 'Unknown').slice(0, 200);
};

/**
 * Validate admin credentials
 */
export const validateAdminEmail = (email: string): boolean => {
  // Only allow specific admin email
  return email === 'julyandapa@gmail.com';
};

/**
 * Rate limiting check (client-side, not replacement for server-side)
 */
const requestTimestamps: { [key: string]: number[] } = {};

export const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const key = identifier;
  
  if (!requestTimestamps[key]) {
    requestTimestamps[key] = [];
  }
  
  // Remove old timestamps outside window
  requestTimestamps[key] = requestTimestamps[key].filter(
    (timestamp) => now - timestamp < windowMs
  );
  
  if (requestTimestamps[key].length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  requestTimestamps[key].push(now);
  return true; // OK
};

/**
 * Log security events (for debugging/monitoring)
 */
export const logSecurityEvent = (event: string, data?: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[SECURITY] ${event}`, data);
  }
  // In production, send to monitoring service
};

/**
 * Validate CORS origin
 */
export const isValidOrigin = (origin: string): boolean => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    window.location.origin,
    // Add your production domain here when deploying
  ];
  return allowedOrigins.includes(origin);
};
