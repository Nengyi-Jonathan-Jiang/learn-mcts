import {Policy, MoveValueMap, State, UniformPolicy, StateHeuristic} from "@/gameAI/gameAI";
import { chooseRandomWeighted, maximize } from "@/utils/utils";

class MCTSSearchTreeNode<Move_t, State_t extends State<Move_t>> {
    public numPlayouts: number;
    public value: number;
    public readonly state: State_t;
    public readonly parentNode: this | null;
    public readonly parentMove: Move_t | null;

    private readonly _unexploredMoves : Set<Move_t>;
    private readonly _childNodes: Map<Move_t, this> = new Map; 

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
        this._unexploredMoves = new Set(state.validMoves);
    }

    get unexploredMoves() : ReadonlySet<Move_t> {
        return this.unexploredMoves;
    }

    get isFullyExpanded() : boolean {
        return this._unexploredMoves.size == 0;
    }

    get childNodes() : IterableIterator<this> {
        return this._childNodes.values();
    }

    get expectedValue() : number {
        return this.value / this.numPlayouts;
    }

    expandMove(move: Move_t) : this {
        if(!this.unexploredMoves.has(move)) {
            const cause = this._childNodes.has(move) 
                ? 'child already expanded' 
                : 'invalid move on state';
            throw new Error(`Invalid move to expand: ${cause}`);
        }
        const newState = this.state.applyMove(move);
        
        const newNode = new MCTSSearchTreeNode(newState, this, move) as this;

        this._unexploredMoves.delete(move);
        this._childNodes.set(move, newNode);

        return newNode;
    }
}

export class RandomPlayoutHeuristic<Move_t, State_t extends State<Move_t>> implements StateHeuristic<Move_t, State_t>{
    getStateValue(state: State_t, player: number): number {
        throw new Error("Method not implemented.");
    }
}

export class MCTSPolicy<Move_t, State_t extends State<Move_t>> implements Policy<Move_t, State_t> {
    private static readonly EXPLORATION_CONSTANT : number = 1.414;

    private readonly numRounds: number;
    private readonly expansionPolicy: Policy<Move_t, State_t>;
    private readonly heuristic: StateHeuristic<Move_t, State_t>;

    constructor(
        numRounds: number,
        heuristic?: StateHeuristic<Move_t, State_t>, 
        expansionPolicy?: Policy<Move_t, State_t>
    ) {
        this.numRounds = numRounds;
        this.heuristic = heuristic ?? new RandomPlayoutHeuristic;
        this.expansionPolicy = expansionPolicy ?? new UniformPolicy;
    }

    selectLeaf(node: MCTSSearchTreeNode<Move_t, State_t>) : MCTSSearchTreeNode<Move_t, State_t>  {
        if(!node.isFullyExpanded) {
            return node;
        }
        
        return this.selectLeaf(maximize(node.childNodes, (child) => {
            if(child.numPlayouts == 0) {
                return Number.POSITIVE_INFINITY;
            }

            const exploitation = child.expectedValue;
            const exploration =  Math.sqrt(Math.log(node.numPlayouts) / child.numPlayouts);
            
            return exploitation + MCTSPolicy.EXPLORATION_CONSTANT * exploration;
        }));
    }

    getPolicy(state: State_t, player: number): MoveValueMap<Move_t> {
        const root = new MCTSSearchTreeNode<Move_t, State_t>(state);

        for(let i = 0; i < this.numRounds; i++) {
            // Apply a single round
            const node = this.selectLeaf(root);
            
            // Choose an action to apply in the state
            const moves_policy = this.expansionPolicy.getPolicy(node.state, player);
            const moves = [...node.unexploredMoves];
            const weights = moves.map(moves_policy.getMoveValue.bind(moves_policy));
            const chosen_move = chooseRandomWeighted(moves, weights);

            const newNode = node.expandMove(chosen_move);

            // Apply the heuristic to the new node
            const value = this.heuristic.getStateValue(newNode.state, player);

            // Backpropagate the value
            let backpropNode : MCTSSearchTreeNode<Move_t, State_t> | null = newNode;
            while(backpropNode != null) {
                backpropNode.numPlayouts++;
                backpropNode.value += value;
                backpropNode = newNode.parentNode;
            }
        }


        throw new Error("Method not implemented.");
    }
}