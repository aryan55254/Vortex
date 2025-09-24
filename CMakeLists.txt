#this block is just defining name of project , its version , langauge required , cmake version required
cmake_minimum_required(VERSION 3.10)
project(Vortex VERSION 1.0.0 LANGUAGES CXX)
cmake_policy(SET CMP0048 NEW)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

#this block is just defining the packages externally required to build the executable
find_package(PkgConfig REQUIRED)
pkg_check_modules(FFMPEG REQUIRED libavformat libavcodec libswscale libavutil)

#this block just declares the files that will be executes and links the ffmpeg libs and headers to aur eecutable
add_executable(vortex main.cpp VideoProcessor.cpp)
target_link_libraries(vortex PRIVATE ${FFMPEG_LIBRARIES})
target_include_directories(vortex PRIVATE ${FFMPEG_INCLUDE_DIRS})