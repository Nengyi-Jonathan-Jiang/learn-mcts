import {MoveValueMap, Policy, State, StateHeuristic, UniformPolicy} from "@/gameAI/gameAI";
import {chooseRandom, chooseRandomWeighted, maximize} from "@/utils/utils";
import {SMap, SSet} from "@/utils/FMap";

export class MCTSSearchTreeNode<Move_t, State_t extends State<Move_t>> {
    public numPlayouts: number;
    public value: number;
    public readonly state: State_t;
    public readonly parentNode: this | null;
    public readonly parentMove: Move_t | null;

    private readonly _unexploredMoves: Set<Move_t>;
    private readonly _childNodes: Map<Move_t, this> = new SMap;

    constructor(
        state: State_t,
        parentNode: MCTSSearchTreeNode<Move_t, State_t> | null = null,
        parentMove: Move_t | null = null,
        numPlayouts: number = 0,
        value: number = 0
    ) {
        this.state = state;
        this.parentNode = parentNode as this;
        this.parentMove = parentMove;
        this.numPlayouts = numPlayouts;
        this.value = value;
        this._unexploredMoves = new SSet(state.validMoves);
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

    get expectedValue(): number {
        return this.value / this.numPlayouts;
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
    getStateValue(state: State_t, player: number): number {
        while (state.winner === null && state.validMoves.length > 0) {
            const move = chooseRandom(state.validMoves);
            state = state.on(move);
        }

        const winner = state.winner;

        return winner == player ? 1 : winner === null ? 0.5 : 0;
    }
}

let f : () => void = () => {};
requestAnimationFrame(function frame() {
    f();
    requestAnimationFrame(frame);
})

export class MCTSPolicy<Move_t, State_t extends State<Move_t>> implements Policy<Move_t, State_t> {
    private static readonly EXPLORATION_CONSTANT: number = 1.414;

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

        const nextNode = maximize(node.childNodes, (child) => {
            if (child.numPlayouts == 0) {
                return Number.POSITIVE_INFINITY;
            }

            const exploitation = child.expectedValue;
            const exploration = Math.sqrt(Math.log(node.numPlayouts) / child.numPlayouts);

            return exploitation + MCTSPolicy.EXPLORATION_CONSTANT * exploration;
        });

        if(!nextNode) {
            return node;
        }

        return this.selectLeaf(nextNode);
    }

    getPolicy(state: State_t, player: number): MoveValueMap<Move_t> {
        const root = new MCTSSearchTreeNode<Move_t, State_t>(state);
        this.tree = root;

        // for (let i = 0; i < this.numRounds; i++) {
        //     this.doStep(root, player);
        // }
        f = () => this.doStep(root, player);

        // Return the value map
        return {
            getMoveValue(move: Move_t): number {
                return root.getChildForMove(move)?.expectedValue ?? Number.NEGATIVE_INFINITY;
            }
        }
    }

    private doStep(root: MCTSSearchTreeNode<Move_t, State_t>, player: number) {
        // console.log('Selecting leaf')

        // Apply a single round
        const leaf = this.selectLeaf(root);

        // console.log('Selecting Move')

        // Choose an action to apply in the state
        const moves_policy = this.expansionPolicy.getPolicy(leaf.state, player);
        const moves = [...leaf.unexploredMoves];

        if (moves.length === 0) {
            return;
        }

        const weights = moves.map(moves_policy.getMoveValue.bind(moves_policy));
        const chosen_move = chooseRandomWeighted(moves, weights);

        // console.log('Expanding move')

        const newNode = leaf.expandMove(chosen_move);

        // console.log('Evaluating heuristic')

        // Apply the heuristic to the new node
        const value = this.heuristic.getStateValue(newNode.state, player);


        // console.log('Backpropagating value');

        // Backpropagate the value
        let node: MCTSSearchTreeNode<Move_t, State_t> | null = newNode;
        while (node != null) {
            node.numPlayouts++;
            node.value += value;
            node = node.parentNode;
        }
    }
}