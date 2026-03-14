const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  allMessages,
} = require("../controllers/messageControllers");

router.route("/").post(protect, sendMessage); // POST /api/message
router.route("/:chatId").get(protect, allMessages); // GET  /api/message/:chatId

module.exports = router;
