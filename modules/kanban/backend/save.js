const kanban = {
  /** @param {import('@runeya/common-typings').Runeya} runeya */
  getSave(runeya) {
    return runeya.getSave('kanban.json', {
      /** @type {Partial<import('@runeya/common-typings').NonFunctionProperties<import('./Kanban').BoardType>['prototype']>[]} */
      boards: [],
      /** @type {Partial<import('@runeya/common-typings').NonFunctionProperties<import('./Kanban').ColumnType>['prototype']>[]} */
      columns: [],
      /** @type {Partial<import('@runeya/common-typings').NonFunctionProperties<import('./Kanban').CardType>['prototype']>[]} */
      cards: [],
    }, {
      afterGet(data) {
        if (!data.boards) data.boards = [];
        if (!data.columns) data.columns = [];
        if (!data.cards) data.cards = [];
      },
      beforeSave(data) {
        if (!data.boards) data.boards = [];
        if (!data.columns) data.columns = [];
        if (!data.cards) data.cards = [];
      },
    });
  },
};
module.exports = kanban;
