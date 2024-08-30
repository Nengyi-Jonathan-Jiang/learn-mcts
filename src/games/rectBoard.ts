import {State} from "@/gameAI/gameAI";
import {createArray} from "@/utils/utils";
import {RectBoardMove} from "@/games/nInARowBoard";

export abstract class RectBoard implements State<RectBoardMove> {
    protected readonly board: (number | null)[][];
    public readonly width: number;
    public readonly height: number;

    protected constructor(board: (number | null)[][], width: number, height: number) {
        this.board = board.map(col => [...col]);
        this.width = width;
        this.height = height;
    }

    protected static createEmptyBoard(width: number, height: number): (number | null)[][] {
        return createArray(width, () => createArray(height, null));
    }

    public isPositionInRange(x: number, y: number) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }

    public getPieceAt(x: number, y: number) {
        return this.board[x]?.[y] ?? null;
    }

    public hasPieceAt(x: number, y: number): boolean {
        return this.board[x][y] !== null;
    }

    public playPieceAt(x: number, y: number, player: number): void {
        this.setPieceAt(x, y, player);
    }

    protected setPieceAt(x: number, y: number, player: number | null): void {
        this.board[x][y] = player;
    }

    public get isEmpty(): boolean {
        for (const col of this.board) for (const cell of col) if (cell !== null) return false;
        return true;
    }

    public get isFull(): boolean {
        for (const col of this.board) for (const cell of col) if (cell === null) return false;
        return true;
    }

    isMoveValid([x, y]: RectBoardMove): boolean {
        return !this.hasPieceAt(x, y);
    }

    public get validMoves(): RectBoardMove[] {
        const res: (readonly [number, number])[] = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.isMoveValid([x, y])) {
                    res.push([x, y] as const);
                }
            }
        }
        return res;
    }

    public abstract winner: number | null;
    public abstract currentPlayer: number;

    public abstract on(move: RectBoardMove): this;
}