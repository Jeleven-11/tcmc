"use client";

import { useEffect, useState } from "react";

type Video = {
  id: string;
  name: string;
  webContentLink: string;
  thumbnailLink: string;
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    fetch("/api/drive")
      .then((res) => res.json())
      .then((data) => setVideos(data));
  }, []);

  return (
    <div>
      <h1>Google Drive Videos</h1>
      <div className="grid grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="border p-4">
            <h3 className="text-lg font-bold">{video.name}</h3>
            <a href={video.webContentLink} target="_blank" rel="noopener noreferrer">
              <img src={video.thumbnailLink} alt={video.name} className="w-full h-auto" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
