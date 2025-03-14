import { action } from "./_generated/server";
import { v } from "convex/values";

import OpenAI from "openai";
import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateAudioAction = action({
  args: { input: v.string(), voice: v.string() },
  handler: async (_, { voice, input }) => {
    try {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice as SpeechCreateParams["voice"],
        input,
      });

      const buffer = await mp3.arrayBuffer();

      return buffer;
    } catch (error: any) {
      console.log("OpenAI error:", error);

      if (error.status === 429) {
        throw new Error("Rate limit exceeded");
      } else {
        throw new Error(`Error generating thumbnail: ${error.message}`);
      }
    }
  },
});

export const generateThumbnailAction = action({
  args: { prompt: v.string() },
  handler: async (_, { prompt }) => {
    const reponse = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const url = reponse.data[0].url;

    if (!url) {
      throw new Error("Error generating Thumbnail");
    }

    const imageResponse = await fetch(url);
    const buffer = await imageResponse.arrayBuffer();
    return buffer;
  },
});
