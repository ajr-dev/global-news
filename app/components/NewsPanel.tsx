import React from 'react';

interface NewsPanelProps {
  onClose: () => void;
}

const NewsPanel: React.FC<NewsPanelProps> = ({ onClose }) => {
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', backgroundColor: 'white', overflowY: 'scroll' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10 }}>Close</button>
      <h2>News</h2>
      <div>
        <h3>Title 1</h3>
        <p>Short description 1</p>
        <a href="https://example.com" target="_blank">Read more</a>
      </div>
      <div>
        <h3>Title 2</h3>
        <p>Short description 2</p>
        <a href="https://example.com" target="_blank">Read more</a>
      </div>
      {/* Add more news items as needed */}
    </div>
  );
};

export default NewsPanel;