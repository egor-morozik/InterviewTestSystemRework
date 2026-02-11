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

    async logTabSwitch(attemptId, data) {
        const response = await apiClient.post(
            `${ENDPOINT}/${attemptId}/log/`,
            data
        )
        return response.data
    },

    async submitAttempt(attemptId, data) {
        const response = await apiClient.post(
            `/candidate_attempts/${attemptId}/finish/`,
            data
        )
        return response.data
    },

    async logActivity(attemptId, data) {
        const response = await apiClient.post(
            `/candidate_attempts/${attemptId}/log/`,
            data
        )
        return response.data
    },

    async getAttemptData(attemptId) {
        const response = await apiClient.get(`/candidate_attempts/${attemptId}/start/`)
        return response.data
    },

    async getCompletedAttempts(params = {}) {
        const response = await apiClient.get(`${ENDPOINT}/completed/`, { params })
        return response.data
    },

    async getEvaluatedAttempts(params = {}) {
        const response = await apiClient.get(`${ENDPOINT}/evaluated/`, { params })
        return response.data
    },

    async getAttemptsForEvaluation(params = {}) {
        const response = await apiClient.get(`${ENDPOINT}/for-evaluation/`, {
            params,
        })
        return response.data
    },

    async getAttemptAnswers(attemptId) {
        const response = await apiClient.get(`${ENDPOINT}/${attemptId}/answers/`)
        return response.data
    },
}