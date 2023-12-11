import express from "express";

const router = express.Router();

router.post("/save", async (req: any, res) => {
  try {
    console.log(req.body.memeData);
    const db = req.db;
    const base64Data = req.body.memeData;
    const type = req.body.type;
    const timestamp = req.body.timestamp;
    const username = req.body.username;

    // Decode base64 data
    // const binaryData = Buffer.from(base64Data, "base64");

    // Assuming you have a collection named "memes" in your MongoDB
    const memes = db.get("memes");

    // Insert the meme data into the MongoDB collection
    const result = await memes.insert({
      memeData: base64Data,
      type: type,
      timestamp: timestamp,
      username: username,
    });

    console.log("Meme saved to MongoDB:", result);

    res
      .status(200)
      .json({ message: "Meme saved to MongoDB", memeId: result._id });
  } catch (error) {
    console.error("Error saving meme to MongoDB:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get meme data by memeId
router.get("/:memeId", async (req: any, res) => {
  try {
    const db = req.db;
    const memeId = req.params.memeId;

    const memes = db.get("memes");

    const meme = await memes.findOne({ _id: memeId });

    if (!meme) {
      res.status(404).json({ message: "Meme not found" });
      return;
    }

    res.status(200).json({
      memeId: meme._id,
      memeData: meme.memeData,
      type: meme.type,
      timestamp: meme.timestamp,
      username: meme.username,
    });
  } catch (error) {
    console.error("Error fetching meme data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
