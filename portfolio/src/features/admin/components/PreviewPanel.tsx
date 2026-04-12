'use client';

import { useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';

interface PreviewPanelProps {
  previewUrl?: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const devices = {
  desktop: {
    name: 'Desktop',
    icon: Monitor,
    width: '100%',
    height: '600px',
    maxWidth: '1440px',
  },
  tablet: {
    name: 'Tablet',
    icon: Tablet,
    width: '768px',
    height: '600px',
    maxWidth: '768px',
  },
  mobile: {
    name: 'Mobile',
    icon: Smartphone,
    width: '375px',
    height: '600px',
    maxWidth: '375px',
  },
};

export function PreviewPanel({ previewUrl = '/' }: PreviewPanelProps) {
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(false);

  const currentDevice = devices[activeDevice];

  const handleDeviceChange = (device: DeviceType) => {
    setActiveDevice(device);
    setIsLoading(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700"
          >
            <ExternalLink size={16} />
            <span>Open in new tab</span>
          </a>
        </div>
        
        {/* Device Selector */}
        <div className="flex space-x-1 mt-4 bg-gray-100 p-1 rounded-lg">
          {Object.entries(devices).map(([key, device]) => {
            const Icon = device.icon;
            const isActive = activeDevice === key;
            
            return (
              <button
                key={key}
                onClick={() => handleDeviceChange(key as DeviceType)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                <span>{device.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Area */}
      <div className="p-4 bg-gray-50">
        <div className="flex justify-center">
          <div 
            className="bg-white rounded-lg shadow-lg overflow-hidden relative"
            style={{ 
              width: currentDevice.width,
              maxWidth: currentDevice.maxWidth,
              height: currentDevice.height,
            }}
          >
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-gray-600">Loading preview...</div>
              </div>
            )}

            {/* Preview Iframe */}
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              title={`${currentDevice.name} Preview`}
            />
          </div>
        </div>

        {/* Device Info */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {currentDevice.name} view ({currentDevice.width === '100%' ? 'Responsive' : currentDevice.width})
        </div>
      </div>

      {/* Tips */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Preview Tips:</p>
          <ul className="space-y-1 text-xs">
            <li>• Changes may take a moment to reflect in the preview</li>
            <li>• Use "Open in new tab" for full interactive testing</li>
            <li>• Mobile preview shows typical smartphone dimensions (375px)</li>
            <li>• Tablet preview shows typical tablet dimensions (768px)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}