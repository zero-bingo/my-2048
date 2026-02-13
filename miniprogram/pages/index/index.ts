Page({
  data: {
    board: [] as Board,
    score: 0,
    gameOver: false,
    gameWin: false,
  },
  startX: 0,
  startY: 0,

  onLoad() {
    this.initGame();
  },

  initGame() {
    const board = Array(4).fill(null).map(() => Array(4).fill(0));
    this.addRandomTile(board);
    this.addRandomTile(board);
    this.setData({ board, score: 0, gameOver: false, gameWin: false });
  },

  addRandomTile(board: Board) {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) emptyCells.push([i, j]);
      }
    }
    if (emptyCells.length > 0) {
      const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  },

  move(direction: 'left' | 'right' | 'up' | 'down') {
    if (this.data.gameOver || this.data.gameWin) return;

    let board = JSON.parse(JSON.stringify(this.data.board)) as Board;
    let score = this.data.score;
    let moved = false;

    const transpose = (m: Board): Board => m[0].map((_, i) => m.map(x => x[i]));
    const reverse = (m: Board): Board => m.map(row => [...row].reverse());

    switch (direction) {
      case 'left':
        [board, moved, score] = this.slide(board, score);
        break;
      case 'right':
        board = reverse(board);
        [board, moved, score] = this.slide(board, score);
        board = reverse(board);
        break;
      case 'up':
        board = transpose(board);
        [board, moved, score] = this.slide(board, score);
        board = transpose(board);
        break;
      case 'down':
        board = transpose(board);
        board = reverse(board);
        [board, moved, score] = this.slide(board, score);
        board = reverse(board);
        board = transpose(board);
        break;
    }

    if (moved) {
      this.addRandomTile(board);
      this.setData({ board, score });

      if (!this.data.gameWin && board.some(row => row.includes(2048))) {
        this.setData({ gameWin: true });
      }

      if (this.isGameOver(board)) {
        this.setData({ gameOver: true });
      }
    }
  },

  slide(matrix: Board, score: number): [Board, boolean, number] {
    const newMatrix = matrix.map(row => {
      const filtered = row.filter(val => val !== 0);
      const merged: number[] = [];
      let i = 0;
      while (i < filtered.length) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const newVal = filtered[i] * 2;
          merged.push(newVal);
          score += newVal;
          i += 2;
        } else {
          merged.push(filtered[i]);
          i++;
        }
      }
      while (merged.length < 4) merged.push(0);
      return merged;
    });

    let moved = false;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (matrix[i][j] !== newMatrix[i][j]) {
          moved = true;
          break;
        }
      }
    }

    return [newMatrix, moved, score];
  },

  isGameOver(board: Board): boolean {
    // 是否有空格
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return false;
      }
    }
    // 是否能合并
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const val = board[i][j];
        if (
          (i < 3 && board[i + 1][j] === val) ||
          (j < 3 && board[i][j + 1] === val)
        ) {
          return false;
        }
      }
    }
    return true;
  },

  onLeft() { this.move('left'); },
  onRight() { this.move('right'); },
  onUp() { this.move('up'); },
  onDown() { this.move('down'); },

  onTouchStart(e: WechatMiniprogram.TouchEvent) {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  },
  onTouchMove(e: WechatMiniprogram.TouchEvent) {},
  onTouchEnd(e: WechatMiniprogram.TouchEvent) {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    // 判断滑动方向
    const dx = endX - this.startX;
    const dy = endY - this.startY;

    if (Math.abs(dx) > Math.abs(dy)) {
      // 横向滑动
      if (dx > 0) this.move('right');
      else this.move('left');
    } else {
      // 纵向滑动
      if (dy > 0) this.move('down');
      else this.move('up');
    }
  },

  restart() {
    this.initGame();
  },
});

// 类型定义
type Board = number[][];

interface IAppOption {
  userInfo?: WechatMiniprogram.UserInfo;
}