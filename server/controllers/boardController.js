import Board from "../models/Board.js";
import User from "../models/User.js";

export const createBoard = async (req, res) => {
  try {
    const { title } = req.body;
    const board = await Board.create({
      title,
      createdBy: req.user.id,
      // members: [req.user.id],
      team: [
        {
          userId: req.user._id,
          role: "Admin",
        },
      ],
    });
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ msg: "Failed to create board", err });
  }
};

export const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ members: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(boards);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch boards", err });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const boardId = req.params.boardId;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ msg: "Board not found" });

    const alreadyAdded = board.team.find((m) => m.user.equals(user._id));
    if (alreadyAdded)
      return res.status(400).json({ msg: "User already in team" });

    board.team.push({ user: user._id, role });
    await board.save();

    res.status(200).json({ msg: "User invited successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Invite failed", err });
  }
};
