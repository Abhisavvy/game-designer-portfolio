'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { ImageUploader } from './ImageUploader';

interface GalleryItem {
  thumb: string;
  full: string;
  alt: string;
  label: string;
}

interface GalleryManagerProps {
  projectSlug: string;
  initialItems: GalleryItem[];
  onItemsChange: (items: GalleryItem[]) => void;
}

export function GalleryManager({ projectSlug, initialItems, onItemsChange }: GalleryManagerProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
    onItemsChange(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
    onItemsChange(newItems);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onItemsChange(newItems);
  };

  const handleAddImage = (asset: any) => {
    const newItem: GalleryItem = {
      thumb: asset.publicUrl,
      full: asset.publicUrl,
      alt: asset.metadata.altText,
      label: asset.metadata.usageContext,
    };
    
    const newItems = [...items, newItem];
    setItems(newItems);
    onItemsChange(newItems);
    setShowUploader(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-900">Process Gallery Images</h4>
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors border border-orange-200"
        >
          <Plus size={16} />
          <span>Add Image</span>
        </button>
      </div>

      {showUploader && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <ImageUploader
            projectSlug={projectSlug}
            category="gallery"
            maxFiles={1}
            onUploadComplete={handleAddImage}
          />
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="mx-auto mb-2" size={48} />
          <p>No gallery images yet. Add your first image above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.full}-${index}`}
              className="flex items-center space-x-4 p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === items.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
              
              <img
                src={item.thumb}
                alt={item.alt}
                className="w-16 h-16 object-cover rounded-md border border-gray-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/placeholder-image.svg';
                }}
              />
              
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{item.label}</h5>
                <p className="text-sm text-gray-600">{item.alt}</p>
                <p className="text-xs text-gray-500">{item.full}</p>
              </div>
              
              <button
                onClick={() => handleDeleteItem(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                title="Remove image"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="font-medium mb-1">Gallery Management Tips:</p>
        <ul className="space-y-1 text-xs">
          <li>• Use arrow buttons to reorder images</li>
          <li>• Images appear in the case study process section</li>
          <li>• Use descriptive labels and alt text for accessibility</li>
          <li>• Changes save automatically to site-content.ts</li>
        </ul>
      </div>
    </div>
  );
}