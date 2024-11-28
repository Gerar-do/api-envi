import multer from 'multer';
import multerS3 from 'multer-s3';
import s3Client from '../../config/s3Config';
import config from '../../config/config';
import { v4 as uuidv4 } from 'uuid';

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: config.s3.bucketName,
    // Removido el acl: 'public-read' ya que puede causar problemas de permisos
    key: function (req, file, cb) {
      const fileName = `profile-pictures/${uuidv4()}-${file.originalname}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'));
    }
  }
});

export default upload;