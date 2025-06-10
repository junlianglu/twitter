// src/components/posts/QuoteComposer.js
import React, { useState } from 'react';

const QuoteComposer = ({ onSubmit, onCancel }) => {
  const [text, setText] = useState('');

  const handleClickSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <textarea
        rows={2}
        style={{ width: '100%', padding: '5px' }}
        placeholder="Add your quote text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{ marginTop: '5px', display: 'flex', gap: '10px' }}>
        <button onClick={handleClickSubmit}>Submit Quote</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default QuoteComposer;