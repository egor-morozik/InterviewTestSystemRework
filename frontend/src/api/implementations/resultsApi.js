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

  async updateAnswerScore(attemptId, answerId, data) {
    const response = await apiClient.patch(
      `${ENDPOINT}/${attemptId}/answer/${answerId}/score/`,
      data
    )
    return response.data
  },
}
