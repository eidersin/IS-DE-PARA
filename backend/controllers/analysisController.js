import { DocumentProcessor } from '../services/DocumentProcessor.js'
import { AIAnalyzer } from '../services/AIAnalyzer.js'
import { ReportGenerator } from '../services/ReportGenerator.js'
import { ValidationUtils } from '../utils/validation.js'
import { FileUtils } from '../utils/fileUtils.js'
import { ERROR_MESSAGES } from '../config/constants.js'

export class AnalysisController {
  constructor() {
    this.documentProcessor = new DocumentProcessor()
    this.aiAnalyzer = new AIAnalyzer()
    this.reportGenerator = new ReportGenerator()
  }

  async analyzeDocument(req, res) {
    const startTime = Date.now()
    
    try {
      ValidationUtils.validateFile(req.file)
      console.log(`Iniciando análise do documento: ${req.file.filename}`)

      // Extract text from PDF
      const extractedText = await this.documentProcessor.extractTextFromPDF(req.file.path)
      
      if (!extractedText) {
        throw new Error(ERROR_MESSAGES.TEXT_EXTRACTION_FAILED)
      }

      // Analyze with AI in parallel
      const [folhaData, contabilData] = await Promise.all([
        this.aiAnalyzer.analyzeFolhaPagamento(extractedText),
        this.aiAnalyzer.analyzeInterfaceContabil(extractedText)
      ])

      // Generate reports in parallel
      const [folhaDocPath, contabilDocPath] = await Promise.all([
        this.reportGenerator.generateFolhaReport(folhaData),
        this.reportGenerator.generateContabilReport(contabilData)
      ])

      // Clean up uploaded file
      await FileUtils.cleanupFile(req.file.path)

      const processingTime = Date.now() - startTime
      console.log(`Análise concluída em ${processingTime}ms`)

      res.json({
        success: true,
        processingTime,
        data: {
          folha: folhaData,
          contabil: contabilData
        },
        documents: {
          folha: folhaDocPath,
          contabil: contabilDocPath
        }
      })

    } catch (error) {
      console.error('Erro na análise:', error)
      throw error // Will be handled by error middleware
    }
  }

  async downloadDocument(req, res) {
    try {
      const { type } = req.params
      
      if (!['folha', 'contabil'].includes(type)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tipo de documento inválido' 
        })
      }

      const filename = type === 'folha' ? 'Folha_Pagamento.docx' : 'Interface_Contabil.docx'
      const filePath = path.join(FileUtils.getBackendRoot(), 'output', filename)
      
      if (await fs.pathExists(filePath)) {
        res.download(filePath, filename)
      } else {
        res.status(404).json({ 
          success: false, 
          message: ERROR_MESSAGES.FILE_NOT_FOUND 
        })
      }
    } catch (error) {
      console.error('Erro no download:', error)
      res.status(500).json({ 
        success: false, 
        message: ERROR_MESSAGES.DOWNLOAD_ERROR 
      })
    }
  }

  async healthCheck(req, res) {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    }

    res.json(health)
  }
}