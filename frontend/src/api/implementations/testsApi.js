import apiClient from '../config/client'
import { API_ROUTES } from '../config/endpoints'

const ENDPOINT = API_ROUTES.TESTS

export const testsService = {
  async getAllTests(params = {}) {
    const response = await apiClient.get(`${ENDPOINT}/`, { params })
    return response.data
  },

  async getTest(id) {
    const response = await apiClient.get(`${ENDPOINT}/${id}/`)
    return response.data
  },

  async createTest(data) {
    const response = await apiClient.post(`${ENDPOINT}/`, data)
    return response.data
  },

  async updateTest(id, data) {
    const response = await apiClient.put(`${ENDPOINT}/${id}/`, data)
    return response.data
  },

  async deleteTest(id) {
    const response = await apiClient.delete(`${ENDPOINT}/${id}/`)
    return response.data
  },
}
