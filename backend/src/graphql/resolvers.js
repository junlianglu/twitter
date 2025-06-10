const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const resolvers = {
  // Field-level resolver for Post.user so we can fetch the user data
  // whenever a Post is queried
  Post: {
    user: async (parent) => {
      const user = await User.findById(parent.userId);
      return user;
    },
    repostOf: async (parent) => {
      // If there's no repostOf, return null
      if (!parent.repostOf) return null;
  
      // Make sure to convert it to a string if you need to treat it as an ID
      const repostOfId = parent.repostOf.toString();
  
      // Now find the post by that ID
      const repostedPost = await Post.findById(repostOfId);
      return repostedPost;
    },
    quoteOf: async (parent) => {
      // If there's no quoteOf, return null
      if (!parent.quoteOf) return null;
  
      // Make sure to convert it to a string if you need to treat it as an ID
      const quoteOfId = parent.quoteOf.toString();
  
      // Now find the post by that ID
      const quotedPost = await Post.findById(quoteOfId);
      return quotedPost;
    },
    // If this post is a reply, load the parent post
    replyOf: async (parent) => {
      if (!parent.replyOf) return null;
      return await Post.findById(parent.replyOf.toString());
    },
    replyCount: async (parent) => {
      // Count how many posts have `replyOf = parent._id`
      return await Post.countDocuments({ replyOf: parent._id });
    },
  },

  Query: {
    // Fetch all users
    users: async () => {
      return await User.find();
    },

    // Fetch all posts
    posts: async () => {
      // Return only top-level posts (i.e. replyOf == null)
      return await Post.find({ replyOf: null }).sort({ createdAt: -1 });
    },

    // Fetch all posts by a specific user
    userPosts: async (_, { userId }) => {
      // Sort by newest first (optional)
      return await Post.find({ userId }).sort({ createdAt: -1 });
    },

    // Fetch a single post by ID
    post: async (_, { postId }) => {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }
      return post;
    },

    user: async (_, { id }) => {
      const foundUser = await User.findById(id);
      if (!foundUser) {
        throw new Error('User not found');
      }
      return foundUser;
    },

    replies: async (_, { postId }) => {
      // Return all posts whose `replyOf` = postId
      return await Post.find({ replyOf: postId }).sort({ createdAt: 1 });
    },
  },

  Mutation: {
    // Register a new user
    register: async (_, { name, email, username, password, avatar }) => {
      // Convert username to lowercase
      const lowerUsername = username.toLowerCase();

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('email already exists');
      }

      // Check if username already exists (case-insensitive)
      const existingUsername = await User.findOne({ username: lowerUsername });
      if (existingUsername) {
        throw new Error('Username already exists');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const user = new User({
        name,
        email,
        username: lowerUsername, // store in lowercase
        password: hashedPassword,
        avatar:
          avatar ||
          'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg',
      });

      const result = await user.save();

      // Generate JWT token
      const token = generateToken(result);

      return {
        id: result.id,
        name: result.name,
        email: result.email,
        username: result.username,
        avatar: result.avatar,
        token,
      };
    },

    // Login an existing user
    login: async (_, { email, password }) => {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      // Validate password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new Error('Incorrect password');
      }

      // Generate JWT token
      const token = generateToken(user);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        token,
      };
    },

    // Create a new post
    createPost: async (_, { content, media }, context) => {
      // Ensure user is authenticated
      if (!context.user) {
        throw new Error('User not authenticated');
      }

      if (media && media.length > 4) {
        throw new Error('You can only attach up to 4 media items per post.');
      }

      const newPost = new Post({
        content,
        userId: context.user.id,
        createdAt: new Date().toISOString(),
        media: media || [],
      });

      const savedPost = await newPost.save();
      return savedPost;
    },

    // Toggle like/unlike a post
    likePost: async (_, { postId }, context) => {
      if (!context.user) {
        throw new Error('User not authenticated');
      }

      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Check if user already liked this post
      const likeIndex = post.likes.indexOf(context.user.id);
      if (likeIndex === -1) {
        // Not liked yet, so like it
        post.likes.push(context.user.id);
      } else {
        // Already liked, so remove the like
        post.likes.splice(likeIndex, 1);
      }

      await post.save();
      return post;
    },

    repostPost: async (_, { postId }, context) => {
      if (!context.user) {
        throw new Error('User not authenticated');
      }
    
      // 1) Find the original post
      const originalPost = await Post.findById(postId);
      if (!originalPost) {
        throw new Error('Post not found');
      }
    
      // 2) Increment its repost counter
      originalPost.reposts += 1;
      await originalPost.save();
    
      // 3) Create a new post that points to the original
      const newRepost = new Post({
        // If you want the repost to have custom text, do something like:
        // content: `Repost: ${originalPost.content}`,
        // or keep it empty if you only want to display the "original" inside repostOf
        content: '',
        userId: context.user.id,
        createdAt: new Date().toISOString(),

        // The key: link back to the original post
        repostOf: originalPost._id,
      });

      const savedRepost = await newRepost.save();
    
      // 4) Return the updated original post
      return savedRepost;
    },

    quotePost: async (_, { postId, content }, context) => {
      console.log("hello");
      if (!context.user) {
        throw new Error('User not authenticated');
      }
    
      // 1) Find the original post
      const originalPost = await Post.findById(postId);
      if (!originalPost) {
        throw new Error('Post not found');
      }
    
      // 2) Increment its repost counter
      originalPost.reposts += 1;
      await originalPost.save();
    
      // 3) Create a new post that points to the original
      const newQuote = new Post({
        content: content,
        userId: context.user.id,
        createdAt: new Date().toISOString(),

        // The key: link back to the original post
        quoteOf: originalPost._id,
      });

      const savedQuote = await newQuote.save();
    
      // 4) Return the updated original post
      return savedQuote;
    },

    replyPost: async (_, { postId, content }, context) => {
      if (!context.user) {
        throw new Error('User not authenticated');
      }
  
      // 1) Find the parent post
      const parent = await Post.findById(postId);
      if (!parent) {
        throw new Error('Post not found');
      }
  
      // 2) Create a new Post referencing the parent
      const reply = new Post({
        content,
        userId: context.user.id,
        createdAt: new Date().toISOString(),
        replyOf: parent._id,
      });
  
      const savedReply = await reply.save();
      return savedReply;
    },

    // Increment the view count of a post
    incrementView: async (_, { postId }) => {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      post.views += 1;
      await post.save();
      return post;
    },
    
    updateAvatar: async (_, { avatar }, context) => {
      if (!context.user) {
        throw new Error('User not authenticated');
      }
      const user = await User.findById(context.user.id);
      if (!user) {
        throw new Error('User not found');
      }
      user.avatar = avatar;
      await user.save();
      return user;
    },
  },
};

module.exports = resolvers;