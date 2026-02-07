import apiClient from '../config/client'
import { API_ROUTES } from '../config/endpoints'

const ENDPOINT = API_ROUTES.RESULTS

export const resultsService = {
  async getAllResults(params = {}) {
    const response = await apiClient.get(`${ENDPOINT}/`, { params })
    return response.data
  },

  async getResult(id) {
    const response = await apiClient.get(`${ENDPOINT}/${id}/`)
    return response.data
  },

  async getResultDetails(id) {
    const response = await apiClient.get(`${ENDPOINT}/${id}/details/`)
    return response.data
  },

  async evaluateResult(id, data) {
    const response = await apiClient.post(`${ENDPOINT}/${id}/evaluate/`, data)
    return response.data
  },

  async deleteResult(id) {
    const response = await apiClient.delete(`${ENDPOINT}/${id}/`)
    return response.data
  },

  async getResultsStats() {
    const response = await apiClient.get(`${ENDPOINT}/stats/`)
    return response.data
  },

  async exportResults(params = {}) {
    const response = await apiClient.get(`${ENDPOINT}/export/`, {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}
