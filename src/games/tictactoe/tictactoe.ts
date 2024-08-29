import {NInARowBoard, RectBoardMove} from "@/games/nInARowBoard";
import {RectBoard} from "@/games/rectBoard";

export class TicTacToeState extends NInARowBoard {
    public readonly currentPlayer: number;

    constructor(currentPlayer?: number, board?: (number | null)[][]) {
        super(board ?? RectBoard.createEmptyBoard(3, 3), 3, 3, 3);
        this.currentPlayer = currentPlayer ?? 0;
    }

    on([x, y]: RectBoardMove): this {
        const s = new TicTacToeState(1 - this.currentPlayer, this.board);
        s.playPieceAt(x, y, this.currentPlayer);
        return s as this;
    }
}