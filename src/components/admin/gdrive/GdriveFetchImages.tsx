'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'antd';

interface ImageFile {
  id: string;
  name: string;
  mimeType: string;
  webContentLink?: string;
  webViewLink?: string;
  createdTime: string;
}

type GroupedImages = Record<string, ImageFile[]>;

const GdriveFetchImages: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [groupedImages, setGroupedImages] = useState<GroupedImages>({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/drive/fetchImg');
        const data: ImageFile[] = await res.json();
        setImages(data);
      } catch (err) {
        console.error('Failed to fetch images:', err);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const grouped = images.reduce((acc: GroupedImages, file) => {
      const date = new Date(file.createdTime).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(file);
      return acc;
    }, {});

    const sorted = Object.keys(grouped)
      .sort((a, b) => {
        const dateA = new Date(a).getTime();
        const dateB = new Date(b).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      })
      .reduce((obj: GroupedImages, key) => {
        obj[key] = grouped[key];
        return obj;
      }, {});

    setGroupedImages(sorted);
  }, [images, sortOrder]);

  return (
    <div>
      <div className="mb-4">
        <Button onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}>
          Sort by Date: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </Button>
      </div>

      {Object.entries(groupedImages).map(([date, files]) => (
  <div key={date} className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold">{date}</h3>
      <Button
        type="primary"
        size="small"
        onClick={() => {
          files.forEach((file) => {
            const a = document.createElement('a');
            a.href = file.webContentLink!;
            a.download = file.name;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.click();
          });
        }}
      >
        Download All
      </Button>
    </div>

    <div className="flex flex-wrap gap-3">
      {files.map((file) => (
        <div key={file.id} className="w-40 flex flex-col items-center">
          <img
            src={`https://drive.google.com/thumbnail?id=${file.id}&sz=w400`}
            alt={file.name}
            className="w-full h-auto rounded shadow-md"
          />
          <a
            href={file.webContentLink}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 mt-1 hover:underline"
          >
            Download
          </a>
        </div>
      ))}
    </div>
  </div>
))}

    </div>
  );
};

export default GdriveFetchImages;
