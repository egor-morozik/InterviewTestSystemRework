import apiClient from './client'


export const getAllQuestions = async() => {
    const response = await apiClient.get(`/api/questions/`)
    return response.data
}

export const getQuestion = async(id) => {
    const response = await apiClient.get(`/api/questions/${id}`)
    return response.data
}

export const createQuestion = async(data) => {
    const response = await apiClient.post('/api/questions/', data);
    return response.data;
}

export const updateQuestion = async(id, data) => {
    const response = await apiClient.put(`/api/questions/${id}/`, data);
    return response.data;
}

export const deleteQuestion = async(id) => {
    const response = await apiClient.delete(`/api/questions/${id}`)
    return response.data
}