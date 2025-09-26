#ifndef VIDEOPROCESSOR_H
#define VIDEOPROCESSOR_H

extern "C"
{
#include <libavformat/avformat.h>
#include <libavcodec/avcodec.h>
#include <libavutil/error.h>
#include <libswscale/swscale.h>
}

class VideoProcessor
{
private:
    // --- Input Contexts ---
    AVFormatContext *formatContext = nullptr;
    AVCodecContext *codecContext = nullptr;
    int video_stream_index = -1;

    // --- Output Contexts  ---
    AVFormatContext *outputFormatContext = nullptr;
    AVStream *outputStream = nullptr;

public:
    VideoProcessor();
    ~VideoProcessor();

    int openFile(const char *inputFilename);
    void closeFile();

    // NEW METHODS
    int openOutput(const char *outputFilename);
    int encodeFrame(AVFrame *frame);

    int processVideo(const char *outputFilename);
};

#endif