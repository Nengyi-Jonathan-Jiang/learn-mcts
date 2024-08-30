import {State} from "@/gameAI/gameAI";
import {NInARowBoard, RectBoardMove} from "@/games/nInARowBoard";
import {RectBoard} from "@/games/rectBoard";

const BOARD_SIZE = 13;

export class PenteState extends NInARowBoard {
    public readonly currentPlayer: number;
    public blackCaptures: number = 0;
    public whiteCaptures: number = 0;

    constructor(currentPlayer?: number, board?: (number | null)[][]) {
        super(board ?? RectBoard.createEmptyBoard(BOARD_SIZE, BOARD_SIZE), BOARD_SIZE, BOARD_SIZE, 5);
        this.currentPlayer = currentPlayer ?? 0;
    }

    on([x, y]: RectBoardMove): this {
        const s = new PenteState(1 - this.currentPlayer, this.board);
        s.blackCaptures = this.blackCaptures;
        s.whiteCaptures = this.whiteCaptures;
        s.playPieceAt(x, y, this.currentPlayer);
        
        // Check captures
        for(const [dx, dy] of [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]) {
            // Check for capture-ability
            const a = this.getPieceAt(x + dx, y + dy);
            const b = this.getPieceAt(x + 2 * dx, y + 2 * dy);
            const c = this.getPieceAt(x + 3 * dx, y + 3 * dy);
            if(a === 1 - this.currentPlayer && b === 1 - this.currentPlayer && c === this.currentPlayer){
                // Capture
                s.setPieceAt(x + dx, y + dy, null);
                s.setPieceAt(x + dx * 2, y + dy * 2, null);
                if(this.currentPlayer === 0) s.blackCaptures += 2;
                if(this.currentPlayer === 1) s.whiteCaptures += 2;
            }
        }

        return s as this;
    }

    public get winner(): number | null {
        const superWinner = super.winner;
        if(superWinner !== null) {
            return superWinner;
        }
        if(this.blackCaptures >= 10) {
            return 0;
        }
        if(this.whiteCaptures >= 10) {
            return 1;
        }
        return null;
    }
}