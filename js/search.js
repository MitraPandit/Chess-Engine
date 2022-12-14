var SearchController = {};

SearchController.nodes; // Number of nodes program visits during search (including non-leaf nodes)
SearchController.fh; // fail high
SearchController.fhf; // fail high first
SearchController.depth;
SearchController.time;
SearchController.start;
SearchController.stop;
SearchController.best; // keep track of last completed best move
SearchController.thinking;

function PickNextMove(MoveNum) {

    var index = 0;
    var bestScore = -1;
    var bestNum = MoveNum;

    for (index = MoveNum; index < GameBoard.moveListStart[GameBoard.ply + 1]; ++index) {
        if (GameBoard.moveScores[index] > bestScore) {
            bestScore = GameBoard.moveScores[index];
            bestNum = index;
        }
    }

    if (bestNum != MoveNum) {
        var temp = 0;
        temp = GameBoard.moveScores[MoveNum];
        GameBoard.moveScores[MoveNum] = GameBoard.moveScores[bestNum];
        GameBoard.moveScores[bestNum] = temp;

        temp = GameBoard.moveList[MoveNum];
        GameBoard.moveList[MoveNum] = GameBoard.moveList[bestNum];
        GameBoard.moveList[bestNum] = temp;
    }

}

function ClearPvTable() {

    for (index = 0; index < PVENTRIES; index++) {
        GameBoard.PvTable[index].move = NOMOVE;
        GameBoard.PvTable[index].posKey = 0;
    }
}

function CheckUp() {
    if ((Date.now() - SearchController.start) > SearchController.time) {
        SearchController.stop = BOOL.TRUE;
    }
}

function IsRepetition() {
    var index = 0;

    for (index = GameBoard.hisPly - GameBoard.fiftyMove; index < GameBoard.hisPly - 1; ++index) {
        if (GameBoard.posKey == GameBoard.history[index].posKey) {
            return BOOL.TRUE;
        }
    }

    return BOOL.FALSE;
}

function Quiescence(alpha, beta) {

    if ((SearchController.nodes & 2047) == 0) {
        CheckUp();
    }

    SearchController.nodes++;

    if ((IsRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply != 0) {
        return 0;
    }

    if (GameBoard.ply > MAXDEPTH - 1) {
        return EvalPosition();
    }

    var Score = EvalPosition();

    if (Score >= beta) {
        return beta;
    }

    if (Score > alpha) {
        alpha = Score;
    }

    GenerateCaptures();

    var MoveNum = 0;
    var Legal = 0;
    var OldAlpha = alpha;
    var BestMove = NOMOVE;
    var Move = NOMOVE;

    for (MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++MoveNum) {

        PickNextMove(MoveNum);

        Move = GameBoard.moveList[MoveNum];

        if (MakeMove(Move) == BOOL.FALSE) {
            continue;
        }
        Legal++;
        Score = -Quiescence(-beta, -alpha);

        TakeMove();

        if (SearchController.stop == BOOL.TRUE) {
            return 0;
        }

        if (Score > alpha) {
            if (Score >= beta) {
                if (Legal == 1) {
                    SearchController.fhf++;
                }
                SearchController.fh++;
                return beta;
            }
            alpha = Score;
            BestMove = Move;
        }
    }

    if (alpha != OldAlpha) {
        StorePvMove(BestMove);
    }

    return alpha;

}

function AlphaBeta(alpha, beta, depth) {

    if (depth <= 0) {
        return Quiescence(alpha, beta); //  basically an evaluation function that takes into account some dynamic possibilities
    }

    if ((SearchController.nodes & 2047) == 0) { // Check time up
        CheckUp();
    }

    SearchController.nodes++;

    if ((IsRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply != 0) {
        return 0;
    }

    if (GameBoard.ply > MAXDEPTH - 1) {
        return EvalPosition();
    }

    var InCheck = SqAttacked(GameBoard.pList[PCEINDEX(Kings[GameBoard.side], 0)], GameBoard.side ^ 1);
    if (InCheck == BOOL.TRUE) {
        depth++;
    }

    var Score = -INFINITE;

    GenerateMoves();

    var MoveNum = 0;
    var Legal = 0;
    var OldAlpha = alpha;
    var BestMove = NOMOVE;
    var Move = NOMOVE;

    /* Get PvMove */

    var PvMove = ProbePvTable();
    if (PvMove != NOMOVE) {
        for (MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++MoveNum) {
            if (GameBoard.moveList[MoveNum] == PvMove) {
                GameBoard.moveScores[MoveNum] = 2000000;
                break;
            }
        }
    }

    /* Order PvMove */

    for (MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; ++MoveNum) {

        PickNextMove(MoveNum);

        Move = GameBoard.moveList[MoveNum];
        if (MakeMove(Move) == BOOL.FALSE) {
            continue;
        }
        Legal++;
        Score = -AlphaBeta(-beta, -alpha, depth - 1);

        TakeMove();

        if (SearchController.stop == BOOL.TRUE) {
            return 0;
        }

        if (Score > alpha) {
            if (Score >= beta) {
                if (Legal == 1) {
                    SearchController.fhf++; //indicates that we got beta cutoff in first move found, better/more pruning of tree
                }
                SearchController.fh++;
                /* Update Killer Moves */ // record of recent 2 moves that caused beta cutoff

                if ((Move & MFLAGCAP) == 0) {
                    GameBoard.searchKillers[MAXDEPTH + GameBoard.ply] =
                        GameBoard.searchKillers[GameBoard.ply];
                    GameBoard.searchKillers[GameBoard.ply] = Move;
                }
                return beta;
            }
            /* Update History Table */

            if ((Move & MFLAGCAP) == 0) {
                GameBoard.searchHistory[GameBoard.pieces[FROMSQ(Move)] * BRD_SQ_NUM + TOSQ(Move)]
                    += depth * depth;
            }
            alpha = Score;
            BestMove = Move;

        }
    }

    /* Mate Check */
    if (Legal == 0) {
        if (InCheck == BOOL.TRUE) {
            return -MATE + GameBoard.ply;
        } else {
            return 0;
        }
    }

    if (alpha != OldAlpha) {
        StorePvMove(BestMove);
    }

    return alpha;
}

function ClearForSearch() {

    var index = 0;
    var index2 = 0;

    for (index = 0; index < 14 * BRD_SQ_NUM; ++index) {
        GameBoard.searchHistory[index] = 0;
    }

    for (index = 0; index < 3 * MAXDEPTH; ++index) {
        GameBoard.searchKillers[index] = 0;// killers are move that improve beta 
    }

    ClearPvTable();
    GameBoard.ply = 0;
    SearchController.nodes = 0;
    SearchController.fh = 0;
    SearchController.fhf = 0;
    SearchController.start = Date.now();
    SearchController.stop = BOOL.FALSE;
}

function SearchPosition() {

    var bestMove = NOMOVE;
    var bestScore = -INFINITE;
    var Score = -INFINITE;
    var currentDepth = 0;
    var line;
    var PvNum;
    var c;

    ClearForSearch();

    for (currentDepth = 1; currentDepth <= SearchController.depth; ++currentDepth) {
        // console.log(SearchController.depth);
        Score = AlphaBeta(-INFINITE, INFINITE, currentDepth); // AB

        if (SearchController.stop == BOOL.TRUE) {
            break;
        }

        bestScore = Score;

        bestMove = ProbePvTable();
        line = 'D:' + currentDepth + ' Best:' + PrMove(bestMove) + ' Score:' + bestScore +
            ' nodes:' + SearchController.nodes;

        PvNum = GetPvLine(currentDepth);
        line += ' Pv:';
        for (c = 0; c < PvNum; ++c) {
            line += ' ' + PrMove(GameBoard.PvArray[c]);
        }
        if (currentDepth != 1) {
            line += (" Ordering:" + ((SearchController.fhf / SearchController.fh) * 100).toFixed(2) + "%");
        }
        console.log(line);

    }

    SearchController.best = bestMove;
    SearchController.thinking = BOOL.FALSE;
    UpdateDOMStats(bestScore, currentDepth);

}

function UpdateDOMStats(dom_score, dom_depth) {
    var scoreText = "Score: " + (dom_score / 100).toFixed(2);
    if (Math.abs(dom_score) > MATE - MAXDEPTH) {
        scoreText = "Score: Mate in " + (MATE - Math.abs(dom_score) - 1) + " moves";
    }

    document.getElementById('OrderingOut').innerText = "Ordering: " + ((SearchController.fhf / SearchController.fh) * 100).toFixed(2) + "%";
    document.getElementById('DepthOut').innerText = "Depth: " + dom_depth;
    document.getElementById('ScoreOut').innerText = scoreText;
    document.getElementById('NodesOut').innerText = "Nodes: " + SearchController.nodes;
    document.getElementById('TimeOut').innerText = "Time: " + ((Date.now() - SearchController.start) / 1000).toFixed(1) + "s";
    document.getElementById('BestOut').innerText = "Best Move: " + PrMove(SearchController.best);
}
