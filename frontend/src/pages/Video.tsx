import { useState, useEffect } from "react";
import Header from "../components/Header";
import axios, { type AxiosResponse } from "axios";
import {
  FiScissors,
  FiLoader,
  FiAlertTriangle,
  FiArrowRight,
} from "react-icons/fi";
import "../StarryBackground.css";

const API = import.meta.env.VITE_BaseAPI;

export interface VideoFormat {
  formatId: string;
  resolution: string;
  ext: string;
}

export interface VideoInfoResponse {
  title: string;
  thumbnail: string;
  duration: number;
  formats: VideoFormat[];
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const downloadFileFromBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

function Video() {
  const [videoData, setVideoData] = useState<VideoInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inputUrl, setInputUrl] = useState("");
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:10");

  useEffect(() => {
    if (videoData?.formats?.length) {
      setSelectedFormatId(videoData.formats[0].formatId);
    }
  }, [videoData]);

  const handleGetVideoInfo = async () => {
    if (!inputUrl) {
      setError("Please paste a URL first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setVideoData(null);

    try {
      const response = await axios.post(
        `${API}/api/videos/info`,
        { url: inputUrl },
        { withCredentials: true }
      );
      setVideoData(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch video info. Please check the URL and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoData || !selectedFormatId) {
      setError("Video data or format not available.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const endpoint = `${API}/api/videos/trim`;

    const payload: any = {
      url: inputUrl,
      formatId: selectedFormatId,
    };
    payload.startTime = startTime;
    payload.endTime = endTime;

    try {
      const response: AxiosResponse<Blob> = await axios.post(
        endpoint,
        payload,
        {
          withCredentials: true,
          responseType: "blob",
        }
      );
      const filename = "vortex-clip.mp4";
      downloadFileFromBlob(response.data, filename);
    } catch (err: any) {
      let errorMessage = `Failed to trim video.`;

      if (
        err.response &&
        err.response.data &&
        err.response.data instanceof Blob
      ) {
        try {
          if (err.response.data.type === "application/json") {
            const errorJsonText = await err.response.data.text();
            const errorData = JSON.parse(errorJsonText);
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          console.error("Could not parse error blob:", parseError);
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Animated Starry Background */}
      <div className="stars stars1"></div>
      <div className="stars stars2"></div>
      <div className="stars stars3"></div>
      <div className="stars stars4"></div>
      <div className="stars stars5"></div>
      <div className="stars stars6"></div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Main "Glass" Card */}
          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-700/50 shadow-lg">
            <h1 className="text-3xl font-bold text-purple-400 mb-6 text-center">
              Vortex Video Toolkit
            </h1>

            {/* URL Input Form */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Paste your YouTube URL here..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                disabled={isLoading}
                className="flex-grow bg-gray-900/50 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
              <button
                onClick={handleGetVideoInfo}
                disabled={isLoading || !inputUrl}
                className="bg-purple-700 cursor-pointer hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center disabled:bg-gray-600/50 disabled:cursor-not-allowed"
              >
                {isLoading && !videoData ? (
                  <FiLoader className="animate-spin mr-2" />
                ) : (
                  "Fetch Info"
                )}
                <FiArrowRight className="ml-2" />
              </button>
            </div>

            {/* Loading and Error States */}
            {isLoading && (
              <div className="flex items-center justify-center mt-6 text-lg text-purple-300">
                <FiLoader className="animate-spin mr-3" /> Processing your
                video...
              </div>
            )}
            {error && (
              <div className="flex items-center mt-6 text-red-400 bg-red-500/20 p-3 rounded-md border border-red-500/30">
                <FiAlertTriangle className="mr-3" /> {error}
              </div>
            )}

            {/* Results View */}
            {videoData && (
              <div className="mt-8 animate-fade-in">
                <div className="grid md:grid-cols-3 gap-6 bg-black/20 rounded-lg">
                  <img
                    src={videoData.thumbnail}
                    alt={videoData.title}
                    className="rounded-lg md:col-span-1 w-full border-2 border-purple-900"
                  />
                  <div className="md:col-span-2">
                    <h2 className="text-2xl text-purple-700 font-bold">
                      {videoData.title}
                    </h2>
                    <p className="text-gray-400">
                      Duration: {formatDuration(videoData.duration)}
                    </p>

                    <div className="mt-4">
                      <label
                        htmlFor="format-select"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Select Quality:
                      </label>
                      <select
                        id="format-select"
                        value={selectedFormatId || ""}
                        onChange={(e) => setSelectedFormatId(e.target.value)}
                        className="w-full cursor-pointer bg-gray-900/50 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {videoData.formats.map((format) => (
                          <option key={format.formatId} value={format.formatId}>
                            {format.resolution} ({format.ext.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 border-t border-purple-800/50 pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Trim Section */}
                    <div className="flex-1 bg-black/20 p-4 rounded-lg border border-purple-800/50">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          placeholder="Start (HH:MM:SS)"
                          className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          placeholder="End (HH:MM:SS)"
                          className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <button
                        onClick={() => handleDownload()}
                        disabled={isLoading}
                        className="w-full cursor-pointer bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center disabled:bg-gray-600/50 disabled:cursor-not-allowed"
                      >
                        <FiScissors className="mr-2" /> Trim & Download Clip
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default Video;
