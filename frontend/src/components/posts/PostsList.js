// src/components/posts/PostsList.js
import React from 'react';
import PostCard from './PostCard';
import './PostsList.css';

/**
 * Renders a list of PostCards.
 * 
 * @param {Array} posts - Array of post objects.
 * @param {function} formatDate - Helper to format timestamps.
 * @param {...functions} - The callback props for like, repost, quote, etc.
 */
const PostsList = ({
  posts,
  formatDate,
  onLike,
  onRepost,
  onQuote,
  onIncrementView,
  onComment,
}) => {

  if (!posts || posts.length === 0) {
    return <p className="postslist-empty">No posts found.</p>;
  }
  
  return (
    <div className="postslist-root">
      <div className="postslist-list">
        {posts.map((post) => (
          <div className="postslist-postcard" key={post.id}>
            <PostCard
              post={post}
              formatDate={formatDate}
              onLike={onLike}
              onRepost={onRepost}
              onQuote={onQuote}
              onIncrementView={onIncrementView}
              onComment={onComment}
              showComments={false}
              isClickable={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostsList;