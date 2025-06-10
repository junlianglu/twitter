// src/components/posts/QuoteModal.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { UserContext } from '../../UserContext';
import NestedPost from './NestedPost';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContainerStyle = {
  backgroundColor: '#1e1e1e',
  width: '600px',
  maxWidth: '90%',
  borderRadius: '8px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  color: '#fff',
};

const QuoteModal = ({ 
  isOpen, 
  onClose, 
  post, 
  formatDate,
  onSubmitQuote 
}) => {
  const { user } = useContext(UserContext);  // <--- Get current user from context
  const [quoteText, setQuoteText] = useState('');

  const modalRef = useRef(null);

  // Close if user clicks outside modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleContainerClick = (e) => {
    e.stopPropagation(); 
  };

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (!quoteText.trim()) return;
    onSubmitQuote(quoteText);
    setQuoteText('');
  };

  return (
    <div style={modalOverlayStyle}>
      <div 
        style={modalContainerStyle} 
        ref={modalRef} 
        onClick={handleContainerClick}
      >
        {/* Close button in upper left */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            left: '15px',
            border: 'none',
            background: 'transparent',
            fontSize: '18px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        {/* User avatar + text area in a horizontal row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          marginTop: '40px', 
          marginBottom: '10px',
          gap: '10px'
        }}>
          <img
            src={user?.avatar || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'}
            alt="avatar"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <textarea
            rows={3}
            style={{
              flex: 1,
              resize: 'none',
              width: '100%',
              padding: '10px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
            }}
            placeholder="Add a comment"
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
          />
        </div>

        {/* Show the post being quoted (NestedPost or a simpler preview) */}
        <NestedPost post={post} formatDate={formatDate} depth={1} />

        {/* Bottom-right "Post" button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSubmit}
            style={{
              backgroundColor: '#1da1f2',
              border: 'none',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;