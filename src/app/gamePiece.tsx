import {ReactNode} from "react";

export function GamePiece({player}: { player: number | null }): ReactNode {
    return player === null ? null : <div className='board-game-piece' data-player={player}/>
}