#include <iostream>
#include <algorithm>
#include "VideoProcessor.h"
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
    if (outputFormatContext)
    {
        // Close the output file pointer (avio) if it was opened
        if (!(outputFormatContext->oformat->flags & AVFMT_NOFILE))
        {
            avio_closep(&outputFormatContext->pb);
        }
        // Free the output format context
        avformat_free_context(outputFormatContext);
        outputFormatContext = nullptr;
    }
}

int VideoProcessor::openFile(const char *filename)
{
    int ret = 0;

    ret = avformat_open_input(&formatContext, filename, nullptr, nullptr);
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

    AVCodecParameters *codecParams = formatContext->streams[video_stream_index]->codecpar;

    const AVCodec *decoder = avcodec_find_decoder(codecParams->codec_id);
    if (!decoder)
    {
        std::cerr << "ERROR: Failed to find decoder for stream." << std::endl;
        return -1;
    }

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

    if (avcodec_open2(codecContext, decoder, nullptr) < 0)
    {
        std::cerr << "ERROR: Failed to open decoder." << std::endl;
        return -1;
    }
    std::cout << "[SETUP] Successfully opened the video decoder." << std::endl;

    return 0;
}

int VideoProcessor::openOutput(const char *outputFilename)
{
    int ret = 0;

    // Allocate the output format context
    ret = avformat_alloc_output_context2(&outputFormatContext, nullptr, nullptr, outputFilename);
    if (ret < 0)
    {
        std::cerr << "ERROR: Could not create output context." << std::endl;
        return ret;
    }

    // Find the encoder and create a new stream
    const AVCodec *encoder = avcodec_find_encoder(AV_CODEC_ID_H264);
    if (!encoder)
    {
        std::cerr << "ERROR: H.264 encoder not found." << std::endl;
        return -1;
    }

    outputStream = avformat_new_stream(outputFormatContext, encoder);
    if (!outputStream)
    {
        std::cerr << "ERROR: Failed to allocate output stream." << std::endl;
        return -1;
    }

    // Configure the encoder context
    AVCodecContext *outputCodecContext = avcodec_alloc_context3(encoder);
    if (!outputCodecContext)
    {
        std::cerr << "ERROR: Failed to allocate output codec context." << std::endl;
        return -1;
    }

    // Copy parameters from the input decoder context
    outputCodecContext->width = codecContext->width;
    outputCodecContext->height = codecContext->height;
    outputCodecContext->pix_fmt = AV_PIX_FMT_YUV420P;
    outputCodecContext->time_base = {1, 25}; // Simple frame rate (25 FPS)

    outputCodecContext->gop_size = 12;

    avcodec_parameters_from_context(outputStream->codecpar, outputCodecContext);

    if (avcodec_open2(outputCodecContext, encoder, nullptr) < 0)
    {
        std::cerr << "ERROR: Cannot open output encoder." << std::endl;
        return -1;
    }

    outputStream->codec = outputCodecContext;

    if (!(outputFormatContext->oformat->flags & AVFMT_NOFILE))
    {
        ret = avio_open(&outputFormatContext->pb, outputFilename, AVIO_FLAG_WRITE);
        if (ret < 0)
        {
            std::cerr << "ERROR: Could not open output file: " << outputFilename << std::endl;
            return ret;
        }
    }

    ret = avformat_write_header(outputFormatContext, nullptr);
    if (ret < 0)
    {
        std::cerr << "ERROR: Could not write output header." << std::endl;
        return ret;
    }

    std::cout << "[SETUP] Successfully set up and opened output file: " << outputFilename << std::endl;
    return 0;
}

int VideoProcessor::encodeFrame(AVFrame *frame)
{
    // Get the output stream's codec context
    AVCodecContext *outputCodecContext = outputStream->codec;

    // Send the raw frame to the encoder
    int ret = avcodec_send_frame(outputCodecContext, frame);
    if (ret < 0)
    {
        return ret;
    }

    //  Receive encoded packets
    AVPacket *pkt = av_packet_alloc();
    while (ret >= 0)
    {
        ret = avcodec_receive_packet(outputCodecContext, pkt);

        if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF)
        {
            break;
        }
        else if (ret < 0)
        {
            std::cerr << "ERROR: avcodec_receive_packet failed." << std::endl;
            av_packet_free(&pkt);
            return ret;
        }

        //  Rescale timestamps and write the packet to the file
        // Convert time_base from encoder context to output stream's time_base
        av_packet_rescale_ts(pkt, outputCodecContext->time_base, outputStream->time_base);
        pkt->stream_index = outputStream->index;

        ret = av_interleaved_write_frame(outputFormatContext, pkt);
        if (ret < 0)
        {
            std::cerr << "ERROR: av_interleaved_write_frame failed." << std::endl;
        }

        av_packet_unref(pkt);
    }

    av_packet_free(&pkt);
    return ret == AVERROR_EOF ? 0 : ret;
}

int VideoProcessor::processVideo(const char *outputFilename)
{
    AVPacket *packet = av_packet_alloc();
    AVFrame *frame = av_frame_alloc();
    int ret = 0;
    long frame_count = 0;
    const long MAX_FRAMES = 100;

    if (!packet || !frame)
    {
        std::cerr << "ERROR: Failed to allocate packet or frame." << std::endl;
        goto cleanup;
    }

    if (openOutput(outputFilename) < 0)
    {
        goto cleanup;
    }

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

            while (avcodec_receive_frame(codecContext, frame) == 0)
            {

                frame_count++;

                frame->pts = frame_count;

                if (encodeFrame(frame) < 0)
                {
                    std::cerr << "ERROR: Failed to encode frame." << std::endl;
                    goto end_of_decoding_loop;
                }

                std::cout << "[FRAME] ID: " << frame_count
                          << " | Encoding frame to file..." << std::endl;

                // Trimming Logic
                if (frame_count >= MAX_FRAMES)
                {
                    std::cout << "[TRIM] Limit of " << MAX_FRAMES << " frames reached. Stopping." << std::endl;
                    goto end_of_decoding_loop;
                }
            }
        }

        av_packet_unref(packet);
    }

end_of_decoding_loop:
    avcodec_send_packet(codecContext, nullptr);
    while (avcodec_receive_frame(codecContext, frame) == 0)
    {

        frame->pts = frame_count++;
        encodeFrame(frame);
    }

    encodeFrame(nullptr);

    // Write file trailer
    if (av_write_trailer(outputFormatContext) < 0)
    {
        std::cerr << "ERROR: Could not write file trailer." << std::endl;
    }

read_error:;

cleanup:
    av_packet_free(&packet);
    av_frame_free(&frame);

    if (ret == AVERROR_EOF)
        return 0;
    return ret;
}