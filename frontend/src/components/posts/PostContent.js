// src/components/posts/PostContent.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PostContent = ({ post, isPosting = false }) => {
  const navigate = useNavigate();
  if (!post.content && (!post.media || post.media.length === 0)) return null;

  // Navigates to the user’s page of the post being replied to
  const handleReplyUserClick = (e) => {
    e.stopPropagation();
    if (post.replyOf) {
      navigate(`/user/${post.replyOf.user.id}`);
    }
  };

  return (
    <div style={{ position: 'relative', opacity: isPosting ? 0.5 : 1 }}>
      {isPosting && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: '10px 20px',
          borderRadius: '6px',
          fontWeight: 'bold',
          color: '#555',
          zIndex: 2,
        }}>
          Posting...
        </div>
      )}
      {/* If this post is a reply, display "Replying to @username" */}
      {post.replyOf && (
        <div style={{ fontStyle: 'italic', color: '#666', marginBottom: '6px' }}>
          <span>Replying to </span>
          <span
            style={{
              color: '#1da1f2',
              cursor: 'pointer',
            }}
            onClick={handleReplyUserClick}
          >
            {post.replyOf.user.name} · @{post.replyOf.user.username}
          </span>
        </div>
      )}

      {/* The main post content */}
      <p style={{ margin: '0.5rem 0' }}>{post.content}</p>

      {post.media && post.media.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {(() => {
            const mediaCount = post.media.length;

            if (mediaCount === 1) {
              const url = post.media[0];
              const isVideo = /\.(mp4|mov|webm)$/i.test(url);
              return (
                <div style={{ width: '100%' }}>
                  {isVideo ? (
                    <video src={url} controls style={{ width: '100%' }} />
                  ) : (
                    <img src={url} alt="media-0" style={{ width: '100%', height: 'auto' }} />
                  )}
                </div>
              );
            }

            if (mediaCount === 2) {
              return post.media.map((url, i) => {
                const isVideo = /\.(mp4|mov|webm)$/i.test(url);
                return (
                  <div key={i} style={{ width: '48%' }}>
                    {isVideo ? (
                      <video src={url} controls style={{ width: '100%' }} />
                    ) : (
                      <img
                        src={url}
                        alt={`media-${i}`}
                        style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                );
              });
            }

            if (mediaCount === 3) {
              return (
                <>
                  <div style={{ width: '48%' }}>
                    {(() => {
                      const url = post.media[0];
                      const isVideo = /\.(mp4|mov|webm)$/i.test(url);
                      return isVideo ? (
                        <video src={url} controls style={{ width: '100%' }} />
                      ) : (
                        <img
                          src={url}
                          alt="media-0"
                          style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                        />
                      );
                    })()}
                  </div>
                  <div style={{ width: '48%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[post.media[1], post.media[2]].map((url, i) => {
                      const isVideo = /\.(mp4|mov|webm)$/i.test(url);
                      return (
                        <div key={i} style={{ height: '120px' }}>
                          {isVideo ? (
                            <video src={url} controls style={{ width: '100%', height: '100%' }} />
                          ) : (
                            <img
                              src={url}
                              alt={`media-${i + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            }

            if (mediaCount === 4) {
              return post.media.map((url, i) => {
                const isVideo = /\.(mp4|mov|webm)$/i.test(url);
                return (
                  <div key={i} style={{ width: '48%', height: '180px' }}>
                    {isVideo ? (
                      <video src={url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img
                        src={url}
                        alt={`media-${i}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                );
              });
            }

            // Fallback (more than 4)
            return post.media.map((url, i) => {
              const isVideo = /\.(mp4|mov|webm)$/i.test(url);
              return (
                <div key={i} style={{ width: '100%' }}>
                  {isVideo ? (
                    <video src={url} controls style={{ width: '100%' }} />
                  ) : (
                    <img src={url} alt={`media-${i}`} style={{ width: '100%' }} />
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
};

export default PostContent;