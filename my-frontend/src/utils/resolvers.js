import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Helper function untuk membuat resolver dari Zod schema
 * @param {ZodSchema} schema - Zod validation schema
 * @returns {Function} React Hook Form resolver
 */
export const createZodResolver = (schema) => zodResolver(schema);
