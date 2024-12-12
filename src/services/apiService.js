const axios = require('axios');
const { API_URL } = require('../config/config');

exports.getUserData = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}${userId}`);
        return response.data.data; 
    } catch (error) {
        throw error;
    }
};