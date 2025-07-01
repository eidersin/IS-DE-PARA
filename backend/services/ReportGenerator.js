import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class ReportGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output')
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
      throw error
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
      throw error
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

      if (id.vigencia) {
        content.push(this.createInfoParagraph("Vigência", id.vigencia))
      }
      if (id.data_base_categoria) {
        content.push(this.createInfoParagraph("Data Base", id.data_base_categoria))
      }
    }

    // Pisos Salariais
    if (data.pisos_salariais && data.pisos_salariais.length > 0) {
      content.push(
        new Paragraph({
          text: "2. Pisos Salariais",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      )

      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Cargo/Função")] }),
              new TableCell({ children: [new Paragraph("Piso (R$)")] }),
              new TableCell({ children: [new Paragraph("Observações")] })
            ]
          }),
          ...data.pisos_salariais.slice(0, 20).map(piso => 
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(String(piso.cargo_funcao || ''))] }),
                new TableCell({ children: [new Paragraph(String(piso.valor_piso || ''))] }),
                new TableCell({ children: [new Paragraph(String(piso.observacoes || ''))] })
              ]
            })
          )
        ]
      })

      content.push(table)
    }

    // Add other sections...
    this.addGenericSections(content, data, [
      'reajuste_salarial',
      'beneficios',
      'adicionais_e_gratificacoes',
      'jornada_de_trabalho',
      'estabilidade_provisoria'
    ])

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

    // Add other sections...
    this.addGenericSections(content, data, [
      'especificacoes_layout_arquivo',
      'conceitos_gerais_contabilizacao',
      'configuracao_conta_contabil',
      'configuracao_rateio_contabil'
    ])

    return content
  }

  addGenericSections(content, data, sections) {
    sections.forEach((section, index) => {
      if (data[section]) {
        content.push(
          new Paragraph({
            text: `${index + 2}. ${this.formatSectionTitle(section)}`,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...this.createInfoParagraphs(data[section])
        )
      }
    })
  }

  createInfoParagraphs(obj) {
    const paragraphs = []
    
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          paragraphs.push(
            new Paragraph({
              text: this.formatKey(key),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            ...this.createInfoParagraphs(value)
          )
        } else {
          paragraphs.push(this.createInfoParagraph(key, value))
        }
      }
    })
    
    return paragraphs
  }

  createInfoParagraph(key, value) {
    const displayValue = Array.isArray(value) ? value.join(', ') : String(value)
    
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