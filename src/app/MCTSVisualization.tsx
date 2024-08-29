import {MCTSSearchTreeNode} from "@/gameAI/MCTS";
import {RectBoardMove} from "@/games/nInARowBoard";
import {RectBoard} from "@/games/rectBoard";
import {useListenerOnWindow, useManualRerender} from "@/utils/hooks";
import {ReactNode} from "react";
import {RectBoardVisualizer} from "@/app/visualize/rectBoardVisualizer";
import {toArray} from "@/utils/utils";
import {GamePiece} from "@/app/gamePiece";

function MCTSNodeVisualization({node}: { node: MCTSSearchTreeNode<RectBoardMove, RectBoard> }): ReactNode {
    return <div className='mcts-node'>
        <div className='mcts-node-board'>
            <RectBoardVisualizer board={node.state} GamePiece={GamePiece}/>
        </div>
        <div className='mcts-node-info'>
            {node.value} / {node.numPlayouts}
        </div>
    </div>;
}

function MCTSRecursiveNodeVisualization({node}: { node: MCTSSearchTreeNode<RectBoardMove, RectBoard> }): ReactNode {
    return <div className='mcts-tree'>
        <MCTSNodeVisualization node={node}/>
        <div className='mcts-tree-recurse' style={{display: 'flex'}}>
            {toArray(node.childNodes).map((node, i) => <MCTSRecursiveNodeVisualization node={node} key={i}/>)}
        </div>
    </div>;
}


export function MCTSVisualization({tree}: { tree: MCTSSearchTreeNode<RectBoardMove, RectBoard> }) {
    const a = useManualRerender();
    useListenerOnWindow(window, 'keydown', e => {
        a();
    })
    console.log('rerender');

    return <MCTSRecursiveNodeVisualization node={tree}/>;
}