export const checkBoardPermission = async (boardId, userId, allowedRoles = []) => {
  const board = await Board.findById(boardId).populate("team.user");

  const currentUserRole = board.team.find((m) =>
    m.user._id.equals(userId)
  )?.role;

  if (!allowedRoles.includes(currentUserRole)) {
    throw new Error("Permission denied");
  }
};
