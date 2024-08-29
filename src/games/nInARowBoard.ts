import {createArray} from "@/utils/utils";
import {RectBoard} from "@/games/rectBoard";

export type RectBoardMove = readonly [number, number];

export abstract class NInARowBoard extends RectBoard {
    public readonly N: number;

    protected constructor(board: (number | null)[][], width: number, height: number, N: number) {
        super(board, width, height);
        this.N = N;
    }

    private getDiagonals(direction: boolean): (number | null)[][] {
        const diagonals = createArray<(number | null)[]>(this.width + this.height - 1, () => []);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const possiblyReversedY = direction ? this.height - y - 1 : y;
                const piece = this.getPieceAt(x, possiblyReversedY);
                diagonals[x + y].push(piece);
            }
        }

        return diagonals;
    }

    private getRows(): (number | null)[][] {
        return createArray(this.height, i => createArray(this.width, j => this.board[j][i]));
    }

    private getCols(): (number | null)[][] {
        return this.board.map(col => [...col]);
    }

    public get allRuns(): (number | null)[][] {
        return [...this.getRows(), ...this.getCols(), ...this.getDiagonals(false), ...this.getDiagonals(true)];
    }

    public get winner(): number | null {
        for (const run of this.allRuns) {
            let runPlayer = null;
            let runLength = 0;
            for (const player of run) {
                if (player === null) {
                    runLength = 0;
                }
                else if (player === runPlayer) {
                    runLength += 1;
                }
                else {
                    runLength = 1;
                }

                runPlayer = player;
                if (runLength >= this.N) {
                    return runPlayer;
                }
            }
        }
        return null;
    }


    public abstract currentPlayer: number;

    public abstract on(move: RectBoardMove): this;
}