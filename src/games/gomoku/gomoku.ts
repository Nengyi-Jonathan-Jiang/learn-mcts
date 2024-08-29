import {State} from "@/gameAI/gameAI";
import {NInARowBoard, RectBoardMove} from "@/games/nInARowBoard";
import {RectBoard} from "@/games/rectBoard";

const BOARD_SIZE = 11;

export class GomokuState extends NInARowBoard {
    public readonly currentPlayer: number;

    constructor(currentPlayer?: number, board?: (number | null)[][]) {
        super(board ?? RectBoard.createEmptyBoard(BOARD_SIZE, BOARD_SIZE), BOARD_SIZE, BOARD_SIZE, 5);
        this.currentPlayer = currentPlayer ?? 0;
    }

    on([x, y]: RectBoardMove): this {
        const s = new GomokuState(1 - this.currentPlayer, this.board);
        s.playPieceAt(x, y, this.currentPlayer);
        return s as this;
    }
}