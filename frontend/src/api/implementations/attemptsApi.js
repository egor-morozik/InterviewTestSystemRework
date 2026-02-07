import apiClient from '../config/client'
import { API_ROUTES } from '../config/endpoints'

const ENDPOINT = API_ROUTES.ATTEMPTS

export const attemptsService = {
  async getAllAttempts(params = {}) {
    const response = await apiClient.get(`${ENDPOINT}/`, { params })
    return response.data
  },

  async getAttempt(id) {
    const response = await apiClient.get(`${ENDPOINT}/${id}/`)
    return response.data
  },

  async createAttempt(data) {
    const response = await apiClient.post(`${ENDPOINT}/`, data)
    return response.data
  },

  async updateAttempt(id, data) {
    const response = await apiClient.put(`${ENDPOINT}/${id}/`, data)
    return response.data
  },

  async deleteAttempt(id) {
    const response = await apiClient.delete(`${ENDPOINT}/${id}/`)
    return response.data
  },

  async logTabSwitch(uniqueLink, data) {
    const response = await apiClient.post(
      `${ENDPOINT}/${uniqueLink}/log/`,
      data
    )
    return response.data
  },

  async submitAttempt(uniqueLink, data) {
    const response = await apiClient.post(
      `${ENDPOINT}/${uniqueLink}/submit/`,
      data
    )
    return response.data
  },

  async getAttemptData(uniqueLink) {
    const response = await apiClient.get(`${ENDPOINT}/${uniqueLink}/`)
    return response.data
  },
}
