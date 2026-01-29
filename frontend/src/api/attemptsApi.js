import apiClient from "./client"


export const logTabSwitch = async(uniqueLink, data) => {
    const response = await apiClient.post(`/api/attempts/${uniqueLink}/log/`, data);
    return response.data;
}

export const submitAttempt = async(uniqueLink, data) => {
    const response = await apiClient.post(`/api/attempts/${uniqueLink}/submit/`, data);
    return response.data;
}

export const getAttemptData = async(uniqueLink) => {
    const response = await apiClient.get(`/api/attempts/${uniqueLink}/`);
    return response.data;
}

export const createAttempt = async(data) => {
    const response = await apiClient.post('/api/attempts/', data);
    return response.data;
}