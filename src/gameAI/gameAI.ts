export interface State<Move_t> {
    readonly validMoves: Move_t[];
    readonly isGameFinished: boolean;

    readonly currentPlayer: number;

    applyMove(move: Move_t): this;
}

export interface MoveValueMap<Move_t> {
    getMoveValue(move: Move_t): number;
}

export interface Policy<Move_t, State_t extends State<Move_t>> {
    getPolicy(state: State_t, player: number): MoveValueMap<Move_t>;
}