import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'
import { useDocumentAnalysis } from '../context/DocumentAnalysisContext'
import { analyzeDocument } from '../services/api'

function FileUpload() {
  const { state, actions } = useDocumentAnalysis()

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      actions.setFile(file)
    }
  }, [actions])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: state.processing
  })

  const handleAnalyze = async () => {
    if (!state.file) return

    try {
      actions.startProcessing()
      actions.addLog('Iniciando análise do documento...')
      
      const results = await analyzeDocument(state.file, {
        onProgress: (progress, step) => {
          actions.updateProgress(progress)
          actions.setCurrentStep(step)
          actions.addLog(`${step} (${progress}%)`)
        }
      })
      
      actions.setResults(results)
      actions.addLog('Análise concluída com sucesso!')
    } catch (error) {
      actions.setError(error.message)
      actions.addLog(`Erro: ${error.message}`)
    }
  }

  const handleRemoveFile = () => {
    actions.setFile(null)
  }

  const handleReset = () => {
    actions.reset()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Upload do Documento
        </h2>
        <p className="text-gray-600">
          Faça upload de um arquivo PDF para análise automática
        </p>
      </div>

      {!state.file ? (
        <div
          {...getRootProps()}
          className={`dropzone border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-primary-400 bg-primary-50/50' 
              : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50/30'
          } ${state.processing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-primary-100 rounded-full">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo PDF ou clique para selecionar'}
              </p>
              <p className="text-sm text-gray-500">
                Suporte para arquivos PDF até 10MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">{state.file.name}</p>
                <p className="text-sm text-green-700">
                  {(state.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!state.processing && !state.results && (
              <button
                onClick={handleRemoveFile}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            {!state.processing && !state.results && (
              <button
                onClick={handleAnalyze}
                className="btn-primary flex items-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>Iniciar Análise</span>
              </button>
            )}
            
            {(state.results || state.error) && (
              <button
                onClick={handleReset}
                className="btn-secondary flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Nova Análise</span>
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default FileUpload