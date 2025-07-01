import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, Eye, ChevronDown, ChevronRight, Users, Calculator } from 'lucide-react'
import { useDocumentAnalysis } from '../context/DocumentAnalysisContext'

function Results() {
  const { state } = useDocumentAnalysis()
  const [activeTab, setActiveTab] = useState('folha')
  const [expandedSections, setExpandedSections] = useState({})

  if (!state.results) {
    return null
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const downloadFile = async (type) => {
    try {
      const response = await fetch(`/api/download/${type}`, {
        method: 'GET',
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = type === 'folha' ? 'Folha_Pagamento.docx' : 'Interface_Contabil.docx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error)
    }
  }

  const renderJsonData = (data, level = 0) => {
    if (!data || typeof data !== 'object') {
      return <span className="text-gray-600">{String(data)}</span>
    }

    return (
      <div className={`space-y-2 ${level > 0 ? 'ml-4' : ''}`}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="border-l-2 border-gray-100 pl-3">
            <div className="flex items-start space-x-2">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {key.replace(/_/g, ' ')}:
              </span>
              {typeof value === 'object' && value !== null ? (
                <div className="flex-1">
                  {Array.isArray(value) ? (
                    <div className="space-y-1">
                      {value.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded p-2 text-sm">
                          {typeof item === 'object' ? renderJsonData(item, level + 1) : String(item)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    renderJsonData(value, level + 1)
                  )}
                </div>
              ) : (
                <span className="text-gray-600 text-sm">{String(value)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
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
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-gray-900">
              Resultados da Análise
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => downloadFile('folha')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Folha</span>
              </button>
              <button
                onClick={() => downloadFile('contabil')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Contábil</span>
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
                {Object.entries(state.results.folha).map(([section, data]) => (
                  <div key={section} className="border border-gray-200 rounded-lg">
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
                ))}
              </motion.div>
            )}

            {activeTab === 'contabil' && state.results.contabil && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {Object.entries(state.results.contabil).map(([section, data]) => (
                  <div key={section} className="border border-gray-200 rounded-lg">
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
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Results