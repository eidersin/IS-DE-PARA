import { ERROR_MESSAGES } from '../config/constants.js'
import { FileUtils } from '../utils/fileUtils.js'

export class ErrorHandler {
  static async handleError(error, req, res, next) {
    console.error('Erro capturado:', error)

    // Cleanup uploaded file on error
    if (req.file) {
      await FileUtils.cleanupFile(req.file.path)
    }

    // Determine error type and status code
    let statusCode = 500
    let message = error.message || 'Erro interno do servidor'

    if (error.name === 'ValidationError') {
      statusCode = 400
    } else if (error.name === 'MulterError') {
      statusCode = 400
      if (error.code === 'LIMIT_FILE_SIZE') {
        message = 'Arquivo muito grande'
      }
    } else if (error.message.includes('ENOENT')) {
      statusCode = 404
      message = ERROR_MESSAGES.FILE_NOT_FOUND
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  }

  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next)
    }
  }
}