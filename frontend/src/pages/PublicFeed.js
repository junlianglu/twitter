import React, { useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import CreatePost from '../components/CreatePost';
import PostsList from '../components/posts/PostsList';
import "./PublicFeed.css";

export const GET_POSTS = gql`
  query GetPosts {
    posts {
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

const PublicFeed = () => {
  // Fetch all posts
  const { loading, error, data, refetch } = useQuery(GET_POSTS);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refetch]);

  // Mutations
  const [likePost] = useMutation(LIKE_POST, { onCompleted: () => refetch() });
  const [repostPost] = useMutation(REPOST_POST, { onCompleted: () => refetch() });
  const [quotePost] = useMutation(QUOTE_POST, { onCompleted: () => refetch() });
  const [incrementView] = useMutation(INCREMENT_VIEW, { onCompleted: () => refetch() });
  const [replyPost] = useMutation(REPLY_POST, {
    onCompleted: () => refetch(),
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Convert numeric timestamps to human-readable strings
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

  if (loading) return (
    <div className="publicfeed-loading">
      <div className="publicfeed-spinner"></div>
      <div className="publicfeed-loading-text">Loading posts...</div>
    </div>
  );
  if (error) return <p style={{ color: 'red' }}>Error: {error.message}</p>;

  return (
    <div className="publicfeed-root">
      <CreatePost />
      <div className="publicfeed-title">Public Posts</div>
      <PostsList
        posts={data?.posts || []}
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

export default PublicFeed;