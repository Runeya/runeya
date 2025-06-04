/* eslint-disable max-classes-per-file */
const { v4 } = require('uuid');

/** @param {import('@runeya/common-typings').Runeya} runeya */
const ToolboxKanban = (runeya) => {
  
  function getSave() {
    return runeya.getSave('kanban.json', {
      boards: [],
      columns: [],
      cards: [],
    }, {
      afterGet(data) {
        if (!data.boards) data.boards = [];
        if (!data.columns) data.columns = [];
        if (!data.cards) data.cards = [];
        
        // Add default data on first use
        if (data.boards.length === 0) {
          initializeDefaultData(data);
        }
      },
      beforeSave(data) {
        if (!data.boards) data.boards = [];
        if (!data.columns) data.columns = [];
        if (!data.cards) data.cards = [];
      },
    });
  }

  function initializeDefaultData(data) {
    const defaultBoardId = v4();
    const todoColumnId = v4();
    const inProgressColumnId = v4();
    const doneColumnId = v4();
    
    // Create default board
    data.boards.push({
      id: defaultBoardId,
      name: 'My First Board',
      columnIds: [todoColumnId, inProgressColumnId, doneColumnId]
    });
    
    // Create default columns
    data.columns.push(
      {
        id: todoColumnId,
        name: 'To Do',
        color: '#ef4444',
        boardId: defaultBoardId,
        cardIds: [v4(), v4()]
      },
      {
        id: inProgressColumnId,
        name: 'In Progress',
        color: '#f59e0b',
        boardId: defaultBoardId,
        cardIds: [v4()]
      },
      {
        id: doneColumnId,
        name: 'Done',
        color: '#10b981',
        boardId: defaultBoardId,
        cardIds: [v4()]
      }
    );
    
    // Create default cards
    data.cards.push(
      {
        id: data.columns[0].cardIds[0],
        name: '🎉 Welcome to your Kanban Board!',
        description: 'This is your first card. Click to edit it or drag it to different columns to organize your workflow.',
        boardId: defaultBoardId,
        columnId: todoColumnId,
        createdAt: new Date().toISOString()
      },
      {
        id: data.columns[0].cardIds[1],
        name: '✨ Create your first task',
        description: 'Add your own tasks and organize them using our beautiful drag & drop interface. Each card can have a title and description.',
        boardId: defaultBoardId,
        columnId: todoColumnId,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
      },
      {
        id: data.columns[1].cardIds[0],
        name: '🚀 Working on this feature',
        description: 'Drag cards between columns to track progress. This card is currently in progress!',
        boardId: defaultBoardId,
        columnId: inProgressColumnId,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: data.columns[2].cardIds[0],
        name: '✅ Setup complete!',
        description: 'Great job! Your kanban board is now ready to use. You can create multiple boards and customize columns.',
        boardId: defaultBoardId,
        columnId: doneColumnId,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      }
    );
  }

  class Board {
    constructor(board = {}) {
      this.id = board.id || v4();
      this.name = board.name;
      this.columnIds = board.columnIds || [];
    }

    static all() {
      const { data } = getSave();
      return data.boards.map((b) => (b ? new Board(b) : null)).filter((a) => a);
    }

    static get(id) {
      const { data } = getSave();
      const board = data.boards.find((d) => d?.id === id);
      return board ? new Board(board) : null;
    }

    getColumns() {
      return this.columnIds.map((columnId) => Column.get(columnId)).filter((a) => a);
    }

    delete() {
      const { data, save } = getSave();
      this.getColumns().forEach((c) => c.delete());
      data.boards = data.boards.filter((b) => b?.id !== this.id);
      save();
    }

    getColumn(id) {
      return this.getColumns().find((c) => c?.id === id);
    }

    addColumn(column) {
      const savedColumn = new Column({ ...column, boardId: this.id }).save();
      this.columnIds = [...new Set([...this.columnIds, savedColumn.id])];
      this.save();
      return savedColumn;
    }

    save() {
      const { data, save } = getSave();
      const existing = data.boards.find((b) => b?.id === this.id);
      if (existing) {
        Object.assign(existing, { ...this });
      } else {
        data.boards.push(this);
      }
      save();
      return this;
    }
  }

  class Column {
    constructor(column = {}) {
      this.id = column.id || v4();
      this.name = column.name;
      this.color = column.color;
      this.boardId = column.boardId;
      this.cardIds = column.cardIds || [];
    }

    static get(id) {
      const { data } = getSave();
      const column = data.columns.find((d) => d?.id === id);
      return column ? new Column(column) : null;
    }

    getCards() {
      return this.cardIds.map((cardId) => Card.get(cardId)).filter((a) => a);
    }

    getCard(id) {
      return this.getCards().find((c) => c?.id === id);
    }

    addCard(card) {
      const savedCard = new Card({ ...card, boardId: this.boardId, columnId: this.id }).save();
      this.cardIds = [...new Set([...this.cardIds, savedCard.id])];
      this.save();
      return savedCard;
    }

    delete() {
      const { data, save } = getSave();
      this.getCards().forEach((c) => c.delete());
      data.columns = data.columns.filter((b) => b?.id !== this.id);
      save();
    }

    save() {
      const { data, save } = getSave();
      const existing = data.columns.find((b) => b?.id === this.id);
      if (existing) {
        Object.assign(existing, { ...this });
      } else {
        data.columns.push(this);
      }
      save();
      return this;
    }
  }

  class Card {
    constructor(card = {}) {
      this.id = card.id || v4();
      this.name = card.name;
      this.description = card.description;
      this.boardId = card.boardId;
      this.columnId = card.columnId;
      this.createdAt = card.createdAt || new Date().toISOString();
    }

    static get(id) {
      const { data } = getSave();
      const card = data.cards.find((d) => d?.id === id);
      return card ? new Card(card) : null;
    }

    delete() {
      const { data, save } = getSave();
      data.cards = data.cards.filter((b) => b?.id !== this.id);
      save();
    }

    save() {
      const { data, save } = getSave();
      const existing = data.cards.find((b) => b?.id === this.id);
      if (existing) {
        Object.assign(existing, { ...this });
      } else {
        data.cards.push(this);
      }
      save();
      return this;
    }
  }

  return {
    // Board operations
    getAllBoards: () => {
      return Board.all();
    },
    
    createBoard: (params) => {
      const board = new Board(params).save();
      return board;
    },
    
    deleteBoard: (params) => {
      const { boardId } = params;
      const board = Board.get(boardId);
      if (board) {
        board.delete();
        return board;
      }
      return null;
    },
    
    // Column operations
    getBoardColumns: (params) => {
      const { boardId } = params;
      const board = Board.get(boardId);
      return board ? board.getColumns() : [];
    },
    
    getBoardColumn: (params) => {
      const { boardId, columnId } = params;
      const board = Board.get(boardId);
      return board ? board.getColumn(columnId) : null;
    },
    
    createColumn: (params) => {
      const { boardId, ...columnData } = params;
      const board = Board.get(boardId);
      return board ? board.addColumn(columnData) : null;
    },
    
    updateColumn: (params) => {
      const { boardId, columnId, ...columnData } = params;
      const board = Board.get(boardId);
      const column = board ? board.getColumn(columnId) : null;
      if (column) {
        Object.assign(column, columnData);
        return column.save();
      }
      return null;
    },
    
    deleteColumn: (params) => {
      const { boardId, columnId } = params;
      const board = Board.get(boardId);
      const column = board ? board.getColumn(columnId) : null;
      if (column) {
        column.delete();
        return column;
      }
      return null;
    },
    
    // Card operations
    getColumnCards: (params) => {
      const { boardId, columnId } = params;
      const board = Board.get(boardId);
      const column = board ? board.getColumn(columnId) : null;
      return column ? column.getCards() : [];
    },
    
    createCard: (params) => {
      const { boardId, columnId, ...cardData } = params;
      const board = Board.get(boardId);
      const column = board ? board.getColumn(columnId) : null;
      return column ? column.addCard(cardData) : null;
    },
    
    deleteCard: (params) => {
      const { boardId, columnId, cardId } = params;
      const board = Board.get(boardId);
      const column = board ? board.getColumn(columnId) : null;
      const card = column ? column.getCard(cardId) : null;
      if (card) {
        card.delete();
        return card;
      }
      return null;
    },

    updateCard: (params) => {
      const { boardId, columnId, cardId, ...cardData } = params;
      const board = Board.get(boardId);
      const column = board ? board.getColumn(columnId) : null;
      const card = column ? column.getCard(cardId) : null;
      if (card) {
        Object.assign(card, cardData);
        return card.save();
      }
      return null;
    },

    moveCard: (params) => {
      const { cardId, fromColumnId, toColumnId, boardId, newIndex } = params;
      const board = Board.get(boardId);
      if (!board) return null;

      const fromColumn = board.getColumn(fromColumnId);
      const toColumn = board.getColumn(toColumnId);
      if (!fromColumn || !toColumn) return null;

      const card = fromColumn.getCard(cardId);
      if (!card) return null;

      // Remove card from source column
      fromColumn.cardIds = fromColumn.cardIds.filter(id => id !== cardId);
      fromColumn.save();

      // Update card's column
      card.columnId = toColumnId;
      card.save();

      // Add card to destination column at specified index
      if (newIndex !== undefined) {
        toColumn.cardIds.splice(newIndex, 0, cardId);
      } else {
        toColumn.cardIds.push(cardId);
      }
      toColumn.save();

      return { card, fromColumn, toColumn };
    },

    updateBoard: (params) => {
      const { boardId, ...boardData } = params;
      const board = Board.get(boardId);
      if (board) {
        Object.assign(board, boardData);
        return board.save();
      }
      return null;
    },
  };
};

module.exports = ToolboxKanban;
