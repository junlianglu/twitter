// src/components/replies/RepliesList.js
import React from 'react';
import PostCard from '../posts/PostCard';
import './RepliesList.css';

/**
 * Renders a list of replies (which are themselves Post objects).
 */
const RepliesList = ({
  replies,
  formatDate,
  onLike,
  onRepost,
  onQuote,
  onReply, // if you allow replying to a reply
  onIncrementView,
}) => {
  if (!replies || replies.length === 0) {
    return <p className="replieslist-empty">No replies yet.</p>;
  }

  return (
    <div className="replieslist-root">
      {replies.map((r) => (
        <PostCard
          key={r.id}
          post={r}
          isClickable={true}
          formatDate={formatDate}
          onLike={onLike}
          onRepost={onRepost}
          onQuote={onQuote}
          onIncrementView={onIncrementView}
          onComment={onReply}
          // showComments={false}, isClickable, etc. up to you
        />
      ))}
    </div>
  );
};

export default RepliesList;