import React, { useState, useContext, useRef } from 'react';
import { gql, useMutation } from '@apollo/client';
import { UserContext } from '../UserContext';

const BASE_URL = process.env.REACT_APP_API_URL;

const UPDATE_AVATAR = gql`
  mutation UpdateAvatar($avatar: String!) {
    updateAvatar(avatar: $avatar) {
      id
      name
      email
      username
      avatar
      token
    }
  }
`;

const ChangeAvatar = () => {
  const { user, login } = useContext(UserContext);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const [updateAvatar] = useMutation(UPDATE_AVATAR, {
    onCompleted: (data) => {
      login({ ...user, avatar: data.updateAvatar.avatar });
      setIsUploading(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err) => {
      setError(err.message);
      setIsUploading(false);
    }
  });

  // Auto-upload as soon as a file is chosen
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    setFile(selected);
    setError('');
    handleUpload(selected);
  };

  const handleUpload = async (selectedFile) => {
    const fileToUpload = selectedFile || file;
    if (!fileToUpload) {
      setError('No file selected.');
      return;
    }
    setIsUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('files', fileToUpload);

      const res = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const url = data.urls?.[0];
      if (!url) throw new Error('No file URL returned');
      updateAvatar({ variables: { avatar: url } });
    } catch (err) {
      setError(err.message);
      setIsUploading(false);
    }
  };

  return (
    <div style={{ margin: '20px 0', textAlign: 'center' }}>
      <div style={{ marginBottom: 10, position: 'relative', display: 'inline-block', cursor: isUploading ? 'not-allowed' : 'pointer' }}>
        <img
          src={file ? URL.createObjectURL(file) : user.avatar}
          alt="Current avatar"
          style={{
            width: 90, height: 90, borderRadius: '50%',
            objectFit: 'cover', border: '2px solid #333',
            marginBottom: 8, opacity: isUploading ? 0.5 : 1,
            transition: 'opacity 0.3s'
          }}
          onClick={() => !isUploading && fileInputRef.current && fileInputRef.current.click()}
          title="Click to change avatar"
        />
        {isUploading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: 90, height: 90,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              width: 28, height: 28, border: '3px solid #bbb',
              borderTop: '3px solid #0099ff', borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isUploading}
        style={{ display: 'none' }}
      />
      {error && <div style={{ color: 'red', marginTop: 6 }}>{error}</div>}
      <style>
      {`
      @keyframes spin {
        0% { transform: rotate(0deg);}
        100% { transform: rotate(360deg);}
      }
      `}
      </style>
    </div>
  );
};

export default ChangeAvatar;