import apiClient from './client'


export const getAllCandidates = async() => {
    const response = await apiClient.get(`/api/candidates/`)
    return response.data
}

export const getCandidate = async(id) => {
    const response = await apiClient.get(`/api/candidates/${id}`)
    return response.data
}

export const createCandidate = async(data) => {
    const response = await apiClient.post('/api/candidates/', data);
    return response.data;
}

export const updateCandidate = async(id, data) => {
    const response = await apiClient.put(`/api/candidates/${id}/`, data);
    return response.data;
}

export const deleteCandidate = async(id) => {
    const response = await apiClient.delete(`/api/candidates/${id}`)
    return response.data
}