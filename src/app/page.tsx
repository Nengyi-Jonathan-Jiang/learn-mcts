"use client"

import {ReactNode, useMemo, useRef, useState} from "react";
import {RectBoardVisualizer} from "@/app/visualize/rectBoardVisualizer";

import "./page.css"
import {RectBoard} from "@/games/rectBoard";
import {TicTacToeState} from "@/games/tictactoe/tictactoe";
import {MCTSPolicy} from "@/gameAI/MCTS";
import {NInARowBoard, RectBoardMove} from "@/games/nInARowBoard";
import {MCTSVisualization} from "@/app/MCTSVisualization";
import {GamePiece} from "@/app/gamePiece";
import { useManualRerender } from "@/utils/hooks";
import { GomokuState } from "@/games/gomoku/gomoku";
import { ValueMap } from "@/gameAI/gameAI";
import { useAnimation } from "@/utils/useAnimation";

function createState() {
    return new GomokuState()
}

export default function Home() {
    const rerender = useManualRerender();

    const [gameState, setGameState] = useState<NInARowBoard>(() => {
        return createState();
    })

    const [MCTS] = useState(() => {

        const SCORING_MAP = new Map([
            //Guaranteed win for computer immediately
            ["OOOOO", 1000000000], 
            //Guaranteed win for player in 1 moves
            ["XXXX_", -100000000], ["XXX_X", -100000000], ["XX_XX", -100000000], ["X_XXX", -100000000], ["_XXXX", -100000000], 
            //Guaranteed win for computer in 2 moves
            ["_OOOO_", 20000000], 
            //Possible win for computer in 2 moves
            ["OOOO_", 10000000], ["OOO_O", 10000000], ["OO_OO", 10000000], ["O_OOO", 10000000], ["_OOOO", 10000000], 
            //Possible win for player in 3 moves
            ["_XXX__", -1000000], ["__XXX_", -1000000], ["_XX_X_", -1000000], ["_X_XX_", -1000000], ["_XXX_", -500000], 
            //Possible win for computer in 4 moves
            ["_OOO__", 100000], ["__OOO_", 100000], ["_OO_O_", 100000], ["_O_OO_", 100000], ["_OOO_", 50000], 
            //Good moves for computer
            ["__OO__", 1200], ["_OO__", 1000], ["__OO_", 1000], ["XXO_", 500], ["_OXX", 500],
             //Barely disadvantageous situations for computer
            ["__XX_", -1100], ["_XX__", -1100], ["OXO", -100], 
            //Don't go in random places;
            ["OX", 1], ["XO", 1]
        ]);

        return new MCTSPolicy<RectBoardMove, NInARowBoard>(1000, {
            getStateValue(state: NInARowBoard): ValueMap {
                const res: ValueMap = new Map;
                for(const player of [0, 1]) {
                    let value = 0;

                    for(const run of state.allRuns) {
                        const s = run.map(i => i === null ? '_' : i === player ? 'O' : 'X').join('');
                        for(const [pattern, v] of SCORING_MAP) {
                            for(let i = 0; i < s.length; i++) {
                                if(s.substring(i).startsWith(pattern)) {
                                    value += v;
                                }
                            }
                        }
                    }
                    
                    res.set(player, Math.log(Math.abs(value) + 1) * Math.sign(value) / 21);
                }
                return res;
            }
        });
    });


    useAnimation(() => MCTS.tree && MCTS.doStep());

    const winner = gameState.winner;

    const onClickCell = winner === null ? (x: number, y: number) => {
        if(gameState.validMoves.length === 0) {
            setGameState(createState());
        }
        else if (!gameState.isMoveValid([x, y])) return;

        let nextState = gameState.on([x, y]);
        
        setGameState(nextState);
    } : () => {
        setGameState(createState());
    };

    let policy = MCTS.getPolicy(gameState, gameState.currentPlayer);

    const GamePieceWithAnalysis = useMemo(() => {
        return function GamePieceWithAnalysis({player, x, y}: { player: number | null, x: number, y : number }): ReactNode {
            
            const moveValue = policy.getMoveValue([x, y]);
            const display = isNaN(moveValue) ? null : moveValue.toFixed(2); 

            return player === null ? 
                <div className='board-game-piece empty' data-player={''}>{display}</div> : 
                <div className='board-game-piece' data-player={player}></div>
        }
    }, [])

    return <main>
        <div id="main-board">
            <RectBoardVisualizer board={gameState} onClickCell={onClickCell} GamePiece={GamePieceWithAnalysis}/>
        </div>
        {/* {
            MCTS.tree === null ? null : 
            <MCTSVisualization tree={MCTS.tree}/>
        } */}
        {
            winner === null ? null : <span className='winner-text'>{`Winner: ${gameState.winner}`}</span>
        }
    </main>
}
