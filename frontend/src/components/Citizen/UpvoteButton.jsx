// UpvoteButton.jsx
import React from 'react';
import { ThumbsUp } from 'lucide-react';

const UpvoteButton = ({ count = 0, upvoted = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded transition font-medium text-sm ${upvoted ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}`}
      disabled={upvoted}
      title={upvoted ? 'You already upvoted' : 'Upvote if this affects you too!'}
    >
      <ThumbsUp className={`h-4 w-4 ${upvoted ? 'fill-indigo-600' : ''}`} />
      {count}
    </button>
  );
};

export default UpvoteButton; 