const RequestCodes = Object.freeze({
    HOST_GAME: "HOST_GAME",
    HOST_GAME_RESULT: "HOST_GAME_RESULT",

    WAITING_FOR_SECOND_PLAYER: "WAITING_FOR_SECOND_PLAYER",
    SECOND_PLAYER_JOINED: "SECOND_PLAYER_JOINED",

    JOIN_GAME: "JOIN_GAME",
    JOIN_GAME_SUCCESS: "JOIN_GAME_SUCCESS",
    JOIN_GAME_FAILURE: "JOIN_GAME_FAILURE",

    REQUEST_MOVE: "REQUEST_MOVE",
    REQUEST_MOVE_RESULT: "REQUEST_MOVE_RESULT",

    REQUEST_UPGRADE: "REQUEST_UPGRADE",
    REQUEST_UPGRADE_RESULT: "REQUEST_UPGRADE_RESULT",

    KING_IS_CHECKED: "KING_IS_CHECKED",
    KING_IS_CHECKED_RESULT: "KING_IS_CHECKED_RESULT",

    CHECKMATE: "CHECKMATE",
    CHECKMATE_RESULT: "CHECKMATE_RESULT",

    STALEMATE_CHECK: "STALEMATE_CHECK",
    STALEMATE_CHECK_RESULT: "STALEMATE_CHECK_RESULT",

    DUMB_MOVE_CHECK: "DUMB_MOVE_CHECK",
    DUMB_MOVE_CHECK_RESULT: "DUMB_MOVE_CHECK_RESULT",

    IS_GAME_ENDED: "IS_GAME_ENDED",
    IS_GAME_ENDED_RESULT: "IS_GAME_ENDED_RESULT",

    GET_GAME_WINNER: "GET_GAME_WINNER",
    GET_GAME_WINNER_RESULT: "GET_GAME_WINNER_RESULT",

    CHECK_DANGEROUS_POSITION: "CHECK_DANGEROUS_POSITION",
    CHECK_DANGEROUS_POSITION_RESULT: "CHECK_DANGEROUS_POSITION_RESULT",

    GET_PIONI_AT_POS: "GET_PIONI_AT_POS",
    GET_PIONI_AT_POS_RESULT: "GET_PIONI_AT_POS_RESULT",

    GET_PIONIA: "GET_PIONIA",
    GET_PIONIA_RESULT: "GET_PIONIA_RESULT",

    GET_WHITE_TURN: "GET_WHITE_TURN",
    GET_WHITE_TURN_RESULT: "GET_WHITE_TURN_RESULT",

    GET_MOVES_REMAINING: "GET_MOVES_REMAINING",
    GET_MOVES_REMAINING_RESULT: "GET_MOVES_REMAINING_RESULT",

    REQUEST_CHESSBOARD: "REQUEST_CHESSBOARD",
    REQUEST_CHESSBOARD_RESULT: "REQUEST_CHESSBOARD_RESULT",

    REQUEST_FEN: "REQUEST_FEN",
    REQUEST_FEN_RESULT: "REQUEST_FEN_RESULT",

    REQUEST_BOARD_STATE: "REQUEST_BOARD_STATE",
    REQUEST_BOARD_STATE_RESULT: "REQUEST_BOARD_STATE_RESULT",

    CHESSBOARD_STATE: "CHESSBOARD_STATE",
    CHESSBOARD_STATE_RESULT: "CHESSBOARD_STATE_RESULT",

    ENEMY_MOVE: "ENEMY_MOVE",

    KING_CHECK_WHITE: "KING_CHECK_WHITE",
    KING_CHECK_BLACK: "KING_CHECK_BLACK",

    TIMER: "TIMER",

    PLAY_AGAIN: "PLAY_AGAIN",
    PLAY_AGAIN_ACCEPTED: "PLAY_AGAIN_ACCEPTED",

    START_AI_GAME: "START_AI_GAME",

    CHAT_MESSAGE: "CHAT_MESSAGE",

    CHAT_MESSAGE_NOTIFICATION: "CHAT_MESSAGE_NOTIFICATION",
});

export default RequestCodes;
