const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    username: String!
    avatar: String
    posts: [Post!]
    token: String
  }

  type Post {
    id: ID!
    content: String!
    userId: ID!
    user: User!
    createdAt: String!
    likes: [String!]! # List of user IDs who liked the post
    reposts: Int!
    views: Int!
    repostOf: Post
    quoteOf: Post
    replyOf: Post
    replyCount: Int!
    media: [String!]!
  }

  type Query {
    users: [User!]
    posts: [Post!]
    userPosts(userId: ID!): [Post!]
    post(postId: ID!): Post!
    user(id: ID!): User!
    replies(postId: ID!): [Post!]
  }

  type Mutation {
    createPost(
      content: String!,
      media: [String!]
    ): Post!
    register(name: String!, email: String!, username: String!, password: String!, avatar: String): User!
    login(email: String!, password: String!): User!
    likePost(postId: ID!): Post! # Toggle like/unlike functionality
    repostPost(postId: ID!): Post!
    quotePost(postId: ID!, content: String!): Post!
    replyPost(postId: ID!, content: String!): Post!
    incrementView(postId: ID!): Post!
    updateAvatar(avatar: String!): User!
  }
`;

module.exports = typeDefs;