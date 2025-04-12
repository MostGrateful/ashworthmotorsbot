require('dotenv').config();
const axios = require('axios');

const TRELLO_BASE_URL = 'https://api.trello.com/1';

const TrelloAPI = {
  async createCard(listId, name, desc, due) {
    try {
      const response = await axios.post(`${TRELLO_BASE_URL}/cards`, null, {
        params: {
          key: process.env.TRELLO_API_KEY,
          token: process.env.TRELLO_API_TOKEN,
          idList: listId,
          name: name,
          desc: desc,
          due: due,
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error creating Trello card:', error.response?.data || error);
      throw error;
    }
  },

  async getListsOnBoard(boardId) {
    try {
      const response = await axios.get(`${TRELLO_BASE_URL}/boards/${boardId}/lists`, {
        params: {
          key: process.env.TRELLO_API_KEY,
          token: process.env.TRELLO_API_TOKEN,
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching Trello lists:', error.response?.data || error);
      throw error;
    }
  },

  async getLabelsOnBoard(boardId) {
    try {
      const response = await axios.get(`${TRELLO_BASE_URL}/boards/${boardId}/labels`, {
        params: {
          key: process.env.TRELLO_API_KEY,
          token: process.env.TRELLO_API_TOKEN,
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching Trello labels:', error.response?.data || error);
      throw error;
    }
  },

  async addLabelToCard(cardId, labelId) {
    try {
      const response = await axios.post(`${TRELLO_BASE_URL}/cards/${cardId}/idLabels`, null, {
        params: {
          key: process.env.TRELLO_API_KEY,
          token: process.env.TRELLO_API_TOKEN,
          value: labelId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error adding label to card:', error.response?.data || error);
      throw error;
    }
  }
};

module.exports = TrelloAPI;
