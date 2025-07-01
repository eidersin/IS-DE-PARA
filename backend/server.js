import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import { CONFIG } from './config/constants.js'
import { FileUtils } from './utils/fileUtils.js'
import { ErrorHandler } from './middleware/errorHandler.js'
import apiRoutes from './routes/api.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = CONFIG.PORT

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Initialize directories
async function initializeDirectories() {
  const uploadsDir = path.join(__dirname, CONFIG.DIRECTORIES.UPLOADS)
  const outputDir = path.join(__dirname, CONFIG.DIRECTORIES.OUTPUT)
  
  await FileUtils.ensureDirectories([uploadsDir, outputDir])
  
  console.log(`📁 Diretório de uploads: ${uploadsDir}`)
  console.log(`📄 Diretório de saída: ${outputDir}`)
}

// Routes
app.use('/api', apiRoutes)

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Document Analysis API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware (must be last)
app.use(ErrorHandler.handleError)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando servidor...')
  process.exit(0)
})

// Start server
async function startServer() {
  try {
    await initializeDirectories()
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`)
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`)
      console.log(`📊 API disponível em: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error)
    process.exit(1)
  }
}

startServer()