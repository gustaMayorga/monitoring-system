import React from 'react';
import {
  PlayIcon,
  PauseIcon,
  PhotographIcon,
  DownloadIcon
} from '@heroicons/react/outline';

interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTakeSnapshot: () => void;
  onDownloadRecording?: () => void;
  disabled?: boolean;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onTakeSnapshot,
  onDownloadRecording,
  disabled = false
}) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={isRecording ? onStopRecording : onStartRecording}
        disabled={disabled}
        className={`
          p-2 rounded-lg
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : isRecording
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
          }
        `}
      >
        {isRecording ? (
          <PauseIcon className="h-5 w-5" />
        ) : (
          <PlayIcon className="h-5 w-5" />
        )}
      </button>

      <button
        onClick={onTakeSnapshot}
        disabled={disabled}
        className={`
          p-2 rounded-lg bg-blue-100 text-blue-700
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-blue-200'
          }
        `}
      >
        <PhotographIcon className="h-5 w-5" />
      </button>

      {onDownloadRecording && (
        <button
          onClick={onDownloadRecording}
          disabled={disabled || !isRecording}
          className={`
            p-2 rounded-lg bg-indigo-100 text-indigo-700
            ${disabled || !isRecording
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-indigo-200'
            }
          `}
        >
          <DownloadIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}; 