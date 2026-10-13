/**
 * Helper untuk standarisasi format respons API JSON
 * Sesuai dengan spesifikasi OpenAPI / Swagger
 */

export const successResponse = (res, data = null, message = 'Operasi berhasil', statusCode = 200, pagination = null) => {
  const responseBody = {
    success: true,
    message
  };

  if (data !== null) {
    responseBody.data = data;
  }

  if (pagination !== null) {
    responseBody.pagination = pagination;
  }

  return res.status(statusCode).json(responseBody);
};

export const errorResponse = (res, message = 'Terjadi kesalahan pada server', statusCode = 400, errors = null) => {
  const responseBody = {
    success: false,
    message
  };

  if (errors && errors.length > 0) {
    responseBody.errors = errors;
  }

  return res.status(statusCode).json(responseBody);
};

export default {
  successResponse,
  errorResponse
};
