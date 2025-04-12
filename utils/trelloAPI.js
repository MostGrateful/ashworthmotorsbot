require('dotenv').config();
const fetch = require('node-fetch');

const baseURL = 'https://api.trello.com/1';

const TrelloAPI = {
  async createCard(listId, name, desc, labelId) {
    const url = `${baseURL}/cards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idList: listId,
        name,
        desc,
        idLabels: [labelId],
      }),
    });

    if (!res.ok) throw new Error(`Failed to create Trello card: ${res.status}`);
    return res.json();
  },

  async getLists(boardId) {
    const url = `${baseURL}/boards/${boardId}/lists?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch lists: ${res.status}`);
    return res.json();
  },

  async getLabels(boardId) {
    const url = `${baseURL}/boards/${boardId}/labels?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch labels: ${res.status}`);
    return res.json();
  },
};

module.exports = TrelloAPI;

