#include <iostream>
#include "VideoProcessor.h"

int main(int argc, char *argv[])
{
    if (argc < 3)
    {
        std::cerr << "Usage: " << argv[0] << " <input_video_file> <output_video_file>" << std::endl;
        return 1;
    }

    const char *inputFilename = argv[1];
    const char *outputFilename = argv[2];

    VideoProcessor processor;

    if (processor.openFile(inputFilename) < 0)
    {
        std::cerr << "Failed to initialize input processor." << std::endl;
        return 1;
    }

    if (processor.processVideo(outputFilename) < 0)
    {
        std::cerr << "Processing loop encountered an error." << std::endl;
        return 1;
    }

    std::cout << "\nProcessing complete. Output saved to: " << outputFilename << std::endl;
    return 0;
}