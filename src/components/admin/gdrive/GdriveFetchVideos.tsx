'use client'

import { Download } from "@mui/icons-material";
import { Tooltip, CircularProgress, Button } from "@mui/material";
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
  const [loadingButtons, setLoadingButtons] = useState<{ [key: string]: boolean }>({});
  
  const observer = useRef<IntersectionObserver | null>(null);

  // Debounced function to prevent excessive API calls
  const debounce = (func: (...args: string[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: string[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Exponential backoff for handling 429 errors
  const fetchWithRetry = async (url: string, retries = 5) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching:", error);
        // if (error.message.includes("429") && i < retries - 1) {
        //   const backoffTime = delay * Math.pow(2, i) + Math.random() * 1000; // Randomized delay
        //   console.log(`Retrying in ${backoffTime / 1000}s...`);
        //   await new Promise((resolve) => setTimeout(resolve, backoffTime));
        // } else {
        //   throw error;
        // }
      }
    }
  };

  // Fetch videos with delay
  const fetchVideos = useCallback(
    debounce(async (pageToken: string | null = null) => {
      if (loading || pageToken === undefined) return;

      setLoading(true);

      try {
        console.log("Fetching videos with pageToken:", pageToken);
        const data = await fetchWithRetry(`/api/drive/drive_sa?pageToken=${pageToken || ""}`);

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
    }, 1500), // Debounce delay
    [loading]
  );

  useEffect(() =>
  {
    fetchVideos()
  }, [])

  // Infinite Scroll Observer
  const lastVideoRef = useCallback((node: HTMLDivElement | null) =>
  {
    if (loading || !nextPageToken)
      return

    if (observer.current)
      observer.current.disconnect()

    observer.current = new IntersectionObserver(
      (entries) =>
      {
        if (entries[0].isIntersecting)
        {
          console.log("Last video visible, loading more...")
          fetchVideos(nextPageToken)
        }
      },
      { rootMargin: "200px", threshold: 1.0 }
    )

    if (node) observer.current.observe(node)
  }, [nextPageToken])

  const handleDownload = async (video: Video) =>
  {
    setLoadingButtons((prev) => ({ ...prev, [video.id]: true }))

    try
    {
      await new Promise((resolve) => setTimeout(resolve, 2000)) // delay pra mugawas pa ang loading chuchu moew moew
      window.open(`https://drive.google.com/uc?export=download&id=${video.id}`, "_blank")
    } catch (error) {
      console.error("Error downloading file:", error)
    } finally {
      setLoadingButtons((prev) => ({ ...prev, [video.id]: false }))
    }
  }

  return (
    <>
      <header className="bg-blue-600 text-white p-4 mb-3 mt-3 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold">Recorded Videos</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <div
            key={video.id}
            ref={index === videos.length - 1 ? lastVideoRef : null}
            className="border p-4 shadow-md rounded-lg"
          >
            <h3 className="text-lg font-bold mb-3">{video.name.split('.mp4')[0]}</h3>
            <a href={`https://drive.google.com/file/u/1/d/${video.id}/view?usp=drive_web`} target="_blank" rel="noopener noreferrer">
              <img
                src={video.thumbnailLink}
                alt={video.name}
                className="w-full h-auto rounded-t-lg"
              />
            </a>
            <Tooltip key={video.id + '-' + index} title="Click to download">
              <Button
                key={video.id + '-' + index}
                variant="contained"
                onClick={() => handleDownload(video)}
                disabled={loadingButtons[video.id]}
                className="w-full flex justify-center items-center bg-blue-600 text-white hover:bg-blue-700 !rounded-none !rounded-b-lg"
              >
                {loadingButtons[video.id] ? <CircularProgress size={24} color="inherit" /> : <Download fontSize="medium" />}
              </Button>
            </Tooltip>
          </div>
        ))}
      </div>
      {loading && <p className="text-center mt-4">Loading more videos...</p>}
    </>
  );
};

export default VideoList;
