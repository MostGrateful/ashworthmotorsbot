const fetch = require('node-fetch');

const TRELLO_API_BASE = 'https://api.trello.com/1';
const { TRELLO_KEY, TRELLO_TOKEN } = process.env;

const TrelloAPI = {
  async getListsOnBoard(boardId) {
    const res = await fetch(`${TRELLO_API_BASE}/boards/${boardId}/lists?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`);
    return res.json();
  },

  async getLabelsOnBoard(boardId) {
    const res = await fetch(`${TRELLO_API_BASE}/boards/${boardId}/labels?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`);
    return res.json();
  },

  async createCard(listId, name, desc) {
    const res = await fetch(`${TRELLO_API_BASE}/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idList: listId,
        name,
        desc
      }),
    });
    return res.json();
  },

  async addLabelToCard(cardId, labelId) {
    const res = await fetch(`${TRELLO_API_BASE}/cards/${cardId}/idLabels?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: labelId }),
    });
    return res.json();
  }
};

module.exports = TrelloAPI;
