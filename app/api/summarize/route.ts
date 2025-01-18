import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';
import ytdl from 'ytdl-core';
import { YoutubeTranscript } from 'youtube-transcript';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

async function getVideoTranscript(url: string) {
  try {
    const videoId = ytdl.getVideoID(url);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map(t => t.text).join(' ');
  } catch (error) {
    throw new Error('Failed to get video transcript');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
 
    // Get video transcript
    const transcript = await getVideoTranscript(url);

    // Chunk transcript if too long (Hugging Face has token limits)
    const chunkSize = 500;
    const chunks = transcript.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];

    // Summarize each chunk
    const summaries = await Promise.all(
      chunks.map(async (chunk) => {
        const result = await hf.summarization({
          model: 'facebook/bart-large-cnn',
          inputs: chunk,
          parameters: {
            max_length: 130,
            min_length: 30,
          },
        });
        return result.summary_text;
      })
    );

    // Combine summaries
    const finalSummary = summaries.join(' ');

    return NextResponse.json({ summary: finalSummary });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to summarize video' },
      { status: 500 }
    );
  }
}