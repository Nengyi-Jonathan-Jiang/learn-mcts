"use client"

import {ReactNode, useMemo, useRef} from "react";

import "./shared.css"

export default function Games() {
    return <main>
        <a href="./games/gomoku">Gomoku</a> <br/>
        <a href="./games/tictactoe">Tic Tac Toe</a> <br/>
        <a href="./games/pente">Pente</a> <br/>
    </main>
}
