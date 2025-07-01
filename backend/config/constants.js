export const CONFIG = {
  PORT: process.env.PORT || 3001,
  UPLOAD_LIMITS: {
    FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['application/pdf']
  },
  AI: {
    TIMEOUT: 180000, // 3 minutes
    TEMPERATURE: 0.2,
    MAX_TOKENS: 4096,
    TOP_P: 1.0
  },
  DIRECTORIES: {
    UPLOADS: 'uploads',
    OUTPUT: 'output'
  }
}

export const PROCESSING_STEPS = {
  EXTRACT_TEXT: 'Extraindo texto do PDF...',
  ANALYZE_STRUCTURE: 'Analisando estrutura do documento...',
  PROCESS_FOLHA: 'Processando dados de folha de pagamento...',
  PROCESS_CONTABIL: 'Processando interface contábil...',
  GENERATE_REPORTS: 'Gerando documentos de suporte...',
  COMPLETE: 'Análise concluída!'
}

export const ERROR_MESSAGES = {
  NO_FILE: 'Nenhum arquivo foi enviado',
  INVALID_FILE_TYPE: 'Apenas arquivos PDF são permitidos',
  TEXT_EXTRACTION_FAILED: 'Falha na extração de texto do PDF',
  AI_ANALYSIS_FAILED: 'Falha na análise de IA',
  REPORT_GENERATION_FAILED: 'Falha na geração de relatórios',
  FILE_NOT_FOUND: 'Arquivo não encontrado',
  DOWNLOAD_ERROR: 'Erro no download do arquivo',
  MISSING_ENV_VARS: 'API_KEY e ENDPOINT_URI devem estar configurados no .env'
}