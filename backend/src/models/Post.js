const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  content: { type: String },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: String }], // List of user IDs who liked the post
  reposts: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  repostOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null,
  },
  quoteOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null,
  },
  replyOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null,
  },
  media: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('Post', postSchema);