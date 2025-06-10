// src/pages/SinglePostView.js

import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
import PostCard from '../components/posts/PostCard';
import RepliesList from '../components/replies/RepliesList';
import './SinglePostView.css';

// 1) Query for the single post (NO old 'comments' field now)
const GET_SINGLE_POST = gql`
  query GetSinglePost($postId: ID!) {
    post(postId: $postId) {
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

// 2) Query for replies to this post
const GET_REPLIES = gql`
  query GetReplies($postId: ID!) {
    replies(postId: $postId) {
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
  }
`;

// 3) Normal mutations (like, repost, quote, etc.)
//    If you have a new 'replyPost', you can define it. Or you can keep 'commentPost' 
//    if you want to rename it 'replyPost' on the backend. For now, let's assume you do:

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

const SinglePostView = () => {
  const { postId } = useParams();

  // 4) Fetch the main post
  const {
    loading: postLoading,
    error: postError,
    data: postData,
    refetch: refetchPost,
  } = useQuery(GET_SINGLE_POST, {
    variables: { postId },
  });

  // 5) Fetch the replies
  const {
    loading: repliesLoading,
    error: repliesError,
    data: repliesData,
    refetch: refetchReplies,
  } = useQuery(GET_REPLIES, {
    variables: { postId },
  });

  // 6) Setup the mutations
  //    - On each completion, we refetch either the post or the replies if needed
  const [likePost] = useMutation(LIKE_POST, {
    onCompleted: () => {
      // If likes on the parent post, refetch the post
      refetchPost();
      // If you want to refresh replies too, do refetchReplies();
    },
  });

  const [repostPost] = useMutation(REPOST_POST, {
    onCompleted: () => {
      refetchPost();
      refetchReplies();
    },
  });

  const [quotePost] = useMutation(QUOTE_POST, {
    onCompleted: () => refetchPost(),
  });

  const [incrementView] = useMutation(INCREMENT_VIEW, {
    onCompleted: () => refetchPost(),
  });

  // 7) New "replyPost" mutation to create a reply
  const [replyPost] = useMutation(REPLY_POST, {
    onCompleted: () => {
      // Refresh the list of replies so the new one shows up
      refetchReplies();
      refetchPost();
    },
  });

  // 8) Convert numeric timestamp to a nice format
  const formatDate = (timeString) => {
    const timestamp = parseInt(timeString, 10);
    if (isNaN(timestamp)) return 'Invalid date';
    return new Date(timestamp).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // 9) Callback implementations for the post actions
  const handleLike = (id) => likePost({ variables: { postId: id } });
  const handleRepost = (id) => repostPost({ variables: { postId: id } });
  const handleQuote = (id, content) => quotePost({ variables: { postId: id, content } });
  const handleIncrementView = (id) => incrementView({ variables: { postId: id } });

  // 10) "Reply" action => call replyPost
  const handleReply = (id, content) => {
    replyPost({ variables: { postId: id, content } });
  };

  if (postLoading || repliesLoading) {
    return (
      <div className="singlepost-loading">
        <div className="singlepost-spinner"></div>
        <div className="singlepost-loading-text">Loading post...</div>
      </div>
    );
  }
  if (postError) return <p style={{ color: 'red' }}>{postError.message}</p>;
  if (repliesError) return <p style={{ color: 'red' }}>{repliesError.message}</p>;

  // 11) Post data from the query
  const post = postData?.post;
  // 12) Replies from the query
  const replies = repliesData?.replies || [];

  if (!post) {
    return <p>Post not found.</p>;
  }

  return (
    <div className="singlepost-root">
      <div className="singlepost-title">Post Details</div>
      <PostCard
        post={post}
        showComments={false}
        isClickable={false}
        formatDate={formatDate}
        onLike={handleLike}
        onRepost={handleRepost}
        onQuote={handleQuote}
        onIncrementView={handleIncrementView}
        onComment={handleReply} 
      />

      <div className="singlepost-replies-title">Replies</div>
      <RepliesList
        replies={replies}
        formatDate={formatDate}
        onLike={handleLike}
        onRepost={handleRepost}
        onQuote={handleQuote}
        onReply={handleReply}
        onIncrementView={handleIncrementView}
      />
    </div>
  );
};

export default SinglePostView;