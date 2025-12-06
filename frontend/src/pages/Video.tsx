import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import {
  FiScissors,
  FiLoader,
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiDownload,
  FiUploadCloud,
  FiFile,
} from "react-icons/fi";
import "../StarryBackground.css";

const API = import.meta.env.VITE_BaseAPI;
const MAX_FILE_SIZE_MB = 100;

function Video() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // State for Processing
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:10");
  const [processingProgress, setProcessingProgress] = useState(0);

  // Job State
  const [jobId, setJobId] = useState("");
  const [jobStatus, setJobStatus] = useState<
    | "idle"
    | "uploading"
    | "ready_to_process"
    | "queued"
    | "processing"
    | "completed"
    | "failed"
  >("idle");
  const [jobError, setJobError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newSocket = io(API, { withCredentials: true });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to Vortex Socket");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !jobId) return;

    const progressEvent = `job-progress-${jobId}`;
    socket.on(progressEvent, (percentage: number) => {
      setJobStatus("processing");
      setProcessingProgress(percentage);
    });

    const completedEvent = `job-completed-${jobId}`;
    socket.on(completedEvent, (data: any) => {
      setJobStatus("completed");
      setDownloadUrl(data.downloadUrl); // This comes from S3 signed URL
      setProcessingProgress(100);
    });

    const failedEvent = `job-failed-${jobId}`;
    socket.on(failedEvent, (data: any) => {
      setJobStatus("failed");
      setJobError(data.error || "Unknown error occurred");
    });

    return () => {
      socket.off(progressEvent);
      socket.off(completedEvent);
      socket.off(failedEvent);
    };
  }, [socket, jobId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        setError(`File exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        return;
      }

      const validTypes = [
        "video/mp4",
        "video/quicktime",
        "video/x-matroska",
        "video/x-msvideo",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file format. Please use MP4, MOV, or MKV.");
        return;
      }

      setSelectedFile(file);
      setError(null);
      setJobStatus("idle");
      setUploadProgress(0);
      setFileKey(null);
      setJobId("");
      setProcessingProgress(0);
      setJobError("");
      setDownloadUrl("");
    }
  };

  // Step 1: Upload Logic
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError(null);
      setJobStatus("uploading");

      const signRes = await axios.post(
        `${API}/api/videos/sign-upload`,
        {
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        },
        { withCredentials: true }
      );

      const { uploadUrl, fileKey } = signRes.data;
      setFileKey(fileKey);

      await axios.put(uploadUrl, selectedFile, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        },
      });

      setJobStatus("ready_to_process");
      setIsUploading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Upload failed. Please try again.");
      setJobStatus("idle");
      setIsUploading(false);
    }
  };

  // Step 2: Processing Logic
  const handleProcessRequest = async () => {
    if (!fileKey) return;

    try {
      setError(null);

      const processRes = await axios.post(
        `${API}/api/videos/process`,
        {
          fileKey,
          processingOptions: {
            trim: { start: startTime, end: endTime },
            format: "mp4",
          },
        },
        { withCredentials: true }
      );

      setJobId(processRes.data.jobId);
      setJobStatus("queued");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start processing.");
      setJobStatus("failed");
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

      <div className="relative z-10 min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Main "Glass" Card */}
          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-700/50 shadow-lg">
            <h1 className="text-3xl font-bold text-purple-400 mb-6 text-center">
              Vortex Video Toolkit
            </h1>

            <div className="mb-8">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  selectedFile
                    ? "border-purple-500 bg-purple-900/20"
                    : "border-gray-600 hover:border-purple-400 cursor-pointer"
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="video/*"
                />

                {!selectedFile ? (
                  <div className="flex flex-col items-center justify-center">
                    <FiUploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-300 text-lg">
                      Click to select a video file
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Max 100MB (MP4, MOV, MKV)
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <FiFile className="w-12 h-12 text-purple-400 mb-4" />
                    <p className="text-white font-semibold text-lg">
                      {selectedFile.name}
                    </p>
                    <p className="text-purple-300 text-sm mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    {jobStatus === "idle" && (
                      <p className="text-gray-400 text-sm mt-4 cursor-pointer underline">
                        Click to change file
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Upload Button & Progress */}
              {selectedFile && jobStatus === "idle" && (
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full mt-4 bg-purple-700 cursor-pointer hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center"
                >
                  {isUploading ? (
                    <FiLoader className="animate-spin mr-2" />
                  ) : (
                    <FiArrowRight className="mr-2" />
                  )}
                  Upload Video
                </button>
              )}

              {/* Upload Progress Bar */}
              {(isUploading || uploadProgress > 0) && jobStatus !== "idle" && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Uploading to Cloud...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Connection Status Indicator */}
            {!isConnected && !error && (
              <div className="flex items-center justify-center mt-4 text-yellow-400 animate-pulse">
                <FiLoader className="animate-spin mr-2" /> Connecting to
                server...
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex items-center mt-6 text-red-400 bg-red-500/20 p-3 rounded-md border border-red-500/30">
                <FiAlertTriangle className="mr-3" /> {error}
              </div>
            )}

            {/* Step 2: Trim Controls (Only visible after upload) */}
            {(jobStatus === "ready_to_process" ||
              jobStatus === "queued" ||
              jobStatus === "processing" ||
              jobStatus === "completed" ||
              jobStatus === "failed") && (
              <div className="mt-8 animate-fade-in bg-black/20 p-6 rounded-lg border border-purple-800/50">
                <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center">
                  <FiScissors className="mr-2" /> Configure Processing
                </h3>

                {/* Time Inputs */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Start Time (sec)
                    </label>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="00:00:00"
                      disabled={jobStatus !== "ready_to_process"}
                      className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      End Time (sec)
                    </label>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="00:00:10"
                      disabled={jobStatus !== "ready_to_process"}
                      className="w-full bg-gray-900/50 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Process Button */}
                {jobStatus === "ready_to_process" && (
                  <button
                    onClick={handleProcessRequest}
                    className="w-full cursor-pointer bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center"
                  >
                    <FiScissors className="mr-2" /> Start Processing
                  </button>
                )}

                {/* Status / Results */}
                <div className="mt-6">
                  {(jobStatus === "queued" || jobStatus === "processing") && (
                    <div className="bg-purple-900/20 p-4 rounded-md border border-purple-500/30">
                      <div className="flex items-center text-purple-300 mb-2">
                        {jobStatus === "queued" ? (
                          <FiClock className="mr-2" />
                        ) : (
                          <FiLoader className="mr-2 animate-spin" />
                        )}
                        <span className="font-semibold">
                          {jobStatus === "queued"
                            ? "Waiting in Queue..."
                            : "Processing Video..."}
                        </span>
                      </div>

                      {/* Processing Progress Bar */}
                      {jobStatus === "processing" && (
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                          <div
                            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${processingProgress}%` }}
                          ></div>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Job ID: {jobId}
                      </p>
                    </div>
                  )}

                  {jobStatus === "completed" && downloadUrl && (
                    <div className="flex flex-col sm:flex-row items-center justify-between text-green-400 bg-green-500/10 p-4 rounded-md border border-green-500/30">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <FiCheckCircle className="mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Processing Complete!</p>
                          <p className="text-xs text-gray-400">
                            Job ID: {jobId}
                          </p>
                        </div>
                      </div>
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center text-sm cursor-pointer"
                      >
                        <FiDownload className="mr-2" /> Download Result
                      </a>
                    </div>
                  )}

                  {jobStatus === "failed" && (
                    <div className="flex items-center text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/30">
                      <FiXCircle className="mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Job Failed</p>
                        <p className="text-sm">{jobError}</p>
                      </div>
                    </div>
                  )}
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
