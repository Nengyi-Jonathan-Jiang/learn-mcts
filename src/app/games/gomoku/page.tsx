"use client"

import "../shared.css";
import { BasicGamePage } from "../BasicGame";
import { GomokuState } from "@/games/gomoku/gomoku";

export default function GomokuGame() {
    return <BasicGamePage createState={() => new GomokuState} />
}
