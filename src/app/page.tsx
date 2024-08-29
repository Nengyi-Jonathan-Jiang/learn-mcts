"use client"

import {useState} from "react";
import {RectBoardVisualizer} from "@/app/visualize/rectBoardVisualizer";

import "./page.css"
import {RectBoard} from "@/games/rectBoard";
import {TicTacToeState} from "@/games/tictactoe/tictactoe";
import {MCTSPolicy} from "@/gameAI/MCTS";
import {RectBoardMove} from "@/games/nInARowBoard";
import {MCTSVisualization} from "@/app/MCTSVisualization";
import {GamePiece} from "@/app/gamePiece";

function createState() {
    return new TicTacToeState()
}

export default function Home() {
    const [gameState, setGameState] = useState<RectBoard>(() => {
        return createState();
    })

    const [MCTS] = useState(() => new MCTSPolicy<RectBoardMove, RectBoard>(20));

    const winner = gameState.winner;

    const onClickCell = winner === null ? (x: number, y: number) => {
        if (gameState.isMoveValid([x, y])) {
            let nextGameState = gameState.on([x, y]);

            MCTS.getPolicy(nextGameState, nextGameState.currentPlayer);

            setGameState(nextGameState);
        }
    } : () => {
        setGameState(createState());
    };

    return <main>
        <div id="main-board">
            <RectBoardVisualizer board={gameState} onClickCell={onClickCell} GamePiece={GamePiece}/>
        </div>
        {
            MCTS.tree !== null ? <MCTSVisualization tree={MCTS.tree}/> : null
        }
        {
            winner === null ? null : <span className='winner-text'>{`Winner: ${gameState.winner}`}</span>
        }
    </main>
}
