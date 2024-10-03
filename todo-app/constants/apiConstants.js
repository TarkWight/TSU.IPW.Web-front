const API_BASE_URL = 'https://192.168.0.36:7088/api/Tasks';

export const API_ENDPOINTS = {
    GET_ALL_TASKS: `${API_BASE_URL}`,
    CREATE_TASK: `${API_BASE_URL}`,
    GET_TASK_BY_ID: (id) => `${API_BASE_URL}/${id}`,
    UPDATE_TASK: (id) => `${API_BASE_URL}/${id}`,
    DELETE_TASK: (id) => `${API_BASE_URL}/${id}`,
    MARK_TASK_COMPLETE: (id) => `${API_BASE_URL}/${id}/complete`,
    MARK_TASK_INCOMPLETE: (id) => `${API_BASE_URL}/${id}/incomplete`,
    IMPORT_TASKS: `${API_BASE_URL}/import`,
};
