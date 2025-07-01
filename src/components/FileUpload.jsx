import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useDocumentAnalysis } from '../hooks/useDocumentAnalysis'
import { analyzeDocument } from '../services/api'

function FileUpload() {
  const { state, actions } = useDocumentAnalysis()
  const [dragError, setDragError] = useState(null)

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragError(null)
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        setDragError('Arquivo muito grande. Máximo permitido: 10MB')
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        setDragError('Apenas arquivos PDF são permitidos')
      } else {
        setDragError('Arquivo inválido')
      }
      return
    }

    const file = acceptedFiles[0]
    if (file) {
      actions.setFile(file)
    }
  }, [actions])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: state.processing,
    onDragEnter: () => setDragError(null)
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
      
      actions.setResults(results.data)
      actions.addLog('Análise concluída com sucesso!')
    } catch (error) {
      actions.setError(error.message)
      actions.addLog(`Erro: ${error.message}`)
    }
  }

  const handleRemoveFile = () => {
    actions.setFile(null)
    setDragError(null)
  }

  const handleReset = () => {
    actions.reset()
    setDragError(null)
  }

  const getDropzoneClassName = () => {
    let className = "dropzone border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 "
    
    if (state.processing) {
      className += "opacity-50 cursor-not-allowed border-gray-300"
    } else if (isDragReject || dragError) {
      className += "border-red-400 bg-red-50/50"
    } else if (isDragActive) {
      className += "border-primary-400 bg-primary-50/50"
    } else {
      className += "border-gray-300 hover:border-primary-400 hover:bg-primary-50/30"
    }
    
    return className
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
        <div>
          <div
            {...getRootProps()}
            className={getDropzoneClassName()}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <div className={`p-4 rounded-full ${
                isDragReject || dragError ? 'bg-red-100' : 'bg-primary-100'
              }`}>
                {isDragReject || dragError ? (
                  <AlertCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <Upload className="w-8 h-8 text-primary-600" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive 
                    ? 'Solte o arquivo aqui' 
                    : 'Arraste um arquivo PDF ou clique para selecionar'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  Suporte para arquivos PDF até 10MB
                </p>
              </div>
            </div>
          </div>
          
          {dragError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700">{dragError}</p>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
          >
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
                title="Remover arquivo"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>

          <div className="flex gap-4 justify-center">
            {!state.processing && !state.results && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleAnalyze}
                className="btn-primary flex items-center space-x-2"
                disabled={!state.file}
              >
                <FileText className="w-5 h-5" />
                <span>Iniciar Análise</span>
              </motion.button>
            )}
            
            {(state.results || state.error) && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleReset}
                className="btn-secondary flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Nova Análise</span>
              </motion.button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default FileUpload