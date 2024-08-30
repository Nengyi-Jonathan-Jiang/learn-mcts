"use client";
import { RectBoard } from "@/games/rectBoard";
import { ReactNode, useState } from "react";
import { GamePiece } from "../gamePiece";
import { RectBoardVisualizer } from "../visualize/rectBoardVisualizer";


export function BasicGamePage<T extends RectBoard = RectBoard>({ createState, Top, Bottom }: { 
    createState: () => T,
    Top?: ({state}: {state: T}) => ReactNode,
    Bottom?: ({state}: {state: T}) => ReactNode, 
}) {
    const [gameState, setGameState] = useState<T>(() => {
        return createState();
    });

    const winner = gameState.winner;

    const onClickCell = winner === null ? (x: number, y: number) => {
        if (gameState.validMoves.length === 0) {
            setGameState(createState());
            return;
        }
        else if (!gameState.isMoveValid([x, y])) return;

        setGameState(gameState.on([x, y]));
    } : () => {
        setGameState(createState());
    };

    return <main>
        <div id="main-board">
            {Top ? <div id="top"><Top state={gameState}/></div> : null}
            <RectBoardVisualizer board={gameState} onClickCell={onClickCell} GamePiece={GamePiece} />
            {Bottom ? <div id="bottom"><Bottom state={gameState}/></div> : null}
        </div>
        {winner === null ? null : <span className='winner-text'>{`Winner: ${gameState.winner == 0 ? 'Black' : 'White'}`}</span>}
    </main>;
}
