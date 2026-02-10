const API_BASE = "http://localhost:3000";

/**
 * Validates the response and returns JSON or throws error.
 * @param {Response} response 
 */
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `Request failed with status ${response.status}`);
    }
    return response.json();
}

export const api = {
    /**
     * GET request
     * @param {string} endpoint e.g. '/orders'
     */
    get: async (endpoint) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`);
            return handleResponse(res);
        } catch (error) {
            console.error(`GET ${endpoint} failed:`, error);
            throw error;
        }
    },

    /**
     * POST request
     * @param {string} endpoint 
     * @param {object} body 
     */
    post: async (endpoint, body) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return handleResponse(res);
        } catch (error) {
            console.error(`POST ${endpoint} failed:`, error);
            throw error;
        }
    },

    /**
     * PUT request
     * @param {string} endpoint 
     * @param {object} body 
     */
    put: async (endpoint, body) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return handleResponse(res);
        } catch (error) {
            console.error(`PUT ${endpoint} failed:`, error);
            throw error;
        }
    },
    /**
     * PATCH request
     * @param {string} endpoint 
     * @param {object} body 
     */
    patch: async (endpoint, body) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return handleResponse(res);
        } catch (error) {
            console.error(`PATCH ${endpoint} failed:`, error);
            throw error;
        }
    }
};
