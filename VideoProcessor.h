#ifndef VIDEOPROCESSOR_H
#define VIDEOPROCESSOR_H

// Use extern "C" because FFmpeg is a C library
extern "C"
{
#include <libavformat/avformat.h>
#include <libavcodec/avcodec.h>
#include <libavutil/error.h> // For av_make_error_string
#include <libavutil/imgutils.h> // For debugging frame info
}

class VideoProcessor
{
private:
    // Core FFmpeg structures
    AVFormatContext *formatContext = nullptr; 
    AVCodecContext *codecContext = nullptr;

    // Index of the video stream found in the file
    int video_stream_index = -1;

public:
    // Constructor and Destructor (for setup and cleanup)
    VideoProcessor();
    ~VideoProcessor();
    
    // Core methods
    int openFile(const char *filename);
    void closeFile();
    int processVideo(); // The main decoding loop
};

#endif // VIDEOPROCESSOR_H