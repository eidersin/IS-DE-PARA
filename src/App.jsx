import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import ProcessingStatus from './components/ProcessingStatus'
import Results from './components/Results'
import { DocumentAnalysisProvider } from './context/DocumentAnalysisContext'

function App() {
  return (
    <DocumentAnalysisProvider>
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Sistema de Análise de
                <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                  {" "}Documentos
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Análise inteligente de documentos com IA para extração automatizada de dados 
                de folha de pagamento e interfaces contábeis
              </p>
            </div>

            <div className="grid gap-8">
              <FileUpload />
              <ProcessingStatus />
              <Results />
            </div>
          </motion.div>
        </main>
      </div>
    </DocumentAnalysisProvider>
  )
}

export default App