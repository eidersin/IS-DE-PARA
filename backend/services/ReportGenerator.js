import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx'
import fs from 'fs-extra'
import path from 'path'
import { FileUtils } from '../utils/fileUtils.js'
import { ERROR_MESSAGES } from '../config/constants.js'

export class ReportGenerator {
  constructor() {
    this.outputDir = path.join(FileUtils.getBackendRoot(), 'output')
    this.initializeOutputDirectory()
  }

  async initializeOutputDirectory() {
    await FileUtils.ensureDirectories([this.outputDir])
  }

  async generateFolhaReport(data) {
    try {
      console.log('Gerando relatório de Folha de Pagamento...')
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "Diagnóstico de Folha de Pagamento - Análise da CCT",
              heading: HeadingLevel.TITLE,
              spacing: { after: 400 }
            }),
            
            new Paragraph({
              text: `Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
              spacing: { after: 400 }
            }),
            
            ...this.generateFolhaContent(data)
          ]
        }]
      })

      const buffer = await Packer.toBuffer(doc)
      const filePath = path.join(this.outputDir, 'Folha_Pagamento.docx')
      
      await fs.writeFile(filePath, buffer)
      console.log('Relatório de Folha de Pagamento gerado:', filePath)
      
      return filePath
    } catch (error) {
      console.error('Erro ao gerar relatório de Folha:', error)
      throw new Error(`${ERROR_MESSAGES.REPORT_GENERATION_FAILED}: ${error.message}`)
    }
  }

  async generateContabilReport(data) {
    try {
      console.log('Gerando relatório de Interface Contábil...')
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "Diagnóstico de Interface Contábil",
              heading: HeadingLevel.TITLE,
              spacing: { after: 400 }
            }),
            
            new Paragraph({
              text: `Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
              spacing: { after: 400 }
            }),
            
            ...this.generateContabilContent(data)
          ]
        }]
      })

      const buffer = await Packer.toBuffer(doc)
      const filePath = path.join(this.outputDir, 'Interface_Contabil.docx')
      
      await fs.writeFile(filePath, buffer)
      console.log('Relatório de Interface Contábil gerado:', filePath)
      
      return filePath
    } catch (error) {
      console.error('Erro ao gerar relatório Contábil:', error)
      throw new Error(`${ERROR_MESSAGES.REPORT_GENERATION_FAILED}: ${error.message}`)
    }
  }

  generateFolhaContent(data) {
    const content = []

    // Identificação do Documento
    if (data.identificacao_documento) {
      content.push(
        new Paragraph({
          text: "1. Identificação do Documento",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      )

      const id = data.identificacao_documento
      
      if (id.sindicato_empregados) {
        content.push(
          new Paragraph({
            text: "Sindicato dos Empregados",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...this.createInfoParagraphs(id.sindicato_empregados)
        )
      }

      if (id.sindicato_patronal) {
        content.push(
          new Paragraph({
            text: "Sindicato Patronal",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...this.createInfoParagraphs(id.sindicato_patronal)
        )
      }

      // Add other identification fields
      const otherFields = ['vigencia', 'data_base_categoria', 'abrangencia_territorial']
      otherFields.forEach(field => {
        if (id[field]) {
          content.push(this.createInfoParagraph(field, id[field]))
        }
      })
    }

    // Pisos Salariais
    if (data.pisos_salariais && Array.isArray(data.pisos_salariais) && data.pisos_salariais.length > 0) {
      content.push(
        new Paragraph({
          text: "2. Pisos Salariais",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      )

      const table = this.createPisosSalariaisTable(data.pisos_salariais)
      content.push(table)
    }

    // Add other sections dynamically
    const sections = [
      'reajuste_salarial',
      'beneficios',
      'adicionais_e_gratificacoes',
      'jornada_de_trabalho',
      'estabilidade_provisoria'
    ]

    this.addGenericSections(content, data, sections, 3)

    return content
  }

  generateContabilContent(data) {
    const content = []

    // Informações Gerais
    if (data.informacoes_gerais) {
      content.push(
        new Paragraph({
          text: "1. Informações Gerais",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),
        ...this.createInfoParagraphs(data.informacoes_gerais)
      )
    }

    // Add other sections
    const sections = [
      'especificacoes_layout_arquivo',
      'conceitos_gerais_contabilizacao',
      'configuracao_conta_contabil',
      'configuracao_rateio_contabil'
    ]

    this.addGenericSections(content, data, sections, 2)

    return content
  }

  createPisosSalariaisTable(pisos) {
    const rows = [
      new TableRow({
        children: [
          new TableCell({ 
            children: [new Paragraph({ text: "Cargo/Função", bold: true })] 
          }),
          new TableCell({ 
            children: [new Paragraph({ text: "Piso (R$)", bold: true })] 
          }),
          new TableCell({ 
            children: [new Paragraph({ text: "Observações", bold: true })] 
          })
        ]
      })
    ]

    // Limit to first 20 entries to avoid document bloat
    const limitedPisos = pisos.slice(0, 20)
    
    limitedPisos.forEach(piso => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({ 
              children: [new Paragraph(String(piso.cargo_funcao || 'Não informado'))] 
            }),
            new TableCell({ 
              children: [new Paragraph(String(piso.valor_piso || 'Não informado'))] 
            }),
            new TableCell({ 
              children: [new Paragraph(String(piso.observacoes || 'Não informado'))] 
            })
          ]
        })
      )
    })

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows
    })
  }

  addGenericSections(content, data, sections, startIndex = 1) {
    sections.forEach((section, index) => {
      if (data[section] && this.hasValidContent(data[section])) {
        content.push(
          new Paragraph({
            text: `${startIndex + index}. ${this.formatSectionTitle(section)}`,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...this.createInfoParagraphs(data[section])
        )
      }
    })
  }

  hasValidContent(obj) {
    if (!obj || typeof obj !== 'object') {
      return Boolean(obj)
    }

    if (Array.isArray(obj)) {
      return obj.length > 0
    }

    return Object.values(obj).some(value => this.hasValidContent(value))
  }

  createInfoParagraphs(obj, level = 0) {
    const paragraphs = []
    
    if (!obj || typeof obj !== 'object') {
      return paragraphs
    }

    Object.entries(obj).forEach(([key, value]) => {
      if (this.hasValidContent(value)) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          paragraphs.push(
            new Paragraph({
              text: this.formatKey(key),
              heading: level === 0 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 }
            }),
            ...this.createInfoParagraphs(value, level + 1)
          )
        } else {
          paragraphs.push(this.createInfoParagraph(key, value))
        }
      }
    })
    
    return paragraphs
  }

  createInfoParagraph(key, value) {
    let displayValue = 'Não informado'
    
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        displayValue = value.length > 0 ? value.join(', ') : 'Não informado'
      } else {
        displayValue = String(value)
      }
    }
    
    return new Paragraph({
      children: [
        new TextRun({
          text: `${this.formatKey(key)}: `,
          bold: true
        }),
        new TextRun({
          text: displayValue
        })
      ],
      spacing: { after: 100 }
    })
  }

  formatKey(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  formatSectionTitle(section) {
    return section
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }
}