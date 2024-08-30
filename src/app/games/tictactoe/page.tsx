"use client"

import "../shared.css";
import { BasicGamePage } from "../BasicGame";
import { TicTacToeState } from "@/games/tictactoe/tictactoe";

export default function TicTacToeGame() {
    return <BasicGamePage createState={() => new TicTacToeState} />
}
