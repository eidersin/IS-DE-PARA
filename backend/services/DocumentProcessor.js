import pdf from 'pdf-parse'
import fs from 'fs-extra'
import { ValidationUtils } from '../utils/validation.js'
import { ERROR_MESSAGES } from '../config/constants.js'

export class DocumentProcessor {
  async extractTextFromPDF(filePath) {
    try {
      console.log('Extraindo texto do PDF:', filePath)
      
      if (!await fs.pathExists(filePath)) {
        throw new Error(ERROR_MESSAGES.FILE_NOT_FOUND)
      }

      const dataBuffer = await fs.readFile(filePath)
      const data = await pdf(dataBuffer)
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('PDF não contém texto extraível')
      }

      const cleanedText = ValidationUtils.sanitizeText(data.text)
      
      console.log(`Texto extraído com sucesso. Páginas: ${data.numpages}, Caracteres: ${cleanedText.length}`)
      
      return cleanedText
    } catch (error) {
      console.error('Erro na extração de texto:', error)
      throw new Error(`${ERROR_MESSAGES.TEXT_EXTRACTION_FAILED}: ${error.message}`)
    }
  }

  extractSections(text) {
    const sections = new Map()
    
    if (!text || typeof text !== 'string') {
      return sections
    }

    const lines = text.split('\n').filter(line => line.trim())
    let currentSection = 'general'
    let currentContent = []
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      if (this.isSectionHeader(trimmedLine)) {
        if (currentContent.length > 0) {
          sections.set(currentSection, currentContent.join('\n'))
        }
        currentSection = this.normalizeSectionName(trimmedLine)
        currentContent = []
      } else if (trimmedLine) {
        currentContent.push(trimmedLine)
      }
    }
    
    if (currentContent.length > 0) {
      sections.set(currentSection, currentContent.join('\n'))
    }
    
    return Object.fromEntries(sections)
  }

  isSectionHeader(line) {
    const headerPatterns = [
      /^(CLÁUSULA|ARTIGO|CAPÍTULO|SEÇÃO)/i,
      /^\d+\.\s/,
      /^[A-Z\s]{10,}$/,
      /^[IVX]+\.\s/i // Roman numerals
    ]
    
    return headerPatterns.some(pattern => pattern.test(line))
  }

  normalizeSectionName(header) {
    return header
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50)
  }

  getDocumentMetadata(text) {
    const metadata = {
      wordCount: text.split(/\s+/).length,
      characterCount: text.length,
      lineCount: text.split('\n').length,
      hasNumbers: /\d/.test(text),
      hasPercentages: /%/.test(text),
      hasCurrency: /R\$/.test(text),
      hasDates: /\d{1,2}\/\d{1,2}\/\d{4}/.test(text)
    }

    return metadata
  }
}