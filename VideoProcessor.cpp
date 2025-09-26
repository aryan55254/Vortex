#include <iostream>
#include "VideoProcessor.h"

// --- Constructor and Destructor (Minimal) ---
VideoProcessor::VideoProcessor() {};

VideoProcessor::~VideoProcessor()
{
    closeFile();
};

// --- Cleanup (Phase 1 & 2) ---
void VideoProcessor::closeFile()
{
    // Free the format context (Phase 1 cleanup)
    if (formatContext)
    {
        avformat_close_input(&formatContext);
    }
    // Free the codec context (Phase 2 cleanup)
    if (codecContext)
    {
        avcodec_free_context(&codecContext);
    }
}

// --- Phase 1 & 2: File Open and Decoder Setup ---
int VideoProcessor::openFile(const char *filename)
{
    // *** Phase 1: File I/O Setup ***
    int ret = avformat_open_input(&formatContext, filename, nullptr, nullptr);
    if (ret < 0)
    { /* ... error handling ... */
        return ret;
    }
    std::cout << "[SETUP] Successfully opened file: " << filename << std::endl;

    ret = avformat_find_stream_info(formatContext, nullptr);
    if (ret < 0)
    { /* ... error handling ... */
        return ret;
    }

    video_stream_index = av_find_best_stream(formatContext, AVMEDIA_TYPE_VIDEO, -1, -1, nullptr, 0);
    if (video_stream_index < 0)
    { /* ... error handling ... */
        return video_stream_index;
    }

    std::cout << "[SETUP] Found video stream at index: " << video_stream_index << std::endl;
    av_dump_format(formatContext, 0, filename, 0);

    // *** Phase 2: Decoding Setup ***
    AVCodecParameters *codecParams = formatContext->streams[video_stream_index]->codecpar;

    // Step 8: Find the decoder
    const AVCodec *decoder = avcodec_find_decoder(codecParams->codec_id);
    if (!decoder)
    {
        std::cerr << "ERROR: Failed to find decoder for stream." << std::endl;
        return -1;
    }

    // Step 9: Allocate and copy context
    codecContext = avcodec_alloc_context3(decoder);
    if (!codecContext)
    {
        std::cerr << "ERROR: Failed to allocate context." << std::endl;
        return -1;
    }
    if (avcodec_parameters_to_context(codecContext, codecParams) < 0)
    {
        std::cerr << "ERROR: Failed to copy params." << std::endl;
        return -1;
    }

    // Step 10: Open the decoder
    if (avcodec_open2(codecContext, decoder, nullptr) < 0)
    {
        std::cerr << "ERROR: Failed to open decoder." << std::endl;
        return -1;
    }
    std::cout << "[SETUP] Successfully opened the video decoder." << std::endl;

    return 0;
}

// --- Phase 2: Main Decoding Loop ---
int VideoProcessor::processVideo()
{
    AVPacket *packet = av_packet_alloc();
    AVFrame *frame = av_frame_alloc();
    int ret = 0;
    long frame_count = 0;
    const long MAX_FRAMES = 100; // Trim Limit

    if (!packet || !frame)
    {
        std::cerr << "ERROR: Failed to allocate packet or frame." << std::endl;
        goto cleanup;
    }

    // Read encoded packets from the file
    while ((ret = av_read_frame(formatContext, packet)) >= 0)
    {
        // Check if the packet belongs to our video stream
        if (packet->stream_index == video_stream_index)
        {
            // Send the encoded packet to the decoder
            ret = avcodec_send_packet(codecContext, packet);
            if (ret < 0 && ret != AVERROR(EAGAIN))
            {
                goto read_error;
            }

            // Receive the decoded frame (keep looping until decoder is empty)
            while (avcodec_receive_frame(codecContext, frame) == 0)
            {
                // *** CUSTOM LOGIC/PROCESSING POINT ***
                frame_count++;

                std::cout << "[FRAME] ID: " << frame_count
                          << " | PTS: " << frame->pts
                          << " | Type: " << av_get_picture_type_char(frame->pict_type) << std::endl;

                // Trimming Logic (Your Custom Code!)
                if (frame_count >= MAX_FRAMES)
                {
                    std::cout << "[TRIM] Limit of " << MAX_FRAMES << " frames reached. Stopping." << std::endl;
                    goto end_of_decoding_loop;
                }

                // In a full app: process frame, scale, and then encode it here.
            }
        }

        // Clean up packet data after use
        av_packet_unref(packet);
    }

// --- FLUSH DECODER (Process remaining buffered frames) ---
end_of_decoding_loop:
    avcodec_send_packet(codecContext, nullptr); // Send NULL packet to signal end
    while (avcodec_receive_frame(codecContext, frame) == 0)
    {
        // Process final frames (if any)
        std::cout << "[FLUSH] Processing final frame: " << frame->pts << std::endl;
    }

read_error:; // Label for error handling or loop exit

// --- FINAL CLEANUP ---
cleanup:
    av_packet_free(&packet);
    av_frame_free(&frame);

    if (ret == AVERROR_EOF)
        return 0; // Normal exit
    return ret;   // Error code exit
}