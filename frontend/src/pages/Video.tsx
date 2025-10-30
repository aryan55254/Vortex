import { useState, useEffect } from "react";
import Header from "../components/Header";
import { io, Socket } from "socket.io-client";
import axios, { type AxiosResponse } from "axios";
import {
  FiScissors,
  FiLoader,
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiDownload,
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

const timeStringToSeconds = (time: string): number => {
  const parts = time.split(":");
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (isNaN(minutes) || isNaN(seconds)) return 0;
    return minutes * 60 + seconds;
  }
  return 0;
};

function Video() {
  const [videoData, setVideoData] = useState<VideoInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setsocket] = useState<Socket | null>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:10");
  const [jobId, setjobId] = useState("");
  const [jobStatus, setjobStatus] = useState("");
  const [jobError, setjobError] = useState("");
  const [videoUrl, setvideoUrl] = useState("");
  const [isconnected, setisconnected] = useState(false);
  const isProcessing = jobStatus === "queued" || jobStatus === "processing";

  useEffect(() => {
    const newSocket = io(API, { withCredentials: true });
    setsocket(newSocket);
    newSocket.on("connect", () => {
      setisconnected(true);
      console.log("Connected!");
    });
    newSocket.on("disconnect", () => {
      setisconnected(false);
      console.log("Disconnected!");
    });
    return () => {
      console.log("Disconnecting socket on unmount...");
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (videoData?.formats?.length) {
      setSelectedFormatId(videoData.formats[0].formatId);
    }
  }, [videoData]);

  useEffect(() => {
    if (socket) {
      socket.on("job-queued", (data) => {
        setjobId(data.jobId);
        setjobStatus("queued");
        setjobError("");
        setvideoUrl("");
        setisconnected(true);
      });
      socket.on("job-completed", (data) => {
        const url = `${API}${data.downloadUrl}`;
        setjobStatus("completed");
        setvideoUrl(url);
        setisconnected(true);
      });
      socket.on("job-failed", (data) => {
        setjobStatus("failed");
        setjobError(data.error);
        setisconnected(true);
      });
      socket.on("connect_error", (err) => {
        setError(err.message);
        setisconnected(false);
      });
      socket.on("disconnect", () => {
        setisconnected(false);
      });
    }
    return () => {
      socket?.off("job-queued");
      socket?.off("job-completed");
      socket?.off("job-failed");
      socket?.off("connect_error");
      socket?.off("disconnect");
    };
  }, [socket]);

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

  const handleTrimRequest = () => {
    if (!socket || !isconnected) {
      setError("Not connected to the processing server.");
      return;
    }
    if (!videoData || !selectedFormatId) {
      setError("Video data or format not available.");
      return;
    }
    setError(null);
    setjobError("");
    setvideoUrl("");
    const startTimeInSeconds = timeStringToSeconds(startTime);
    const endTimeInSeconds = timeStringToSeconds(endTime);

    if (startTimeInSeconds >= endTimeInSeconds) {
      setError("Start time must be before end time.");
      setjobStatus("failed");
      return;
    }
    if (endTimeInSeconds > videoData.duration) {
      setError("End time cannot be beyond the video duration.");
      setjobStatus("failed");
      return;
    }

    setjobStatus("processing");
    setjobId("");

    const payload = {
      url: inputUrl,
      formatId: selectedFormatId,
      startTime: startTimeInSeconds,
      endTime: endTimeInSeconds,
    };
    socket.emit("start-trim", payload);
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
                disabled={isLoading || isProcessing}
                className="flex-grow bg-gray-900/50 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
              />
              <button
                onClick={handleGetVideoInfo}
                disabled={isLoading || !inputUrl || isProcessing}
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

            {/* Connection Status Indicator */}
            {!isconnected && !error && (
              <div className="flex items-center justify-center mt-4 text-yellow-400 animate-pulse">
                <FiLoader className="animate-spin mr-2" /> Connecting...
              </div>
            )}
            {isconnected && jobStatus === "idle" && (
              <div className="flex items-center justify-center mt-4 text-green-400 text-sm">
                <FiCheckCircle className="mr-2" /> Connected & Ready.
              </div>
            )}

            {/* Loading (for Fetch Info ONLY) and General Error States */}
            {isLoading && (
              <div className="flex items-center justify-center mt-6 text-lg text-purple-300">
                <FiLoader className="animate-spin mr-3" /> Fetching video
                info...
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
                {/* Video Info Display */}
                <div className="grid md:grid-cols-3 gap-6 bg-black/20 p-4 rounded-lg border border-purple-800/50 mb-6">
                  <img
                    src={
                      videoData.thumbnail ||
                      "https://placehold.co/600x400/2a004a/ffffff?text=Thumbnail\\nNot+Available"
                    }
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/600x400/2a004a/ffffff?text=Thumbnail\\nError";
                    }}
                    alt={videoData.title}
                    className="rounded-lg md:col-span-1 w-full border-2 border-purple-900 object-cover"
                  />
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold text-purple-300">
                      {videoData.title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Duration: {formatDuration(videoData.duration)}
                    </p>
                    {/* Format Selector */}
                    <div className="mt-4">
                      <label
                        htmlFor="format-select"
                        className="block text-xs font-medium text-gray-300 mb-1"
                      >
                        Select Quality:
                      </label>
                      <select
                        id="format-select"
                        value={selectedFormatId || ""}
                        onChange={(e) => setSelectedFormatId(e.target.value)}
                        disabled={isProcessing}
                        className="w-full cursor-pointer bg-gray-900/50 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      >
                        {!selectedFormatId && (
                          <option value="" disabled>
                            -- Select --
                          </option>
                        )}
                        {videoData.formats.map((format) => (
                          <option key={format.formatId} value={format.formatId}>
                            {format.resolution} ({format.ext.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Trim Section */}
                <div className="bg-black/20 p-4 rounded-lg border border-purple-800/50">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">
                    Trim Video
                  </h3>
                  {/* Time Inputs */}
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="Start (HH:MM:SS)"
                      disabled={isProcessing}
                      className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="End (HH:MM:SS)"
                      disabled={isProcessing}
                      className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Trim Button */}
                  <button
                    onClick={handleTrimRequest}
                    disabled={isProcessing || !isconnected || !selectedFormatId}
                    className="w-full cursor-pointer bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center disabled:bg-gray-600/50 disabled:cursor-not-allowed mb-4"
                  >
                    <FiScissors className="mr-2" />
                    {jobStatus === "idle" && "Start Trim Job"}
                    {jobStatus === "queued" && "Waiting in Queue..."}
                    {jobStatus === "processing" && (
                      <>
                        {" "}
                        <FiLoader className="animate-spin mr-2" /> Processing...{" "}
                      </>
                    )}
                    {jobStatus === "completed" && "Trim Another Clip"}
                    {jobStatus === "failed" && "Retry Trim"}
                  </button>

                  {/* Status/Result Area */}
                  <div className="mt-4 min-h-[60px]">
                    {jobStatus === "queued" && jobId && (
                      <div className="flex items-center text-blue-400 bg-blue-500/10 p-3 rounded-md border border-blue-500/30 animate-pulse">
                        <FiClock className="mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">
                            Your trim job is in the queue.
                          </p>
                          <p className="text-sm">Job ID: {jobId}</p>
                        </div>
                      </div>
                    )}
                    {jobStatus === "processing" && (
                      <div className="flex items-center text-purple-300 bg-purple-500/10 p-3 rounded-md border border-purple-500/30 animate-pulse">
                        <FiLoader className="animate-spin mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">
                            Processing your video clip...
                          </p>
                          <p className="text-sm">
                            This may take a few moments depending on the length.
                          </p>
                          {jobId && (
                            <p className="text-xs text-gray-400">
                              Job ID: {jobId}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {jobStatus === "failed" && jobError && (
                      <div className="flex items-center text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/30">
                        <FiXCircle className="mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Job Failed</p>
                          <p className="text-sm">{jobError}</p>
                          {jobId && (
                            <p className="text-xs text-gray-400">
                              Job ID: {jobId}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {jobStatus === "completed" && videoUrl && (
                      <div className="flex flex-col sm:flex-row items-center justify-between text-green-400 bg-green-500/10 p-3 rounded-md border border-green-500/30">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <FiCheckCircle className="mr-3 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">Your clip is ready!</p>
                            {jobId && (
                              <p className="text-xs text-gray-400">
                                Job ID: {jobId}
                              </p>
                            )}
                          </div>
                        </div>
                        <a
                          href={videoUrl}
                          download="vortex-clip.mp4"
                          className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center text-sm"
                        >
                          <FiDownload className="mr-2" /> Download Clip
                        </a>
                      </div>
                    )}
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
