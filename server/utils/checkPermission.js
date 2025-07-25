import Board from "../models/Board.js";

export const checkBoardPermission = async (boardId, userId, allowedRoles = []) => {
  
  const board = await Board.findById(boardId).populate("team.userId");

  const currentUserRole = board.team.find((m) =>
    m.userId && m.userId._id.toString() === userId.toString()
  )?.role;

  if (!allowedRoles.includes(currentUserRole)) {
    throw new Error("Permission denied");
  }
};
