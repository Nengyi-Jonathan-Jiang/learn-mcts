import {ReactNode} from "react";
import {createArray} from "@/utils/utils";

import "./rectBoardVisualizer.css"
import {RectBoard} from "@/games/rectBoard";

export function RectBoardVisualizer(
    {
        board,
        containerClassName,
        onClickCell = () => void 0,
        GamePiece = (props) => <div className='default-rect-game-piece' data-player={props.player ?? '_'}/>
    }: {
        board: RectBoard,
        onClickCell?: (x: number, y: number) => void,
        containerClassName?: string,
        GamePiece?: ({player, x, y}: { player: number | null, x: number, y: number }) => ReactNode
    }
): ReactNode {
    return <div className={`rect-board ${containerClassName ?? ''}`.trim()}>
        {createArray(board.height, y =>
            <div className='rect-board-row'
                 data-is-first={y === 0 ? '' : undefined}
                 data-is-last={y === board.height - 1 ? '' : undefined}
                 key={y}
            >
                {createArray(board.width, x =>
                    <div className='rect-board-cell'
                         data-is-first={x === 0 ? '' : undefined}
                         data-is-last={x === board.width - 1 ? '' : undefined}
                         key={x}
                         onClick={() => onClickCell(x, y)}
                    >
                        <GamePiece player={board.getPieceAt(x, y)} x={x} y={y}/>
                    </div>
                )}
            </div>
        )}
    </div>
}