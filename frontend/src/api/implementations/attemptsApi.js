import apiClient from '../config/client'
import { API_ROUTES } from '../config/endpoints'

const ENDPOINT = API_ROUTES.ATTEMPTS

export const attemptsService = {
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

  async createAttempt(data) {
    const response = await apiClient.post(`${ENDPOINT}/`, data)
    return response.data
  },
}
