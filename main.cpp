#include <iostream>
#include "VideoProcessor.h"

int main(int argc, char *argv[])
{
    if (argc < 2)
    {
        std::cerr << "Usage: " << argv[0] << " <input_video_file>" << std::endl;
        return 1;
    }

    const char *inputFilename = argv[1];
    
    // 1. CONSTRUCTOR is called
    VideoProcessor processor;

    // 2. Open the file and set up the decoder
    if (processor.openFile(inputFilename) < 0)
    {
        std::cerr << "Failed to initialize video processor." << std::endl;
        // Destructor calls closeFile() automatically here.
        return 1;
    }

    // 3. Start the main processing loop
    std::cout << "\nStarting decoding and processing loop..." << std::endl;
    if (processor.processVideo() < 0)
    {
        std::cerr << "Processing loop encountered an error." << std::endl;
        // Destructor calls closeFile() automatically here.
        return 1;
    }

    std::cout << "\nProcessing complete. Shutting down." << std::endl;
    // 4. DESTRUCTOR is called automatically here.
    return 0;
}