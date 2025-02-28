'use client'



import React, { useState, useEffect, useRef, useCallback } from "react";

interface Video {
  id: string;
  name: string;
  thumbnailLink: string;
  webContentLink: string;
}

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const observer = useRef<IntersectionObserver | null>(null);

  // Fetch videos from API
  const fetchVideos = async (pageToken: string | null = null) => {
    if (loading || pageToken === undefined) return; // Prevent unnecessary calls

    setLoading(true);

    try {
      console.log("Fetching videos with pageToken:", pageToken);

      const res = await fetch(`/api/drive/drive_sa?pageToken=${pageToken || ""}`);
      const data = await res.json();

      console.log("API Response:", data);

      if (data.videos && data.videos.length > 0) {
        setVideos((prev) => {
          const newVideos = data.videos.filter(
            (video: { id: string }) => !prev.some((v) => v.id === video.id)
          );
          return [...prev, ...newVideos];
        });
        setNextPageToken(data.nextPageToken || null);
      } else {
        setNextPageToken(null);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial videos
  useEffect(() => {
    fetchVideos();
  }, []);

  // Infinite Scroll Observer
  const lastVideoRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || !nextPageToken) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Last video visible, loading more...");
          fetchVideos(nextPageToken);
        }
      },
      { rootMargin: "200px", threshold: 1.0 }
    );

    if (node) observer.current.observe(node);
  }, [nextPageToken])

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Google Drive Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <div
            key={video.id}
            ref={index === videos.length - 1 ? lastVideoRef : null}
            className="border p-4 shadow-md rounded-lg"
          >
            <h3 className="text-lg font-bold">{video.name}</h3>
            <a href={video.webContentLink} target="_blank" rel="noopener noreferrer">
              <img
                src={video.thumbnailLink}
                alt={video.name}
                className="w-full h-auto rounded"
              />
            </a>
          </div>
        ))}
      </div>
      {loading && <p className="text-center mt-4">Loading more videos...</p>}
    </div>
  );
};

export default VideoList;
