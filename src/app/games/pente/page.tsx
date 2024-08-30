"use client"

import "../shared.css";
import "./pente.css";
import { BasicGamePage } from "../BasicGame";
import { TicTacToeState } from "@/games/tictactoe/tictactoe";
import { PenteState } from "@/games/pente/pente";
import { createArray } from "@/utils/utils";
import { GamePiece } from "@/app/gamePiece";

export default function PenteGame() {
    return <BasicGamePage createState={() => new PenteState} Top={({state}) => {
        return [
            ...createArray(state.blackCaptures, () => <GamePiece player={1}/>),
            <span id="divider"/>,
            ...createArray(state.whiteCaptures, () => <GamePiece player={0}/>),
        ];
    }}/>
}
