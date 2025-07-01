import express from 'express'
import { AnalysisController } from '../controllers/analysisController.js'
import { uploadMiddleware } from '../middleware/upload.js'
import { ErrorHandler } from '../middleware/errorHandler.js'

const router = express.Router()
const analysisController = new AnalysisController()

// Analysis routes
router.post('/analyze', 
  uploadMiddleware.single('document'),
  ErrorHandler.asyncHandler(analysisController.analyzeDocument.bind(analysisController))
)

router.get('/download/:type',
  ErrorHandler.asyncHandler(analysisController.downloadDocument.bind(analysisController))
)

router.get('/health',
  ErrorHandler.asyncHandler(analysisController.healthCheck.bind(analysisController))
)

export default router