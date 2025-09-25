#include <iostream>
#include <VideoProcessor.h>

VideoProcessor::VideoProcessor() {};
VideoProcessor::~VideoProcessor()
{
    closeFile();
};

void VideoProcessor::closeFile()
{
    if (formatContext)
    {
        avformat_close_input(&formatContext);
    }
    if (codecContext)
    {
        avcodec_free_context(&codecContext);
    }
}

int VideoProcessor::openFile(const char *filename)
{
    int ret = avformat_open_input(&formatContext, filename, nullptr, nullptr);
    if (ret < 0)
    {
        char errbuf[AV_ERROR_MAX_STRING_SIZE];
        av_make_error_string(errbuf, AV_ERROR_MAX_STRING_SIZE, ret);
        std::cerr << "ERROR: Failed to open input file '" << filename
                  << "'. FFmpeg error: " << errbuf << std::endl;

        return ret;
    }
    std::cout << "Successfully opened file: " << filename << std::endl;
    ret = avformat_find_stream_info(formatContext, nullptr);
    if (ret < 0)
    {
        char errbuf[AV_ERROR_MAX_STRING_SIZE];
        av_make_error_string(errbuf, AV_ERROR_MAX_STRING_SIZE, ret);
        std::cerr << "ERROR: Failed to find stream info for '" << filename << "'. FFmpeg error: " << errbuf << std::endl;
        return ret;
    }
    std::cout << "Successfully found stream information." << std::endl;
    video_stream_index = av_find_best_stream(formatContext, AVMEDIA_TYPE_VIDEO, -1, -1, nullptr, 0);
    if (video_stream_index < 0)
    {
        std::cerr << "ERROR: Could not find a valid video stream in the input file." << std::endl;
        return video_stream_index;
    }

    std::cout << "Found video stream at index: " << video_stream_index << std::endl;
    av_dump_format(formatContext, 0, filename, 0);
    return 0;
};
