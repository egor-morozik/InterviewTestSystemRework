import apiClient from '../config/client'
import { API_ROUTES } from '../config/endpoints'

const ENDPOINT = API_ROUTES.CANDIDATES

export const candidateService = {
  async getAllCandidates() {
    const response = await apiClient.get(`${ENDPOINT}/`)
    return response.data
  },

  async getCandidate(id) {
    const response = await apiClient.get(`${ENDPOINT}/${id}/`)
    return response.data
  },

  async createCandidate(data) {
    const response = await apiClient.post(`${ENDPOINT}/`, data)
    return response.data
  },

  async updateCandidate(id, data) {
    const response = await apiClient.put(`${ENDPOINT}/${id}/`, data)
    return response.data
  },

  async deleteCandidate(id) {
    const response = await apiClient.delete(`${ENDPOINT}/${id}/`)
    return response.data
  },
}
