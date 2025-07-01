import React, { createContext, useReducer } from 'react'

export const DocumentAnalysisContext = createContext()

const initialState = {
  file: null,
  processing: false,
  progress: 0,
  currentStep: '',
  results: null,
  error: null,
  logs: []
}

const actionTypes = {
  SET_FILE: 'SET_FILE',
  START_PROCESSING: 'START_PROCESSING',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_RESULTS: 'SET_RESULTS',
  SET_ERROR: 'SET_ERROR',
  ADD_LOG: 'ADD_LOG',
  RESET: 'RESET'
}

function documentAnalysisReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_FILE:
      return { 
        ...state, 
        file: action.payload, 
        error: null,
        results: null,
        progress: 0,
        currentStep: '',
        logs: []
      }
    
    case actionTypes.START_PROCESSING:
      return { 
        ...state, 
        processing: true, 
        progress: 0, 
        currentStep: 'Iniciando análise...', 
        error: null,
        results: null,
        logs: []
      }
    
    case actionTypes.UPDATE_PROGRESS:
      return { 
        ...state, 
        progress: Math.min(100, Math.max(0, action.payload))
      }
    
    case actionTypes.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload }
    
    case actionTypes.SET_RESULTS:
      return { 
        ...state, 
        results: action.payload, 
        processing: false, 
        progress: 100,
        currentStep: 'Análise concluída!',
        error: null
      }
    
    case actionTypes.SET_ERROR:
      return { 
        ...state, 
        error: action.payload, 
        processing: false,
        currentStep: 'Erro na análise',
        results: null
      }
    
    case actionTypes.ADD_LOG:
      return { 
        ...state, 
        logs: [...state.logs, { 
          id: Date.now() + Math.random(), 
          message: action.payload, 
          timestamp: new Date().toLocaleTimeString('pt-BR')
        }]
      }
    
    case actionTypes.RESET:
      return initialState
    
    default:
      return state
  }
}

export function DocumentAnalysisProvider({ children }) {
  const [state, dispatch] = useReducer(documentAnalysisReducer, initialState)

  const actions = {
    setFile: (file) => dispatch({ type: actionTypes.SET_FILE, payload: file }),
    startProcessing: () => dispatch({ type: actionTypes.START_PROCESSING }),
    updateProgress: (progress) => dispatch({ type: actionTypes.UPDATE_PROGRESS, payload: progress }),
    setCurrentStep: (step) => dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: step }),
    setResults: (results) => dispatch({ type: actionTypes.SET_RESULTS, payload: results }),
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    addLog: (message) => dispatch({ type: actionTypes.ADD_LOG, payload: message }),
    reset: () => dispatch({ type: actionTypes.RESET })
  }

  return (
    <DocumentAnalysisContext.Provider value={{ state, actions }}>
      {children}
    </DocumentAnalysisContext.Provider>
  )
}