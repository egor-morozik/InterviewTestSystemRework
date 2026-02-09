import apiClient from '../config/client'
import { API_ROUTES } from '../config/endpoints'

const ENDPOINT = API_ROUTES.ATTEMPTS

export const attemptsService = {
  async getAttemptByUniqueLink(uniqueLink) {
    const response = await apiClient.get(`${ENDPOINT}/${uniqueLink}/start/`)
    return response.data
  },

  async logActivity(uniqueLink, data) {
    const response = await apiClient.post(
      `${ENDPOINT}/${uniqueLink}/log/`,
      data
    )
    return response.data
  },

  async submitAttempt(uniqueLink, data) {
    const response = await apiClient.post(
      `${ENDPOINT}/${uniqueLink}/finish/`,
      data
    )
    return response.data
  },
}
