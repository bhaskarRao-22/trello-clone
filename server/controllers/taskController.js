import cloudinary from "../utils/cloudinary.js";
import Task from "../models/Task.js";
import { checkBoardPermission } from "../utils/checkPermission.js";
// import List from "../models/List.js";
import { logActivity } from "../utils/logActivity.js";

export const createTask = async (req, res) => {
  try {
    const { title, listId, boardId } = req.body;

    // const list = await List.findById(listId);
    // const boardId = list.boardId;
    // await checkBoardPermission(boardId, req.user.id, ["Admin", "Editor"]);

    const task = await Task.create({ title, listId, boardId });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ msg: "Task creation failed", err });
  }
};

export const getTasksByList = async (req, res) => {
  try {
    const listId = req.params.listId;
    const tasks = await Task.find({ listId }).sort({ order: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: "Fetching tasks failed", err });
  }
};

export const updateTaskOrder = async (req, res) => {
  try {
    const { updatedTasks } = req.body;

    // updatedTasks: [{ _id, listId, order }]
    const bulkOps = updatedTasks.map((task) => ({
      updateOne: {
        filter: { _id: task._id },
        update: { $set: { order: task.order, listId: task.listId } },
      },
    }));

    await Task.bulkWrite(bulkOps);
    res.status(200).json({ msg: "Task order updated" });
  } catch (err) {
    res.status(500).json({ msg: "Task order update failed", err });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, label, labelColor, dueDate } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { title, description, label, labelColor, dueDate },
      { new: true }
    );

    await logActivity({
      boardId: task.boardId,
      userId: req.user.id,
      action: "Updated Task",
      taskId: task._id,
      meta: { fields: Object.keys(req.body) },
      io: req.io,
    });

    res.json(task);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Task update failed", err });
  }
};

export const uploadAttachment = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const file = req.file;

    const uploadRes = await cloudinary.uploader.upload_stream(
      { folder: "task_attachments", resource_type: "auto" },
      async (err, result) => {
        if (err) return res.status(500).json({ msg: "Upload failed", err });

        const task = await Task.findById(taskId);
        task.attachments.push({
          url: result.secure_url,
          public_id: result.public_id,
          filename: file.originalname,
        });
        await task.save();

        res.json(task);
      }
    );

    uploadRes.end(file.buffer);
  } catch (err) {
    res.status(500).json({ msg: "Attachment upload failed", err });
  }
};
