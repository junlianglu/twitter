// src/components/posts/NestedPost.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PostHeader from './PostHeader';
import PostContent from './PostContent';

/**
 * Recursively renders nested repost/quote posts up to a certain depth.
 *
 * @param {Object} post      - The post data from GraphQL.
 * @param {Function} formatDate
 * @param {number} depth     - Current depth of nesting (0 at top).
 * @param {number} maxDepth  - Maximum nesting level you want to display (e.g. 2).
 */
const NestedPost = ({ post, formatDate, depth = 1, maxDepth = 2 }) => {
  const navigate = useNavigate();

  if (!post) return null;

  // If we've reached max depth, just display a brief link instead of fully nesting
  if (depth >= maxDepth) {
    return (
      <div
        style={{
          fontStyle: 'italic',
          color: '#666',
          border: '1px solid #ccc',
          padding: '10px',
          marginBottom: '10px',
          marginLeft: depth > 0 ? '20px' : '0',
        }}
        onClick={(e) => {
          e.stopPropagation(); 
          navigate(`/post/${post.id}`);
        }}
      >
        <p>See original post from @{post.user?.name}</p>
      </div>
    );
  }

  const handleNavigate = (e) => {
    // Prevent parent clicks from triggering
    e.stopPropagation();
    navigate(`/post/${post.id}`);
  };

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        marginBottom: '10px',
        marginLeft: depth > 0 ? '20px' : '0',
      }}
      onClick={handleNavigate}
    >
      {/* Post header */}
      <PostHeader user={post.user} createdAt={post.createdAt} formatDate={formatDate} />

      {/* Post content */}
      <PostContent post={post} />

      {/* If there's a repostOf, render nested */}
      {post.repostOf && (
        <NestedPost
          post={post.repostOf}
          formatDate={formatDate}
          depth={depth + 1}
          maxDepth={maxDepth}
        />
      )}

      {/* If there's a quoteOf, render nested */}
      {post.quoteOf && (
        <NestedPost
          post={post.quoteOf}
          formatDate={formatDate}
          depth={depth + 1}
          maxDepth={maxDepth}
        />
      )}
    </div>
  );
};

export default NestedPost;