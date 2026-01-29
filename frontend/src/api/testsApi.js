import apiClient from './client'


export const getAllTests = async() => {
    const response = await apiClient.get(`/api/tests/`)
    return response.data
}

export const getTest = async(id) => {
    const response = await apiClient.get(`/api/tests/${id}`)
    return response.data
}

export const createTest = async(data) => {
    const response = await apiClient.post(`/api/tests/`, data)
    return response.data
}

export const updateTest = async(id, data) => {
    const response = await apiClient.put(`/api/questions/${id}/`, data)
    return response.data
}

export const deleteTest = async(id) => {
    const response = await apiClient.delete(`/api/questions/${id}/`)
    return response.data
}