import apiClient from '../config/client'
import { API_ROUTES } from '../config/endpoints'

const ENDPOINT = API_ROUTES.QUESTIONS

export const questionsService = {
  async getAllQuestions(params = {}) {
    const response = await apiClient.get(`${ENDPOINT}/`, { params })
    return response.data
  },

  async getQuestion(id) {
    const response = await apiClient.get(`${ENDPOINT}/${id}`)
    return response.data
  },

  async createQuestion(data) {
    const response = await apiClient.post(`${ENDPOINT}/`, data)
    return response.data
  },

  async updateQuestion(id, data) {
    const response = await apiClient.put(`${ENDPOINT}/${id}/`, data)
    return response.data
  },

  async deleteQuestion(id) {
    const response = await apiClient.delete(`${ENDPOINT}/${id}`)
    return response.data
  },
}
