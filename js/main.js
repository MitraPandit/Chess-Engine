/*
    unique?
    Piece on sq
    side
    castle
    enPas

    idea is to xor key with everything

    pos ^= RandNum for all pieces on sq
    pos ^= RandNum for side... and so on 


*/
document.addEventListener("DOMContentLoaded", function () {
    init();
    console.log("Yash is before Main init");
    console.log("Main Init Called");
    NewGame(START_FEN);
    PrintBoard();
});
// $(function () {
//     init();
//     console.log("Main Init Called");
//     ParseFen(START_FEN);
//     PrintBoard();
// });

function InitFilesRanksBrd() {

    var index = 0;
    var file = FILES.FILE_A;
    var rank = RANKS.RANK_1;
    var sq = SQUARES.A1;

    for (index = 0; index < BRD_SQ_NUM; ++index) {
        FilesBrd[index] = SQUARES.OFFBOARD;
        RanksBrd[index] = SQUARES.OFFBOARD;
    }

    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
            sq = FR2SQ(file, rank);
            FilesBrd[sq] = file;
            RanksBrd[sq] = rank;
        }
    }
}

function InitHashKeys() {
    var index = 0;

    for (index = 0; index < 14 * 120; ++index) {
        PieceKeys[index] = RAND_32(); // generate rand keys for pieces
    }

    SideKey = RAND_32();

    for (index = 0; index < 16; ++index) {
        CastleKeys[index] = RAND_32(); // generate rand keys for castle perm
    }
}

function InitSq120To64() {

    var index = 0;
    var file = FILES.FILE_A;
    var rank = RANKS.RANK_1;
    var sq = SQUARES.A1;
    var sq64 = 0;

    for (index = 0; index < BRD_SQ_NUM; ++index) {
        Sq120ToSq64[index] = 65;
    }

    for (index = 0; index < 64; ++index) {
        Sq64ToSq120[index] = 120;
    }

    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
            sq = FR2SQ(file, rank);
            Sq64ToSq120[sq64] = sq;
            Sq120ToSq64[sq] = sq64;
            sq64++;
        }
    }

}

function InitBoardVars() {

    var index = 0;
    for (index = 0; index < MAXGAMEMOVES; ++index) {
        GameBoard.history.push({
            move: NOMOVE,
            castlePerm: 0,
            enPas: 0,
            fiftyMove: 0,
            posKey: 0
        });
    }

    for (index = 0; index < PVENTRIES; ++index) {
        GameBoard.PvTable.push({
            move: NOMOVE,
            posKey: 0
        });
    }
}

function InitBoardSquares() {
    var light = 1;
    var rankName;
    var fileName;
    var divString;
    var rankIter;
    var fileIter;
    var lightString;

    for (rankIter = RANKS.RANK_8; rankIter >= RANKS.RANK_1; rankIter--) {
        light ^= 1;
        rankName = "rank" + (rankIter + 1);
        for (fileIter = FILES.FILE_A; fileIter <= FILES.FILE_H; fileIter++) {
            fileName = "file" + (fileIter + 1);
            if (light == 0) lightString = "Light";
            else lightString = "Dark";
            light ^= 1;
            var element = document.createElement("div");
            element.className = "Square " + rankName + " " + fileName + " " + lightString;
            // divString = "<div class=\"Square " + rankName + " " + fileName + " " + lightString + "\"/>";
            document.getElementById("Board").appendChild(element);
            element.addEventListener("click", sqclick);
            // $("#Board").append(divString);
        }
    }

}

function init() {
    console.log("init() called");
    InitFilesRanksBrd();
    InitHashKeys();
    InitSq120To64();
    InitBoardVars();
    InitMvvLva();
    InitBoardSquares();
}

