import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Please provide a name for this todo."],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  user: {
    type: String,
    required: [true, "Please provide a user for this todo."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Todo || mongoose.model("Todo", TodoSchema);
