import React from 'react';
import { VideoCameraIcon, ExclamationIcon } from '@heroicons/react/outline';

interface CameraListItemProps {
  camera: {
    id: number;
    name: string;
    status: 'online' | 'offline';
    stream_url: string;
  };
  selected?: boolean;
  onClick?: () => void;
}

export const CameraListItem: React.FC<CameraListItemProps> = ({
  camera,
  selected,
  onClick
}) => {
  return (
    <div
      className={`
        flex items-center p-4 cursor-pointer
        ${selected ? 'bg-indigo-50 dark:bg-indigo-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
      `}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <VideoCameraIcon
          className={`h-6 w-6 ${
            camera.status === 'online' ? 'text-green-500' : 'text-red-500'
          }`}
        />
      </div>
      <div className="ml-4 flex-1">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {camera.name}
        </h3>
        <div className="flex items-center mt-1">
          {camera.status === 'offline' && (
            <ExclamationIcon className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-xs ${
            camera.status === 'online'
              ? 'text-green-500'
              : 'text-red-500'
          }`}>
            {camera.status === 'online' ? 'En línea' : 'Desconectada'}
          </span>
        </div>
      </div>
    </div>
  );
}; 