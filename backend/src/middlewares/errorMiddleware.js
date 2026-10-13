import { errorResponse } from '../utils/responseHelper.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server';
  const errors = err.errors || null;

  return errorResponse(res, message, statusCode, errors);
};

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, 404);
};

export default {
  errorHandler,
  notFoundHandler
};
