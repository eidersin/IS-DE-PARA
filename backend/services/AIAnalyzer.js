import axios from 'axios'
import { folhaSchema, contabilSchema } from '../schemas/index.js'

export class AIAnalyzer {
  constructor() {
    this.apiKey = process.env.API_KEY
    this.endpoint = process.env.ENDPOINT_URI
    
    if (!this.apiKey || !this.endpoint) {
      throw new Error('API_KEY e ENDPOINT_URI devem estar configurados no .env')
    }
  }

  async analyzeFolhaPagamento(text) {
    const prompt = this.buildFolhaPrompt()
    return this.callAI(text, prompt, 'Folha de Pagamento')
  }

  async analyzeInterfaceContabil(text) {
    const prompt = this.buildContabilPrompt()
    return this.callAI(text, prompt, 'Interface Contábil')
  }

  buildFolhaPrompt() {
    return `
Você é um analista sênior especialista em Folha de Pagamento e Convenções Coletivas de Trabalho (CCT).

Sua tarefa é analisar o documento fornecido e extrair informações estruturadas sobre:
- Identificação do documento e sindicatos
- Pisos salariais por cargo/função
- Regras de reajuste salarial
- Benefícios obrigatórios (vale alimentação, auxílio creche, etc.)
- Adicionais e gratificações (horas extras, adicional noturno, etc.)
- Jornada de trabalho e regras especiais
- Estabilidade provisória
- Regras de rescisão contratual
- Saúde e segurança do trabalhador
- Contribuições sindicais

IMPORTANTE: 
- Extraia apenas informações que estão explicitamente no documento
- Use "Não informado" para campos sem informação
- Para valores monetários, use apenas números (ex: 1500.00)
- Para percentuais, inclua o símbolo % (ex: "50%")
- Para datas, use formato dd/mm/aaaa
- Escape aspas duplas em strings JSON usando \\"

Retorne um JSON válido seguindo exatamente a estrutura do schema fornecido.

Schema JSON: ${JSON.stringify(folhaSchema, null, 2)}
`
  }

  buildContabilPrompt() {
    return `
Você é um analista sênior especialista em Contabilidade e Sistemas de Integração Contábil.

Sua tarefa é analisar o documento e extrair informações sobre:
- Informações gerais do cliente e sistema contábil
- Especificações do layout de arquivo para integração
- Conceitos gerais de contabilização (empresas, agrupamentos, plano de contas)
- Configuração de contas contábeis
- Configuração de rateio contábil

IMPORTANTE:
- Extraia apenas informações explícitas no documento
- Use "Não informado" para campos sem informação
- Para campos booleanos, use true/false
- Para arrays vazios, use []
- Escape aspas duplas em strings JSON usando \\"

Retorne um JSON válido seguindo exatamente a estrutura do schema fornecido.

Schema JSON: ${JSON.stringify(contabilSchema, null, 2)}
`
  }

  async callAI(text, systemPrompt, agentName) {
    try {
      console.log(`Chamando IA para análise: ${agentName}`)
      
      const response = await axios.post(this.endpoint, {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        max_tokens: 4096,
        temperature: 0.2,
        top_p: 1.0,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        timeout: 180000
      })

      const jsonContent = response.data.choices[0].message.content
      
      try {
        const parsedData = JSON.parse(jsonContent)
        console.log(`Análise ${agentName} concluída com sucesso`)
        return parsedData
      } catch (parseError) {
        console.error(`Erro ao parsear JSON do ${agentName}:`, parseError)
        
        // Attempt to repair JSON
        const repairedJson = await this.repairJSON(jsonContent, parseError.message)
        if (repairedJson) {
          return JSON.parse(repairedJson)
        }
        
        throw new Error(`JSON inválido retornado pela IA para ${agentName}`)
      }
      
    } catch (error) {
      console.error(`Erro na análise ${agentName}:`, error)
      throw new Error(`Falha na análise de ${agentName}: ${error.message}`)
    }
  }

  async repairJSON(brokenJson, originalError) {
    try {
      console.log('Tentando reparar JSON quebrado...')
      
      const repairPrompt = `
O seguinte texto deveria ser um JSON válido, mas falhou ao ser parseado.
Erro: "${originalError}"

Corrija o JSON e retorne apenas o JSON válido, sem explicações:

${brokenJson}
`

      const response = await axios.post(this.endpoint, {
        messages: [{ role: 'user', content: repairPrompt }],
        max_tokens: 4096,
        temperature: 0.0,
        top_p: 1.0
      }, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        timeout: 60000
      })

      const repairedContent = response.data.choices[0].message.content
      
      // Remove markdown code blocks if present
      const cleanedContent = repairedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Validate the repaired JSON
      JSON.parse(cleanedContent)
      console.log('JSON reparado com sucesso')
      
      return cleanedContent
    } catch (error) {
      console.error('Falha no reparo do JSON:', error)
      return null
    }
  }
}