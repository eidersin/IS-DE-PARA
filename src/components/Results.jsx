import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, ChevronDown, ChevronRight, Users, Calculator, Clock, CheckCircle } from 'lucide-react'
import { useDocumentAnalysis } from '../hooks/useDocumentAnalysis'
import { downloadDocument } from '../services/api'

function Results() {
  const { state } = useDocumentAnalysis()
  const [activeTab, setActiveTab] = useState('folha')
  const [expandedSections, setExpandedSections] = useState({})
  const [downloading, setDownloading] = useState({})

  if (!state.results) {
    return null
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleDownload = async (type) => {
    try {
      setDownloading(prev => ({ ...prev, [type]: true }))
      await downloadDocument(type)
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error)
      // You could add a toast notification here
    } finally {
      setDownloading(prev => ({ ...prev, [type]: false }))
    }
  }

  const renderValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Não informado</span>
    }
    
    if (typeof value === 'boolean') {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Sim' : 'Não'}
        </span>
      )
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic">Nenhum item</span>
      }
      return (
        <div className="space-y-1">
          {value.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded p-2 text-sm">
              {typeof item === 'object' ? renderJsonData(item, 1) : String(item)}
            </div>
          ))}
        </div>
      )
    }
    
    return <span className="text-gray-700">{String(value)}</span>
  }

  const renderJsonData = (data, level = 0) => {
    if (!data || typeof data !== 'object') {
      return renderValue(data)
    }

    return (
      <div className={`space-y-2 ${level > 0 ? 'ml-4' : ''}`}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="border-l-2 border-gray-100 pl-3">
            <div className="flex items-start space-x-2">
              <span className="text-sm font-medium text-gray-700 capitalize min-w-0 flex-shrink-0">
                {key.replace(/_/g, ' ')}:
              </span>
              <div className="flex-1 min-w-0">
                {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                  renderJsonData(value, level + 1)
                ) : (
                  renderValue(value)
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const getSectionCount = (data) => {
    if (!data || typeof data !== 'object') return 0
    return Object.keys(data).length
  }

  const hasValidData = (data) => {
    if (!data || typeof data !== 'object') return false
    return Object.values(data).some(value => 
      value !== null && value !== undefined && value !== '' && 
      (!Array.isArray(value) || value.length > 0)
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Resultados da Análise
                </h3>
                {state.results.processingTime && (
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Processado em {(state.results.processingTime / 1000).toFixed(1)}s</span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleDownload('folha')}
                disabled={downloading.folha}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{downloading.folha ? 'Baixando...' : 'Folha'}</span>
              </button>
              <button
                onClick={() => handleDownload('contabil')}
                disabled={downloading.contabil}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{downloading.contabil ? 'Baixando...' : 'Contábil'}</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('folha')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'folha'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Folha de Pagamento</span>
                  {state.results.folha && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {getSectionCount(state.results.folha)} seções
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('contabil')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'contabil'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4" />
                  <span>Interface Contábil</span>
                  {state.results.contabil && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {getSectionCount(state.results.contabil)} seções
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'folha' && state.results.folha && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {Object.entries(state.results.folha).map(([section, data]) => {
                  if (!hasValidData(data)) return null
                  
                  return (
                    <div key={section} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(`folha-${section}`)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 capitalize">
                          {section.replace(/_/g, ' ')}
                        </h4>
                        {expandedSections[`folha-${section}`] ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedSections[`folha-${section}`] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-200 p-4 bg-gray-50"
                          >
                            {renderJsonData(data)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </motion.div>
            )}

            {activeTab === 'contabil' && state.results.contabil && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {Object.entries(state.results.contabil).map(([section, data]) => {
                  if (!hasValidData(data)) return null
                  
                  return (
                    <div key={section} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(`contabil-${section}`)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 capitalize">
                          {section.replace(/_/g, ' ')}
                        </h4>
                        {expandedSections[`contabil-${section}`] ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedSections[`contabil-${section}`] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-200 p-4 bg-gray-50"
                          >
                            {renderJsonData(data)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </motion.div>
            )}

            {/* Empty state */}
            {((activeTab === 'folha' && !hasValidData(state.results.folha)) ||
              (activeTab === 'contabil' && !hasValidData(state.results.contabil))) && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum dado encontrado
                </h4>
                <p className="text-gray-500">
                  Não foram encontradas informações relevantes para esta seção no documento analisado.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Results