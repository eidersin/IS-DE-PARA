import multer from 'multer'
import path from 'path'
import { CONFIG } from '../config/constants.js'
import { FileUtils } from '../utils/fileUtils.js'
import { ValidationUtils } from '../utils/validation.js'

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadsDir = path.join(FileUtils.getBackendRoot(), CONFIG.DIRECTORIES.UPLOADS)
    await FileUtils.ensureDirectories([uploadsDir])
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const filename = FileUtils.generateUniqueFilename(file.originalname)
    cb(null, filename)
  }
})

export const uploadMiddleware = multer({
  storage,
  limits: { 
    fileSize: CONFIG.UPLOAD_LIMITS.FILE_SIZE 
  },
  fileFilter: (req, file, cb) => {
    try {
      ValidationUtils.validateFile(file)
      cb(null, true)
    } catch (error) {
      cb(error, false)
    }
  }
})