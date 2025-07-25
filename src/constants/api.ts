// API endpoints
export const API_BASE_URL = 'http://15.206.121.90:1935'
export const LLM_API_BASE_URL =  'http://15.206.121.90:8005'

// LLM API endpoints
export const LLM_START_SESSION_ENDPOINT = `${LLM_API_BASE_URL}/start-session/`;
export const LLM_UPLOAD_PDF_ENDPOINT = `${LLM_API_BASE_URL}/upload-pdf/`;
export const LLM_ASK_QUESTION_ENDPOINT = `${LLM_API_BASE_URL}/ask-question/`;
export const LLM_LIST_FILES_ENDPOINT = `${LLM_API_BASE_URL}/list-files/`;
export const LLM_SCRAPE_URL_ENDPOINT = `${LLM_API_BASE_URL}/scrape-url/`;
export const LLM_DELETE_SESSION_ENDPOINT = `${LLM_API_BASE_URL}/delete-session/`;
