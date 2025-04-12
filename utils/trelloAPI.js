const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const BASE_URL = 'https://api.trello.com/1';
const KEY = process.env.TRELLO_API_KEY;
const TOKEN = process.env.TRELLO_API_TOKEN;

async function getListsOnBoard(boardId) {
  const response = await fetch(`${BASE_URL}/boards/${boardId}/lists?key=${KEY}&token=${TOKEN}`);
  return response.json();
}

async function getLabelsOnBoard(boardId) {
  const response = await fetch(`${BASE_URL}/boards/${boardId}/labels?key=${KEY}&token=${TOKEN}`);
  return response.json();
}

async function createCard(listId, name, desc, due) {
  const response = await fetch(`${BASE_URL}/cards?key=${KEY}&token=${TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idList: listId,
      name,
      desc,
      due,
    }),
  });
  return response.json();
}

async function addLabelToCard(cardId, labelId) {
  await fetch(`${BASE_URL}/cards/${cardId}/idLabels?key=${KEY}&token=${TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: labelId }),
  });
}

module.exports = {
  getListsOnBoard,
  getLabelsOnBoard,
  createCard,
  addLabelToCard,
};
