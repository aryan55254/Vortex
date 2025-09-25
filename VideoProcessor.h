// this extern c is telling c++ compiler to use c compiler for the code in the following block
extern "C"
{
#include <libavformat/avformat.h> //for i/o of video files
#include <libavcodec/avcodec.h>   //encoding and decoding of video files
}

class VideoProcessor
{
private:
    AVFormatContext *formatContext = nullptr; // this is just a nullpointer called AVFormatContext tin future will hold the address to the context of the video that user inputs
    AVCodecContext *codecContext = nullptr;
    int video_stream_index = -1;

public:
    int openFile(const char *filename); // just a function declaration to openfile with a argument char datatype pointer that points to the file that is going to be opened
    void closeFile(); 
};