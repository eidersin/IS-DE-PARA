import { useContext } from 'react'
import { DocumentAnalysisContext } from '../context/DocumentAnalysisContext'

export function useDocumentAnalysis() {
  const context = useContext(DocumentAnalysisContext)
  
  if (!context) {
    throw new Error('useDocumentAnalysis must be used within a DocumentAnalysisProvider')
  }
  
  return context
}