import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 300000, // 5 minutes
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const analyzeDocument = async (file, options = {}) => {
  const { onProgress } = options
  
  if (!file) {
    throw new Error('Arquivo é obrigatório')
  }

  // Validate file type
  if (file.type !== 'application/pdf') {
    throw new Error('Apenas arquivos PDF são permitidos')
  }

  // Validate file size (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(`Arquivo muito grande. Máximo permitido: ${maxSize / 1024 / 1024}MB`)
  }

  const formData = new FormData()
  formData.append('document', file)

  try {
    // Simulate progress updates for better UX
    const progressSteps = [
      { progress: 10, step: 'Enviando arquivo...' },
      { progress: 25, step: 'Extraindo texto do PDF...' },
      { progress: 45, step: 'Analisando estrutura do documento...' },
      { progress: 65, step: 'Processando dados de folha de pagamento...' },
      { progress: 80, step: 'Processando interface contábil...' },
      { progress: 95, step: 'Gerando documentos de suporte...' },
      { progress: 100, step: 'Análise concluída!' }
    ]

    let currentStep = 0
    const progressInterval = setInterval(() => {
      if (currentStep < progressSteps.length - 1 && onProgress) {
        const { progress, step } = progressSteps[currentStep]
        onProgress(progress, step)
        currentStep++
      }
    }, 1500)

    const response = await api.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          if (uploadProgress < 100) {
            onProgress(Math.min(uploadProgress, 10), 'Enviando arquivo...')
          }
        }
      }
    })

    clearInterval(progressInterval)
    
    if (onProgress) {
      onProgress(100, 'Análise concluída!')
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Erro na análise do documento')
    }

    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Erro na análise do documento'
    throw new Error(errorMessage)
  }
}

export const downloadDocument = async (type) => {
  try {
    if (!['folha', 'contabil'].includes(type)) {
      throw new Error('Tipo de documento inválido')
    }

    const response = await api.get(`/download/${type}`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    })
    
    const url = window.URL.createObjectURL(blob)
    const filename = type === 'folha' ? 'Folha_Pagamento.docx' : 'Interface_Contabil.docx'
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Erro no download do arquivo'
    throw new Error(errorMessage)
  }
}

export const checkHealth = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    throw new Error('Servidor indisponível')
  }
}

export default api