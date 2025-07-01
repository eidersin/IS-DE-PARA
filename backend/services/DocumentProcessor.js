import pdf from 'pdf-parse'
import fs from 'fs-extra'

export class DocumentProcessor {
  async extractTextFromPDF(filePath) {
    try {
      console.log('Extraindo texto do PDF:', filePath)
      
      const dataBuffer = await fs.readFile(filePath)
      const data = await pdf(dataBuffer)
      
      console.log(`Texto extraído com sucesso. Páginas: ${data.numpages}, Caracteres: ${data.text.length}`)
      
      return data.text
    } catch (error) {
      console.error('Erro na extração de texto:', error)
      throw new Error('Falha na extração de texto do PDF')
    }
  }

  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
  }

  extractSections(text) {
    const sections = {}
    
    // Basic section extraction logic
    const lines = text.split('\n')
    let currentSection = 'general'
    let currentContent = []
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      if (this.isSectionHeader(trimmedLine)) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n')
        }
        currentSection = this.normalizeSectionName(trimmedLine)
        currentContent = []
      } else if (trimmedLine) {
        currentContent.push(trimmedLine)
      }
    }
    
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n')
    }
    
    return sections
  }

  isSectionHeader(line) {
    const headerPatterns = [
      /^(CLÁUSULA|ARTIGO|CAPÍTULO|SEÇÃO)/i,
      /^\d+\.\s/,
      /^[A-Z\s]{10,}$/
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
}