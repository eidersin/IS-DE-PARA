import axios from 'axios'
import { folhaSchema, contabilSchema } from '../schemas/index.js'
import { ValidationUtils } from '../utils/validation.js'
import { CONFIG, ERROR_MESSAGES } from '../config/constants.js'

export class AIAnalyzer {
  constructor() {
    ValidationUtils.validateEnvironment()
    
    this.apiKey = process.env.API_KEY
    this.endpoint = process.env.ENDPOINT_URI
    this.requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey
      },
      timeout: CONFIG.AI.TIMEOUT
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

REGRAS IMPORTANTES:
1. Extraia apenas informações que estão explicitamente no documento
2. Use "Não informado" para campos sem informação
3. Para valores monetários, use apenas números (ex: 1500.00)
4. Para percentuais, inclua o símbolo % (ex: "50%")
5. Para datas, use formato dd/mm/aaaa
6. Escape aspas duplas em strings JSON usando \\"
7. Retorne um JSON válido seguindo exatamente a estrutura do schema

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

REGRAS IMPORTANTES:
1. Extraia apenas informações explícitas no documento
2. Use "Não informado" para campos sem informação
3. Para campos booleanos, use true/false
4. Para arrays vazios, use []
5. Escape aspas duplas em strings JSON usando \\"
6. Retorne um JSON válido seguindo exatamente a estrutura do schema

Schema JSON: ${JSON.stringify(contabilSchema, null, 2)}
`
  }

  async callAI(text, systemPrompt, agentName) {
    const maxRetries = 3
    let lastError

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Tentativa ${attempt}/${maxRetries} - Chamando IA para análise: ${agentName}`)
        
        const response = await axios.post(this.endpoint, {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          max_tokens: CONFIG.AI.MAX_TOKENS,
          temperature: CONFIG.AI.TEMPERATURE,
          top_p: CONFIG.AI.TOP_P,
          response_format: { type: 'json_object' }
        }, this.requestConfig)

        const jsonContent = response.data.choices[0].message.content
        
        try {
          const parsedData = ValidationUtils.validateJSON(jsonContent)
          console.log(`Análise ${agentName} concluída com sucesso`)
          return parsedData
        } catch (parseError) {
          console.error(`Erro ao parsear JSON do ${agentName}:`, parseError)
          
          // Attempt to repair JSON on last retry
          if (attempt === maxRetries) {
            const repairedJson = await this.repairJSON(jsonContent, parseError.message)
            if (repairedJson) {
              return ValidationUtils.validateJSON(repairedJson)
            }
          }
          
          throw new Error(`JSON inválido retornado pela IA para ${agentName}`)
        }
        
      } catch (error) {
        lastError = error
        console.error(`Erro na tentativa ${attempt} para ${agentName}:`, error.message)
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
          console.log(`Aguardando ${delay}ms antes da próxima tentativa...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw new Error(`${ERROR_MESSAGES.AI_ANALYSIS_FAILED} para ${agentName}: ${lastError.message}`)
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
        max_tokens: CONFIG.AI.MAX_TOKENS,
        temperature: 0.0,
        top_p: 1.0
      }, this.requestConfig)

      const repairedContent = response.data.choices[0].message.content
      
      // Remove markdown code blocks if present
      const cleanedContent = repairedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Validate the repaired JSON
      ValidationUtils.validateJSON(cleanedContent)
      console.log('JSON reparado com sucesso')
      
      return cleanedContent
    } catch (error) {
      console.error('Falha no reparo do JSON:', error)
      return null
    }
  }
}