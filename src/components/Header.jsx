import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Brain, Zap } from 'lucide-react'

function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect border-b border-white/20"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-blue-500 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DocAnalyzer AI</h1>
              <p className="text-sm text-gray-600">Análise Inteligente de Documentos</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">PDF Support</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">IA Powered</span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header