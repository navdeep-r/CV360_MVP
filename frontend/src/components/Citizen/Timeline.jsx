// Timeline.jsx
import React from 'react';
import { Clock } from 'lucide-react';
import formatDate from '../../utils/formatDate';

const Timeline = ({ timeline = [] }) => {
  if (!timeline.length) return null;
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Timeline</h3>
      <ol className="relative border-l border-gray-200">
        {timeline.map((event, idx) => (
          <li key={idx} className="mb-6 ml-4">
            <div className="absolute w-3 h-3 bg-indigo-200 rounded-full -left-1.5 border border-white"></div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">{formatDate(event.timestamp)}</span>
              <span className="text-xs text-gray-700 font-medium">{event.action}</span>
            </div>
            {event.comment && <div className="text-sm text-gray-600 ml-6">{event.comment}</div>}
            {event.performedBy && <div className="text-xs text-gray-400 ml-6">By: {event.performedBy.name || event.performedBy}</div>}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Timeline; 