import React, { useState, useEffect, useRef, useContext } from 'react';
import { UserContext } from '../../UserContext';
import NestedPost from '../posts/NestedPost';
import './ReplyModal.css';

const ReplyModal = ({
  statsSource,
  isOpen,
  onClose,
  formatDate,
  onSubmitReply,
}) => {
  const [replyText, setReplyText] = useState('');
  const { user } = useContext(UserContext);
  const modalRef = useRef(null);

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

  if (!isOpen) return null;

  const handleReply = () => {
    if (!replyText.trim()) return;
    onSubmitReply(statsSource.id, replyText);
    setReplyText('');
    onClose();
  };

  return (
    <div className="replymodal-overlay">
      <div
        className="replymodal-container"
        ref={modalRef}
        onClick={handleContainerClick}
      >
        {/* Close button (upper left) */}
        <button
          onClick={onClose}
          className="replymodal-closebtn"
        >
          ✕
        </button>

        <NestedPost post={statsSource} formatDate={formatDate} depth={1} />

        <p className="replymodal-replyto">
          Replying to @{statsSource.user?.name}
        </p>

        <div className="replymodal-row">
          <img
            src={
              user?.avatar ||
              'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
            }
            alt="avatar"
            className="replymodal-avatar"
          />
          <textarea
            rows={3}
            className="replymodal-textarea"
            placeholder="Post your reply"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </div>

        <div className="replymodal-actions">
          <button
            onClick={handleReply}
            className="replymodal-replybtn"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;