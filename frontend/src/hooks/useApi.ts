// src/hooks/useApi.ts
import { useState, useEffect } from 'react'
import api from '@/services/api'

export const useTestConnection = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get('/test')
        setIsConnected(true)
        setError(null)
      } catch (err) {
        setIsConnected(false)
        setError('Error conectando con el backend')
      }
    }

    testConnection()
  }, [])

  return { isConnected, error }
}