import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 300000, // 5 minutes
})

export const analyzeDocument = async (file, options = {}) => {
  const { onProgress } = options
  
  const formData = new FormData()
  formData.append('document', file)

  try {
    // Simulate progress updates
    const progressSteps = [
      { progress: 10, step: 'Extraindo texto do PDF...' },
      { progress: 30, step: 'Analisando estrutura do documento...' },
      { progress: 50, step: 'Processando dados de folha de pagamento...' },
      { progress: 70, step: 'Processando interface contábil...' },
      { progress: 90, step: 'Gerando documentos de suporte...' },
      { progress: 100, step: 'Análise concluída!' }
    ]

    let currentStep = 0
    const progressInterval = setInterval(() => {
      if (currentStep < progressSteps.length && onProgress) {
        const { progress, step } = progressSteps[currentStep]
        onProgress(progress, step)
        currentStep++
      }
      
      if (currentStep >= progressSteps.length) {
        clearInterval(progressInterval)
      }
    }, 2000)

    const response = await api.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    clearInterval(progressInterval)
    
    if (onProgress) {
      onProgress(100, 'Análise concluída!')
    }

    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro na análise do documento')
  }
}

export default api