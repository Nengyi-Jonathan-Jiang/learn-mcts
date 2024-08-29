import {MoveValueMap, Policy, State, StateHeuristic, UniformPolicy, ValueMap} from "@/gameAI/gameAI";
import {chooseRandom, chooseRandomWeighted, maximize, toArray} from "@/utils/utils";
import {SMap, SSet} from "@/utils/FMap";

export class MCTSSearchTreeNode<Move_t, State_t extends State<Move_t>> {
    public numPlayouts: number;
    public values: ValueMap;
    public readonly state: State_t;
    public readonly parentNode: this | null;
    public readonly parentMove: Move_t | null;

    private readonly _unexploredMoves: Set<Move_t>;
    private readonly _childNodes: Map<Move_t, this> = new SMap;

    constructor(
        state: State_t,
        parentNode: MCTSSearchTreeNode<Move_t, State_t> | null = null,
        parentMove: Move_t | null = null,
        numPlayouts: number = 0
    ) {
        this.state = state;
        this.parentNode = parentNode as this;
        this.parentMove = parentMove;
        this.numPlayouts = numPlayouts;
        this.values = new Map;
        this._unexploredMoves = state.winner !== null ? new SSet : new SSet(state.validMoves);
    }

    get unexploredMoves(): ReadonlySet<Move_t> {
        return this._unexploredMoves;
    }

    get isFullyExpanded(): boolean {
        return this._unexploredMoves.size == 0;
    }

    get childNodes(): IterableIterator<this> {
        return this._childNodes.values();
    }

    getExpectedValueForPlayer(player: number): number {
        return (this.values.get(player) ?? 0) / this.numPlayouts;
    }

    addValueMeasurement(measurement: ValueMap) {
        for(const [player, value] of measurement) {
            if(!this.values.has(player)) this.values.set(player, 0);
            this.values.set(player, (this.values.get(player) as number) + value);
        }
    }

    get UCBValue() : number {
        if(!this.parentNode) {
            return 0;
        }

        if (this.numPlayouts == 0) {
            return Number.POSITIVE_INFINITY;
        }

        const exploitation = this.getExpectedValueForPlayer(this.parentNode.state.currentPlayer);
        const exploration = Math.sqrt(Math.log(this.parentNode.numPlayouts) / this.numPlayouts);

        return exploitation + MCTSPolicy.EXPLORATION_CONSTANT * exploration;
    }

    getChildForMove(move: Move_t) {
        return this._childNodes.get(move);
    }

    expandMove(move: Move_t): this {
        if (!this.unexploredMoves.has(move)) {
            const cause = this._childNodes.has(move)
                ? 'child already expanded'
                : 'invalid move on state';
            throw new Error(`Invalid move to expand: ${cause}`);
        }
        const newState = this.state.on(move);

        const newNode = new MCTSSearchTreeNode(newState, this, move) as this;

        this._unexploredMoves.delete(move);
        this._childNodes.set(move, newNode);

        return newNode;
    }
}

export class RandomPlayoutHeuristic<Move_t, State_t extends State<Move_t>> implements StateHeuristic<Move_t, State_t> {
    getStateValue(state: State_t): Map<number, number> {
        const num_playouts = 20;

        const value: ValueMap = new Map
        
        for(let i = 0; i < num_playouts; i++) {
            let s = state;
            while (s.winner === null && s.validMoves.length > 0) {
                const move = chooseRandom(s.validMoves);
                s = s.on(move);
            }

            const winner = s.winner;

            if(winner !== null) {
                value.set(winner, (value.get(winner) ?? 0) + 1)
                value.set(1 - winner, (value.get(1 - winner) ?? 0) - 1)
            }
        }
        return new Map(toArray(value.entries()).map(([p, v]) => [p, v / num_playouts]));
    }
}

export class MCTSPolicy<Move_t, State_t extends State<Move_t>> implements Policy<Move_t, State_t> {
    public static readonly EXPLORATION_CONSTANT: number = 0.414;

    private readonly numRounds: number;
    private readonly expansionPolicy: Policy<Move_t, State_t>;
    private readonly heuristic: StateHeuristic<Move_t, State_t>;

    public tree: MCTSSearchTreeNode<Move_t, State_t> | null = null;

    constructor(
        numRounds: number,
        heuristic?: StateHeuristic<Move_t, State_t>,
        expansionPolicy?: Policy<Move_t, State_t>
    ) {
        this.numRounds = numRounds;
        this.heuristic = heuristic ?? new RandomPlayoutHeuristic;
        this.expansionPolicy = expansionPolicy ?? new UniformPolicy;
    }

    selectLeaf(node: MCTSSearchTreeNode<Move_t, State_t>): MCTSSearchTreeNode<Move_t, State_t> {
        if (!node.isFullyExpanded) {
            return node;
        }

        const nextNode = maximize(node.childNodes, child => child.UCBValue);

        if(!nextNode) {
            return node;
        }

        return this.selectLeaf(nextNode);
    }

    getPolicy(state: State_t, player: number): MoveValueMap<Move_t> {
        const root = this.tree = new MCTSSearchTreeNode<Move_t, State_t>(state);
        
        for (let i = 0; i < this.numRounds; i++) {
            this.doStep();
        }

        // Return the value map
        return {
            getMoveValue(move: Move_t): number {
                return root.getChildForMove(move)?.getExpectedValueForPlayer(player) ?? NaN;
            }
        }
    }

    doStep() {
        if(this.tree === null) {
            return;
        }

        // Apply a single round
        const leaf = this.selectLeaf(this.tree);

        // Choose an action to apply in the state
        const moves_policy = this.expansionPolicy.getPolicy(leaf.state, leaf.state.currentPlayer);
        const moves = [...leaf.unexploredMoves];

        if (moves.length === 0) {
            return;
        }

        const weights = moves.map(moves_policy.getMoveValue.bind(moves_policy));
        const chosen_move = chooseRandomWeighted(moves, weights);

        const newNode = leaf.expandMove(chosen_move);

        // Apply the heuristic to the new node
        const value = this.heuristic.getStateValue(newNode.state);

        // Backpropagate the value
        let node: MCTSSearchTreeNode<Move_t, State_t> | null = newNode;
        while (node != null) {
            node.numPlayouts++;
            node.addValueMeasurement(value);
            node = node.parentNode;
        }
    }
}