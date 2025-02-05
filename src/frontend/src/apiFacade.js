const axios = require('axios');

class ApiFacade {
  constructor(baseURL) {
    console.log('API Base URL:', baseURL); // Debug log
    this.client = axios.create({ 
      baseURL,
      timeout: 5000, // Add timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for debugging
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data
        });
        throw error;
      }
    );
  }

  async get(endpoint) {
    try {
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  async getById(endpoint, id) {
    try {
      const response = await this.client.get(`${endpoint}`, { params: { id: id } });
      return response.data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  }

  async getByName(endpoint, name) {
    try {
      const response = await this.client.get(`${endpoint}`, { params: { name: name } });
      return response.data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Error posting data:', error);
      throw error;
    }
  }

  // Add more methods as needed
  async put(endpoint, data) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    }
  }

  async delete(endpoint, params = {}) {
    try {
      await this.client.delete(endpoint, { params });
    } catch (error) {
      console.error('Error deleting data:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await this.client.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}

module.exports = ApiFacade;