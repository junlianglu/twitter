// src/components/posts/PostActions.js
import React, { useState, useEffect, useRef } from 'react';
import { FaRegComment, FaRegHeart, FaRetweet, FaRegEye, FaQuoteRight } from 'react-icons/fa';
import './PostActions.css';

const PostActions = ({ statsSource, onLike, onRepost, onQuote, onIncrementView, onReply }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLikeClick = () => {
    onLike(statsSource.id);
  };

  const handleRepostButtonClick = () => {
    // Toggle the dropdown
    setShowDropdown((prev) => !prev);
  };

  const handleRepostOption = () => {
    // Call onRepost with the ID
    onRepost(statsSource.id);
    setShowDropdown(false);
  };

  const handleQuoteOption = () => {
    // We don’t have the text yet, so we just call onQuote (which may open a “quote composer”)
    onQuote();
    setShowDropdown(false);
  };

  const handleIncrementViewClick = () => {
    onIncrementView(statsSource.id);
  };

  // Close the dropdown if user clicks anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', position: 'relative' }}>
      <span className="post-action post-action-reply" onClick={() => onReply()} tabIndex={0} role="button">
        <FaRegComment />
        <span style={{ marginLeft: 6 }}>{statsSource.replyCount || 0}</span>
      </span>
      <span className="post-action post-action-like" onClick={handleLikeClick} tabIndex={0} role="button">
        <FaRegHeart />
        <span style={{ marginLeft: 6 }}>{statsSource.likes?.length || 0}</span>
      </span>

      {/* Repost button + dropdown */}
      <div style={{ position: 'relative' }}>
        <span className="post-action post-action-repost" onClick={handleRepostButtonClick} tabIndex={0} role="button">
          <FaRetweet />
          <span style={{ marginLeft: 6 }}>{statsSource.reposts || 0}</span>
        </span>
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="post-action-dropdown"
            style={{
              position: 'absolute',
              top: '40px',
              left: 0,
              backgroundColor: '#1e1e1e',
              border: '1px solid #444',
              borderRadius: '4px',
              padding: '5px 0',
              zIndex: 10,
              minWidth: '120px',
            }}
          >
            <div
              className="post-action-dropdown-item"
              onClick={handleRepostOption}
              tabIndex={0}
              role="button"
              style={{
                background: 'transparent',
                color: '#fff',
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                cursor: 'pointer',
              }}
            >
              <FaRetweet />
            </div>
            <div
              className="post-action-dropdown-item"
              onClick={handleQuoteOption}
              tabIndex={0}
              role="button"
              style={{
                background: 'transparent',
                color: '#fff',
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                cursor: 'pointer',
              }}
            >
              <FaQuoteRight />
            </div>
          </div>
        )}
      </div>

      <span className="post-action post-action-view" onClick={handleIncrementViewClick} tabIndex={0} role="button">
        <FaRegEye />
        <span style={{ marginLeft: 6 }}> {statsSource.views || 0}</span>
      </span>
    </div>
  );
};

export default PostActions;