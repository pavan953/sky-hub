'use client';
import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import Loader from './Loader';

const VideoSummarizer = () => {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold text-white">Video Summarizer</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="url"
          placeholder="Enter video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-dark-3 text-white"
        />
        <Button type="submit" className="bg-blue-1">
          Summarize
        </Button>
      </form>

      {loading && <Loader />}

      {summary && (
        <div className="mt-6">
          <h2 className="mb-2 text-xl font-semibold text-white">Summary:</h2>
          <div className="rounded-lg bg-dark-3 p-4 text-white">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSummarizer;