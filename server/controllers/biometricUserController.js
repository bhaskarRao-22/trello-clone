import BiometricUser from "../models/BiometricUser.js";

// [GET] Get all biometric users
export const getAllBiometricUsers = async (req, res) => {
  try {
    const users = await BiometricUser.find({ isActive: true }).sort({
      bioName: 1,
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [POST] Add new biometric user manually
export const createBiometricUser = async (req, res) => {
  const { bioId, bioName, designation, avatar } = req.body;
  if (!bioId || !bioName)
    return res.status(400).json({ error: "bioId and bioName required" });

  try {
    const exists = await BiometricUser.findOne({ bioId });
    if (exists) return res.status(400).json({ error: "User already exists" });

    const user = await BiometricUser.create({
      bioId,
      bioName,
      designation,
      avatar,
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
