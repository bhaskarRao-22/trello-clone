import API from "./axios";

export const getTasksByList = async (listId, token) =>
  await API.get(`/tasks/${listId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createTask = async (title, listId, token) =>
  await API.post(
    "/tasks",
    { title, listId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
