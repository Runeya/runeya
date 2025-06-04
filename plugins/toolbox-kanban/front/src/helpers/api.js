import args from './args';

const callServer = args.params?.callServer;

export const kanbanApi = {
  // Board operations
  async getAllBoards() {
    return await callServer('getAllBoards');
  },

  async createBoard(name) {
    return await callServer('createBoard', { name });
  },

  async updateBoard(boardId, data) {
    return await callServer('updateBoard', { boardId, ...data });
  },

  async deleteBoard(boardId) {
    return await callServer('deleteBoard', { boardId });
  },

  // Column operations
  async getBoardColumns(boardId) {
    return await callServer('getBoardColumns', { boardId });
  },

  async getBoardColumn(boardId, columnId) {
    return await callServer('getBoardColumn', { boardId, columnId });
  },

  async createColumn(boardId, columnData) {
    return await callServer('createColumn', { boardId, ...columnData });
  },

  async updateColumn(boardId, columnId, data) {
    return await callServer('updateColumn', { boardId, columnId, ...data });
  },

  async deleteColumn(boardId, columnId) {
    return await callServer('deleteColumn', { boardId, columnId });
  },

  // Card operations
  async getColumnCards(boardId, columnId) {
    return await callServer('getColumnCards', { boardId, columnId });
  },

  async createCard(boardId, columnId, cardData) {
    return await callServer('createCard', { boardId, columnId, ...cardData });
  },

  async updateCard(boardId, columnId, cardId, data) {
    return await callServer('updateCard', { boardId, columnId, cardId, ...data });
  },

  async deleteCard(boardId, columnId, cardId) {
    return await callServer('deleteCard', { boardId, columnId, cardId });
  },

  async moveCard(moveData) {
    return await callServer('moveCard', moveData);
  }
}; 