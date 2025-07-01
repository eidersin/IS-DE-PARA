import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'
import dotenv from 'dotenv'
import { DocumentProcessor } from './services/DocumentProcessor.js'
import { AIAnalyzer } from './services/AIAnalyzer.js'
import { ReportGenerator } from './services/ReportGenerator.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads')
const outputDir = path.join(__dirname, 'output')
await fs.ensureDir(uploadsDir)
await fs.ensureDir(outputDir)

// Multer configuration
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `document-${uniqueSuffix}.pdf`)
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'))
    }
  }
})

// Initialize services
const documentProcessor = new DocumentProcessor()
const aiAnalyzer = new AIAnalyzer()
const reportGenerator = new ReportGenerator()

// Routes
app.post('/api/analyze', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado' })
    }

    console.log('Iniciando análise do documento:', req.file.filename)

    // Extract text from PDF
    const extractedText = await documentProcessor.extractTextFromPDF(req.file.path)
    
    if (!extractedText) {
      throw new Error('Falha na extração de texto do PDF')
    }

    // Analyze with AI
    const [folhaData, contabilData] = await Promise.all([
      aiAnalyzer.analyzeFolhaPagamento(extractedText),
      aiAnalyzer.analyzeInterfaceContabil(extractedText)
    ])

    // Generate reports
    const [folhaDocPath, contabilDocPath] = await Promise.all([
      reportGenerator.generateFolhaReport(folhaData),
      reportGenerator.generateContabilReport(contabilData)
    ])

    // Clean up uploaded file
    await fs.remove(req.file.path)

    res.json({
      success: true,
      folha: folhaData,
      contabil: contabilData,
      documents: {
        folha: folhaDocPath,
        contabil: contabilDocPath
      }
    })

  } catch (error) {
    console.error('Erro na análise:', error)
    
    // Clean up uploaded file on error
    if (req.file) {
      await fs.remove(req.file.path).catch(() => {})
    }
    
    res.status(500).json({ 
      message: error.message || 'Erro interno do servidor' 
    })
  }
})

app.get('/api/download/:type', async (req, res) => {
  try {
    const { type } = req.params
    const filename = type === 'folha' ? 'Folha_Pagamento.docx' : 'Interface_Contabil.docx'
    const filePath = path.join(outputDir, filename)
    
    if (await fs.pathExists(filePath)) {
      res.download(filePath, filename)
    } else {
      res.status(404).json({ message: 'Arquivo não encontrado' })
    }
  } catch (error) {
    console.error('Erro no download:', error)
    res.status(500).json({ message: 'Erro no download do arquivo' })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📁 Diretório de uploads: ${uploadsDir}`)
  console.log(`📄 Diretório de saída: ${outputDir}`)
})