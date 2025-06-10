import React, { useState, useContext, useRef } from 'react';
import { gql, useMutation } from '@apollo/client';
import { UserContext } from '../UserContext';
import { GET_POSTS } from '../pages/PublicFeed';
import './CreatePost.css';

const BASE_URL = process.env.REACT_APP_API_URL;


const CREATE_POST = gql`
  mutation CreatePost($content: String!, $media: [String!]) {
    createPost(content: $content, media: $media) {
      id
      content
      createdAt
      media
      user {
        id
        name
        avatar
      }
    }
  }
`;

const CreatePost = () => {
  const { user } = useContext(UserContext);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiError, setAiError] = useState("");

  const [createPost, { loading, error }] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS }],
    onCompleted: () => {
      setContent('');
      setFiles([]);
      setIsPosting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err) => {
      setIsPosting(false);
    },
  });

  const handleFileChange = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length > 4) {
      alert('You can upload up to 4 files only.');
      return;
    }
    setFiles(chosenFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;
    try {
      let s3Urls = [];
      const localFiles = files.filter(f => f instanceof File);
      const aiFiles = files.filter(f => f.url && f.isAI);
      if (localFiles.length > 0) {
        setIsPosting(true);
        const formData = new FormData();
        localFiles.forEach((file) => {
          formData.append('files', file);
        });
        const response = await fetch(`${BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload files');
        const data = await response.json();
        s3Urls = data.urls;
      }
      if (aiFiles.length > 0) {
        s3Urls = [...s3Urls, ...aiFiles.map(f => f.url)];
      }
      await createPost({
        variables: {
          content,
          media: s3Urls,
        },
      });
    } catch (err) {
      // Optionally handle error
    }
  };

  // Generate AI image handler with detailed OpenAI safety error handling
  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch(`${BASE_URL}/api/image-gen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        if (
          errorData.details &&
          errorData.details.includes('safety system')
        ) {
          setAiError("Your prompt was blocked by the AI safety system. Please try a different prompt.");
        } else if (errorData.details) {
          setAiError("Image generation failed: " + errorData.details);
        } else if (errorData.error) {
          setAiError("Image generation failed: " + errorData.error);
        } else {
          setAiError("Image generation failed. Please try again.");
        }
        setIsGeneratingImage(false);
        return;
      }
      const data = await res.json();
      const imageUrl = data.urls?.[0];
      if (imageUrl) {
        setFiles(prev =>
          prev.length < 4 ? [...prev, { name: `ai-${Date.now()}.png`, url: imageUrl, isAI: true }] : prev
        );
        setAiError("");
      }
      setIsGeneratingImage(false);
      setAiPrompt('');
      setShowAIModal(false);
      setAiError("");
    } catch (err) {
      setAiError("Image generation failed. Please try again.");
      setIsGeneratingImage(false);
    }
  };

  // Card style and layout
  return (
    <>
      <div className="createpost-card">
        {(isGeneratingImage || isPosting) && (
          <div className="createpost-spinner-overlay">
            <div className="createpost-spinner" />
            <div style={{ color: '#4262ff', fontWeight: 600, fontSize: 18, marginTop: 12 }}>
              {isGeneratingImage ? 'Generating image...' : 'Posting...'}
            </div>
          </div>
        )}
        <div className="createpost-row">
          <img
            src={user.avatar}
            alt="avatar"
            className="createpost-avatar"
          />
          <form
            onSubmit={handleSubmit}
            className="createpost-form"
          >
            <textarea
              rows={3}
              className="createpost-textarea"
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isGeneratingImage || isPosting}
            />
            <div className="createpost-buttonrow">
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                aria-label="Add media"
                title="Add media"
                className="createpost-iconbtn"
                disabled={isGeneratingImage || files.length >= 4}
              >
                <svg width="22" height="22" fill="#777" viewBox="0 0 24 24">
                  <path d="M7.5 4.5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2h2A2.5 2.5 0 0 1 21 7v10a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17V7A2.5 2.5 0 0 1 5.5 4.5h2zm2-1a1 1 0 0 0-1 1V6h7V4.5a1 1 0 0 0-1-1h-5zM5.5 6A1.5 1.5 0 0 0 4 7v10A1.5 1.5 0 0 0 5.5 18.5h13A1.5 1.5 0 0 0 20 17V7a1.5 1.5 0 0 0-1.5-1.5h-13zM12 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-4.5 8 2.25-3 1.5 2L16.5 12l3 5H6.5z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => { setAiError(""); setShowAIModal(true); }}
                aria-label="Generate image with AI"
                title="Generate image with AI"
                className="createpost-iconbtn"
                disabled={isGeneratingImage || files.length >= 4}
                style={{ marginLeft: 2 }}
              >
                <svg width="20" height="20" fill="#9f69e4" viewBox="0 0 20 20">
                  <path d="M10 1l2.09 6.26L18 7.27l-5 3.64L14.18 18 10 14.27 5.82 18 7 10.91l-5-3.64 5.91-.01z"/>
                </svg>
              </button>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,video/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                disabled={isGeneratingImage || files.length >= 4}
              />
              {files.length < 4 && (
                <span style={{ color: '#888', fontSize: '0.97rem' }}></span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              {files.map((file, idx) => {
                let src;
                if (file instanceof File) src = URL.createObjectURL(file);
                else if (file.url) src = file.url;
                return (
                  <div key={idx} className="createpost-filepreview">
                    <img
                      src={src}
                      alt={file.name || `media-${idx}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 7,
                        cursor: 'pointer',
                      }}
                      onClick={() => setPreviewIndex(idx)}
                    />
                    <button
                      type="button"
                      onClick={() => setFiles(files => files.filter((_, i) => i !== idx))}
                      className="createpost-removebtn"
                      aria-label="Remove media"
                    >×</button>
                  </div>
                );
              })}
            </div>
            {error && (
              <p className="createpost-error">
                Error: {error.message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || isPosting || isGeneratingImage}
              className="createpost-submitbtn"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
        {previewIndex !== null && (
          <div
            onClick={() => setPreviewIndex(null)}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 99,
            }}
          >
            <img
              src={
                files[previewIndex] instanceof File
                  ? URL.createObjectURL(files[previewIndex])
                  : files[previewIndex].url
              }
              alt="Preview"
              style={{
                maxWidth: '90vw', maxHeight: '90vh',
                borderRadius: 10, boxShadow: '0 2px 8px #000',
              }}
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setPreviewIndex(null)}
              style={{
                position: 'absolute', top: 24, right: 40,
                fontSize: 30, background: 'none', border: 'none', color: '#fff',
                cursor: 'pointer',
              }}
              aria-label="Close"
            >×</button>
          </div>
        )}
        {showAIModal && (
          <div
            className="createpost-aimodal-overlay"
            onClick={() => {
              if (!isGeneratingImage) {
                setShowAIModal(false);
                setAiError("");
              }
            }}
          >
            <div
              className="createpost-aimodal"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => { setShowAIModal(false); setAiError(""); }}
                disabled={isGeneratingImage}
                aria-label="Close"
                className="createpost-aimodal-close"
              >×</button>
              <div className="createpost-aimodal-title">Generate AI Image</div>
              {aiError && (
                <div className="createpost-aimodal-error">
                  {aiError}
                </div>
              )}
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Describe your image prompt"
                disabled={isGeneratingImage}
                className="createpost-aimodal-input"
              />
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !aiPrompt.trim()}
                className="createpost-aimodal-submit"
              >
                {isGeneratingImage ? 'Generating...' : 'Generate Image'}
              </button>
              {isGeneratingImage && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <div className="createpost-spinner" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreatePost;