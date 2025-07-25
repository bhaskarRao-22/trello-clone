import Invite from "../models/Invite.js";
import Board from "../models/Board.js";
import User from "../models/User.js";

export const acceptInvite = async (req, res) => {
  const { token } = req.params;
  const userId = req.user.id;
  try {

    // 1. Check if the invite exists and not already accepted
    const invite = await Invite.findOne({ token });
    if (!invite) {
      return res.status(404).json({ msg: "Invalid or expired invite link." });
    }

    if (invite.accepted) {
      return res.status(400).json({ msg: "Invite already used." });
    }

    // 2. Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ msg: "User not found." });
    }

    if (user.email !== invite.email) {
      return res.status(403).json({ msg: "Email mismatch. Please login with the invited account." });
    }

    // 3. Add to board team if not already present
    const board = await Board.findById(invite.boardId);
    if (!board) {
      return res.status(404).json({ msg: "Board not found." });
    }

    // const alreadyAdded = board.team.some((m) => m.userId && m.userId.toString() === userId);
    const alreadyAdded = board.team.some((m) => m.userId?.toString() === userId.toString()
);
    if (!alreadyAdded) {
      board.team.push({ userId: userId, role: invite.role });
      await board.save();
    }

    // 4. Mark invite as accepted
    invite.accepted = true;
    await invite.save();

    res.status(200).json({ msg: "Successfully joined the board!", boardId: board._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error while accepting invite" });
  }
};
