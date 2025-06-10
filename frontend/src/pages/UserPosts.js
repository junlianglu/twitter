// src/pages/UserPosts.js

import React, { useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom'; // or however you handle userId
import PostsList from '../components/posts/PostsList';
import "./UserPosts.css";

// 1) Query for user posts
const GET_USER_POSTS = gql`
  query GetUserPosts($userId: ID!) {
    userPosts(userId: $userId) {
      id
      content
      createdAt
      likes
      reposts
      views
      replyCount
      media
      replyOf {
        id
        content
        createdAt
        media
        user {
          id
          name
          username
          avatar
        }
      }
      repostOf {
        id
        content
        createdAt
        likes
        reposts
        views
        replyCount
        media
        user {
          id
          name
          username
          avatar
        }
        repostOf {
          id
          content
          createdAt
          likes
          reposts
          views
          replyCount
          user {
            id
            name
            username
            avatar
          }
        }
        quoteOf {
          id
          content
          createdAt
          reposts
          user {
            id
            name
            username
            avatar
          }
        }
      }
      # If post is a quote
      quoteOf {
        id
        content
        createdAt
        reposts
        media
        user {
          id
          name
          username
          avatar
        }
        repostOf {
          id
          content
          createdAt
          likes
          reposts
          views
          replyCount
          user {
            id
            name
            username
            avatar
          }
        }
        quoteOf {
          id
          content
          createdAt
          reposts
          user {
            id
            name
            username
            avatar
          }
        }
      }
      user {
        id
        name
        username
        avatar
      }
    }
  }
`;

const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likes
    }
  }
`;

const REPOST_POST = gql`
  mutation RepostPost($postId: ID!) {
    repostPost(postId: $postId) {
      id
      reposts
    }
  }
`;

const QUOTE_POST = gql`
  mutation QuotePost($postId: ID!, $content: String!) {
    quotePost(postId: $postId, content: $content) {
      id
    }
  }
`;

const INCREMENT_VIEW = gql`
  mutation IncrementView($postId: ID!) {
    incrementView(postId: $postId) {
      id
      views
    }
  }
`;

const REPLY_POST = gql`
  mutation ReplyPost($postId: ID!, $content: String!) {
    replyPost(postId: $postId, content: $content) {
      id
    }
  }
`;

// Optional: If you also want the user's name/avatar at the top
const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      avatar
      email
      username
    }
  }
`;

const UserPosts = (props) => {
  const params = useParams();
  const userId = props.userId || params.userId;
  // If you use a different routing approach, retrieve userId from props or context.

  // 1) Fetch the user’s posts
  const { loading, error, data, refetch } = useQuery(GET_USER_POSTS, {
    variables: { userId },
  });

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refetch]);

  // 2) (Optional) Fetch user data so we can show the user's name/avatar
  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(GET_USER, {
    variables: { id: userId },
  });

  // Hooks for mutations
  const [likePost] = useMutation(LIKE_POST, { onCompleted: () => refetch() });
  const [repostPost] = useMutation(REPOST_POST, { onCompleted: () => refetch() });
  const [quotePost] = useMutation(QUOTE_POST, { onCompleted: () => refetch() });
  const [incrementView] = useMutation(INCREMENT_VIEW, { onCompleted: () => refetch() });
  const [replyPost] = useMutation(REPLY_POST, {
    onCompleted: () => refetch(),
  });

  // Format date from numeric timestamp
  const formatDate = (timeString) => {
    const timestamp = parseInt(timeString, 10);
    if (isNaN(timestamp)) {
      return 'Invalid date';
    }
    return new Date(timestamp).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Callback functions
  const handleLike = (postId) => likePost({ variables: { postId } });
  const handleRepost = (postId) => repostPost({ variables: { postId } });
  const handleQuote = (postId, content) => quotePost({ variables: { postId, content } });
  const handleIncrementView = (postId) => incrementView({ variables: { postId } });
  const handleReply = (postId, content) => {
    replyPost({ variables: { postId, content } });
  };

  if (loading || userLoading) {
    return (
      <div className="userposts-loading">
        <div className="userposts-spinner"></div>
        <div className="userposts-loading-text">Loading user posts...</div>
      </div>
    );
  }
  if (error) return <p style={{ color: 'red' }}>Error: {error.message}</p>;
  if (userError) return <p style={{ color: 'red' }}>Error: {userError.message}</p>;

  // Optional: If userData.user is null, you might handle that (e.g. "User not found")
  const userDisplayName = userData?.user?.name || `User ${userId}`;

  return (
    <div className="userposts-root">

      {/* Optionally show user’s name, avatar, or other info at the top */}
      <div className="userposts-header">
        <img
          src={userData?.user?.avatar}
          alt="avatar"
          className="userposts-avatar"
        />
        <div>
          <div className="userposts-name">{userDisplayName}</div>
          <div className="userposts-subtitle">'s Posts</div>
        </div>
      </div>

      <PostsList
        posts={data?.userPosts || []}
        formatDate={formatDate}
        onLike={handleLike}
        onRepost={handleRepost}
        onQuote={handleQuote}
        onIncrementView={handleIncrementView}
        onComment={handleReply}
      />
    </div>
  );
};

export default UserPosts;