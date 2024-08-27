import {Policy, MoveValueMap, State} from "@/gameAI/gameAI";

class MCTSSearchTreeNode {
    numPlayouts: number;
    value: number;

    constructor(numPlayouts: number, value: number) {
        this.numPlayouts = numPlayouts;
        this.value = value;
    }
}

class MCTSPolicy<Move_t, State_t extends State<Move_t>> implements Policy<Move_t, State_t> {
    private readonly numRounds: number;
    constructor(numRounds: number) {
        this.numRounds = numRounds;
    }



    getPolicy(state: State_t, player: number): MoveValueMap<Move_t> {


        throw new Error("Method not implemented.");
    }
}