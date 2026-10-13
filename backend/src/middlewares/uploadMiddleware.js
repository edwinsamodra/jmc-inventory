import { upload } from '../config/upload.js';
import { errorResponse } from '../utils/responseHelper.js';

export const handleSingleUpload = (fieldName = 'lampiran') => {
  const uploadHandler = upload.single(fieldName);

  return (req, res, next) => {
    uploadHandler(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return errorResponse(res, 'Ukuran file lampiran terlalu besar. Maksimum ukuran file adalah 15 MB.', 422);
        }
        return errorResponse(res, err.message || 'Gagal memproses unggahan file lampiran', 422);
      }
      next();
    });
  };
};

export default {
  handleSingleUpload
};
