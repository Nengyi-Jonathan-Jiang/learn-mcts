import { getRandomValues } from "crypto";

export interface State<Move_t> {
    readonly validMoves: Move_t[];
    readonly winner: number | null;
    readonly currentPlayer: number;

    on(move: Move_t): this;
    isMoveValid(move: Move_t): boolean;
}

export interface MoveValueMap<Move_t> {
    getMoveValue(move: Move_t): number;
}

export interface Policy<Move_t, State_t extends State<Move_t>> {
    getPolicy(state: State_t, player: number): MoveValueMap<Move_t>;
}

export type ValueMap = Map<number, number>;

export interface StateHeuristic<Move_t, State_t extends State<Move_t>> {
    getStateValue(state: State_t) : ValueMap;
}

export class UniformPolicy<Move_t, State_t extends State<Move_t>> implements Policy<Move_t, State_t> {
    getPolicy(state: State_t, player: number): MoveValueMap<Move_t> {
        return {
            getMoveValue(move: Move_t) {
                return 1;
            }
        }
    }
}