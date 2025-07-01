import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, Terminal } from 'lucide-react'
import { useDocumentAnalysis } from '../hooks/useDocumentAnalysis'

function ProcessingStatus() {
  const { state } = useDocumentAnalysis()

  if (!state.processing && !state.results && !state.error) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="card"
      >
        <div className="space-y-6">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Status da Análise
            </h3>
            <div className="flex items-center space-x-2">
              {state.processing && (
                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
              )}
              {state.results && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              {state.error && (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                state.processing ? 'text-primary-600' :
                state.results ? 'text-green-600' :
                state.error ? 'text-red-600' : 'text-gray-600'
              }`}>
                {state.processing ? 'Processando...' :
                 state.results ? 'Concluído' :
                 state.error ? 'Erro' : 'Aguardando'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {(state.processing || state.results) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{state.currentStep}</span>
                <span className="text-gray-900 font-medium">{state.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="progress-bar h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${state.progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Erro na Análise</h4>
                  <p className="text-sm text-red-700 mt-1">{state.error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Logs */}
          {state.logs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-medium text-gray-900">Log de Atividades</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="space-y-1">
                  {state.logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-3 text-xs"
                    >
                      <span className="text-gray-500 font-mono">{log.timestamp}</span>
                      <span className="text-gray-700">{log.message}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProcessingStatus