// src/components/posts/PostCard.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import QuoteModal from './QuoteModal';
import NestedPost from './NestedPost';
import ReplyModal from '../comments/ReplyModal';
import { FaRetweet } from 'react-icons/fa';

/**
 * Renders a single Post (with optional repost/quote).
 *
 * Key changes:
 * - Removed the old inline CommentsSection in favor of a "Reply" modal.
 * - No longer references a `showComments` prop or the post's `comments` array.
 */
const PostCard = ({
  post,
  isClickable = false,       // Whether clicking blank space navigates to /post/:id
  formatDate,
  onLike,
  onRepost,
  onQuote,
  onIncrementView,
  onComment,                 // Called when user submits a reply
}) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Local state for opening modals
  const [isQuotingModalOpen, setIsQuotingModalOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  /**
   * Decide which entity holds the stats (likes, reposts, views).
   * If this post is a repost, we might use repostOf's stats.
   * If it's a quote, we use the post's own stats, or again repostOf's stats.
   * Typically you'd do something like:
   */
  const statsSource = post.repostOf || post;

  // If user chooses "Quote," we might quote the "original" post
  // (either repostOf if it exists, or the post itself).
  const quoteTarget = post.repostOf || post;

  // Handler: click "Quote" in PostActions
  const handleStartQuote = () => {
    setIsQuotingModalOpen(true);
  };

  // When user finishes typing quote text
  const handleSubmitQuote = (text) => {
    onQuote(quoteTarget.id, text);
    setIsQuotingModalOpen(false);
  };

  // Handler: click "Reply"
  const handleReplyClick = () => {
    setIsReplyOpen(true);
  };

  // When user finishes typing a reply in the ReplyModal
  const handleSubmitReply = (postId, content) => {
    // Call the onComment callback, presumably mapped to `replyPost` in SinglePostView
    onComment(postId, content);
  };

  // If the card is clickable, clicking empty space navigates to /post/:id
  const handleCardClick = (e) => {
    // Prevent multi-level nesting or confusion if needed
    navigate(`/post/${statsSource.id}`);
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '5px',
        padding: '15px',
        marginBottom: '20px',
        position: 'relative',
        cursor: isClickable ? 'pointer' : 'auto',
      }}
      // Only attach onClick if isClickable is true
      onClick={isClickable ? handleCardClick : undefined}
    >
      {/* If it's a repost, show "X reposted" note at top */}
      {post.repostOf && (
        <p style={{ fontStyle: 'italic', color: '#666' }}>
          <FaRetweet /> {post.user?.name} reposted
        </p>
      )}

      {/* Render the main post's user and content */}
      <PostHeader
        user={post.user}
        createdAt={post.createdAt}
        formatDate={formatDate}
      />
      <PostContent post={post} />

      {/* If there's a repostOf or quoteOf, show them nested */}
      {/* Stop propagation so that clicking inside doesn't trigger parent navigation */}
      <div onClick={(e) => e.stopPropagation()}>
        {post.repostOf && (
          <NestedPost post={post.repostOf} formatDate={formatDate} depth={1} />
        )}
        {post.quoteOf && (
          <NestedPost post={post.quoteOf} formatDate={formatDate} depth={1} />
        )}
      </div>

      {/* The action buttons: Like, Repost, Quote, Reply, etc. */}
      {/* Also stop propagation, so clicks on them don't navigate */}
      <div onClick={(e) => e.stopPropagation()}>
        <PostActions
          statsSource={statsSource}
          onLike={onLike}
          onRepost={onRepost}
          onQuote={handleStartQuote}
          onIncrementView={onIncrementView}
          onReply={handleReplyClick}
        />
      </div>

      {/* Reply Modal: opens when user clicks "Reply" */}
      <ReplyModal
        statsSource={statsSource}
        isOpen={isReplyOpen}
        onClose={() => setIsReplyOpen(false)}
        formatDate={formatDate}
        onSubmitReply={handleSubmitReply}
      />

      {/* Quote Modal: opens when user clicks "Quote" */}
      <QuoteModal
        isOpen={isQuotingModalOpen}
        onClose={() => setIsQuotingModalOpen(false)}
        post={quoteTarget}
        formatDate={formatDate}
        onSubmitQuote={handleSubmitQuote}
      />
    </div>
  );
};

export default PostCard;