import crypto from "crypto";
import Invite from "../models/Invite.js";
import Board from "../models/Board.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

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
    const boards = await Board.find({ "team.userId": req.user._id }).sort({
      createdAt: -1,
    });

    // console.log("boards ===>",boards);

    res.json(boards);
  } catch (err) {
    console.log(err);
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

    // const alreadyAdded = board.team.find(
    //   (m) => m.userId && m.userId.equals(user._id)
    // );
    // if (alreadyAdded)
    //   return res.status(400).json({ msg: "User already in team" });

    const existingInvite = await Invite.findOne({
      email,
      boardId,
      accepted: false,
    });
    if (existingInvite)
      return res.status(400).json({ msg: "User already invited" });

    const token = crypto.randomBytes(20).toString("hex");
    const invite = await Invite.create({ email, boardId, role, token });
    const joinLink = `http://localhost:5173/join-invite/${token}`;

    // send email
    await sendEmail({
      to: email,
      subject: `You're invited to join a board: ${board.title}`,
      html: `<p>You have been invited to join <strong>${board.title}</strong>.</p>
             <p><a href="${joinLink}">Click here to accept invitation</a></p>`,
    });

    // board.team.push({ user: user._id, role });
    // await board.save();

    res.status(200).json({ msg: "Invite sent successfully" });
  } catch (err) {
    console.error("inviteMember error:", err);
    res.status(500).json({ msg: "Invite failed", err });
  }
};

export const getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate("team.userId");

    if (!board) {
      return res.status(404).json({ msg: "Board not found" });
    }
    // console.log("board ===>", board);
    // Filter out members where userId was not populated (deleted users etc.)
    board.team = board.team.filter((member) => member.userId);

    res.status(200).json(board);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch board", err });
  }
};

export const getBoardInvites = async (req, res) => {
  try {
    const { id } = req.params;

    const invites = await Invite.find({ boardId: id, accepted: false });

    res.status(200).json(invites);
  } catch (error) {
    console.error("getBoardInvites error:", error);
    res.status(500).json({ msg: "Failed to fetch invites", error });
  }
};

