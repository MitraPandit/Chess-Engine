var PawnTable = [
    0, 0, 0, 0, 0, 0, 0, 0,
    10, 10, 0, -10, -10, 0, 10, 10,
    5, 0, 0, 5, 5, 0, 0, 5,
    0, 0, 10, 20, 20, 10, 0, 0,
    5, 5, 5, 10, 10, 5, 5, 5,
    10, 10, 10, 20, 20, 10, 10, 10,
    20, 20, 20, 30, 30, 20, 20, 20,
    0, 0, 0, 0, 0, 0, 0, 0
];

var KnightTable = [
    0, -10, 0, 0, 0, 0, -10, 0,
    0, 0, 0, 5, 5, 0, 0, 0,
    0, 0, 10, 10, 10, 10, 0, 0,
    0, 0, 10, 20, 20, 10, 5, 0,
    5, 10, 15, 20, 20, 15, 10, 5,
    5, 10, 10, 20, 20, 10, 10, 5,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
];

var BishopTable = [
    0, 0, -10, 0, 0, -10, 0, 0,
    0, 0, 0, 10, 10, 0, 0, 0,
    0, 0, 10, 15, 15, 10, 0, 0,
    0, 10, 15, 20, 20, 15, 10, 0,
    0, 10, 15, 20, 20, 15, 10, 0,
    0, 0, 10, 15, 15, 10, 0, 0,
    0, 0, 0, 10, 10, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
];

var RookTable = [
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    25, 25, 25, 25, 25, 25, 25, 25,
    0, 0, 5, 10, 10, 5, 0, 0
];

var BishopPair = 40;

function EvalPosition() { // But just material eval is not enough so we use piece table

    var score = GameBoard.material[COLOURS.WHITE] - GameBoard.material[COLOURS.BLACK];
    var endFor;
    var pce;
    var sq;
    var pceNum;

    pce = PIECES.wP;
    endFor = GameBoard.pceNum[pce];
    for (pceNum = 0; pceNum < endFor; ++pceNum) {
        sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
        score += PawnTable[SQ64(sq)];
    }

    pce = PIECES.bP;
    endFor = GameBoard.pceNum[pce];
    for (pceNum = 0; pceNum < endFor; ++pceNum) {
        sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
        score -= PawnTable[MIRROR64(SQ64(sq))];
    }

    pce = PIECES.wN;
    endFor = GameBoard.pceNum[pce];
    for (pceNum = 0; pceNum < endFor; ++pceNum) {
        sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
        score += KnightTable[SQ64(sq)];
    }

    pce = PIECES.bN;
    endFor = GameBoard.pceNum[pce];
    for (pceNum = 0; pceNum < endFor; ++pceNum) {
        sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
        score -= KnightTable[MIRROR64(SQ64(sq))];
    }

    pce = PIECES.wB;
    endFor = GameBoard.pceNum[pce];
    for (pceNum = 0; pceNum < endFor; ++pceNum) {
        sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
        score += BishopTable[SQ64(sq)];
    }

    pce = PIECES.bB;
    endFor = GameBoard.pceNum[pce];
    for (pceNum = 0; pceNum < endFor; ++pceNum) {
        sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
        score -= BishopTable[MIRROR64(SQ64(sq))];
    }

    pce = PIECES.wR;
    endFor = GameBoard.pceNum[pce];
    for (pceNum = 0; pceNum < endFor; ++pceNum) {
        sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
        score += RookTable[SQ64(sq)];
    }

    pce = PIECES.bR;
    endFor = GameBoard.pceNum[pce];
    for (pceNum = 0; pceNum < endFor; ++pceNum) {
        sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
        score -= RookTable[MIRROR64(SQ64(sq))];
    }

    pce = PIECES.wQ;
    endFor = GameBoard.pceNum[pce];
    for (pceNum = 0; pceNum < endFor; ++pceNum) {
        sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
        score += RookTable[SQ64(sq)];
    }

    pce = PIECES.bQ;
    endFor = GameBoard.pceNum[pce];
    for (pceNum = 0; pceNum < endFor; ++pceNum) {
        sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
        score -= RookTable[MIRROR64(SQ64(sq))];
    }

    if (GameBoard.pceNum[PIECES.wB] >= 2) {
        score += BishopPair;
    }

    if (GameBoard.pceNum[PIECES.bB] >= 2) {
        score -= BishopPair;
    }
    if (GameBoard.side == COLOURS.WHITE) {
        return score;
    } else {
        return -score;
    }
    
}