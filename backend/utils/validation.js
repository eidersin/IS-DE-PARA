import { CONFIG, ERROR_MESSAGES } from '../config/constants.js'

export class ValidationUtils {
  static validateFile(file) {
    if (!file) {
      throw new Error(ERROR_MESSAGES.NO_FILE)
    }

    if (!CONFIG.UPLOAD_LIMITS.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE)
    }

    if (file.size > CONFIG.UPLOAD_LIMITS.FILE_SIZE) {
      throw new Error(`Arquivo muito grande. Máximo permitido: ${CONFIG.UPLOAD_LIMITS.FILE_SIZE / 1024 / 1024}MB`)
    }

    return true
  }

  static validateEnvironment() {
    const requiredVars = ['API_KEY', 'ENDPOINT_URI']
    const missing = requiredVars.filter(varName => !process.env[varName])
    
    if (missing.length > 0) {
      throw new Error(`${ERROR_MESSAGES.MISSING_ENV_VARS}. Variáveis faltando: ${missing.join(', ')}`)
    }

    return true
  }

  static sanitizeText(text) {
    if (!text || typeof text !== 'string') {
      return ''
    }

    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
  }

  static validateJSON(jsonString) {
    try {
      return JSON.parse(jsonString)
    } catch (error) {
      throw new Error(`JSON inválido: ${error.message}`)
    }
  }
}