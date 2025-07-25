import List from "../models/List.js";
import { checkBoardPermission } from "../utils/checkPermission.js";

export const createList = async (req, res) => {
  try {
    const { title, boardId } = req.body;
    
    await checkBoardPermission(boardId, req.user.id, ["Admin", "Editor"]);
    
    const list = await List.create({ title, boardId });
    res.status(201).json(list);
  } catch (err) {
    if (err.message === "Permission denied") {
      return res.status(403).json({ msg: err.message });
    }
    res.status(500).json({ msg: "List creation failed", err });
  }
};

export const getListsByBoard = async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const lists = await List.find({ boardId }).sort({ order: 1 });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ msg: "Fetching lists failed", err });
  }
};
