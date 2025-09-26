# Minimum required CMake version
cmake_minimum_required(VERSION 3.10)

# Project Name and Language (C++17)
project(Vortex VERSION 1.0.0 LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Find FFmpeg Libraries using pkg-config
# REQUIRED: libavformat, libavcodec, libavutil, libswscale
find_package(PkgConfig REQUIRED)
pkg_check_modules(FFMPEG REQUIRED libavformat libavcodec libavutil libswscale)

# Define the executable: vortex
add_executable(vortex main.cpp VideoProcessor.cpp)

# Link the libraries and include directories
target_link_libraries(vortex PRIVATE ${FFMPEG_LIBRARIES})
target_include_directories(vortex PRIVATE ${FFMPEG_INCLUDE_DIRS})