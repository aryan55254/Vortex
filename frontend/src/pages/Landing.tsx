import { useState } from "react";
import type { FC } from "react";
import { Link } from "react-router-dom";
import { GiVortex } from "react-icons/gi";
import {
  FiCheckCircle,
  FiTool,
  FiZap,
  FiDownload,
  FiChevronDown,
} from "react-icons/fi";
import { FaGithub } from "react-icons/fa";
import "../StarryBackground.css";

const faqs = [
  {
    question: "Which video platforms are supported?",
    answer: "Vortex will work well with Youtube , Twitter , Instagram",
  },
  {
    question: "Is there a time limit on the videos I can trim?",
    answer:
      "Yes. In the current version, to ensure fast processing and stability, the total trimmed duration of a video is limited to 15 minutes. You can still fetch information for any video.",
  },
  {
    question: "Do you store my videos or personal data?",
    answer:
      "No. Vortex is designed with privacy in mind. We only store your login information (like your email/name). Trimmed video clips are stored **temporarily** on our server to allow you to download them, and are **automatically and permanently deleted after 15 minutes.**",
  },
];
const Landing: FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <div className="stars stars1"></div>
      <div className="stars stars2"></div>
      <div className="stars stars3"></div>
      <div className="stars stars4"></div>
      <div className="stars stars5"></div>
      <div className="stars stars6"></div>

      <div className="relative z-10">
        <header className="bg-black/50 backdrop-blur-sm top-0 z-50 sticky">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center">
                <GiVortex className="text-purple-700 h-10 w-10" />
                <div className="text-white font-bold text-3xl ml-2">Vortex</div>
              </div>
              <nav className="hidden md:block">
                <div className="ml-10 flex items-center space-x-8">
                  <a
                    href="#features"
                    className="text-white text-xl hover:text-purple-700 transition-colors duration-200"
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-white text-xl hover:text-purple-700 transition-colors duration-200"
                  >
                    How It Works
                  </a>
                  <a
                    href="#faq"
                    className="text-white text-xl hover:text-purple-700 transition-colors duration-200"
                  >
                    FAQs
                  </a>
                </div>
              </nav>
              <Link to="/auth">
                <button className="text-white text-xl cursor-pointer bg-purple-700 hover:bg-purple-900 px-5 py-3 font-bold rounded-md transition-colors duration-200">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <div
            className="relative text-white flex flex-col items-center justify-center text-center px-4"
            style={{ height: "calc(100vh - 5rem)" }}
          >
            <div className="relative z-10">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight uppercase">
                <span className="block">Capture the Moment.</span>
                <span className="block text-purple-700 mt-2">
                  Trim the Noise.
                </span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Vortex is your personal video toolkit. Paste a Youtube or X or
                Instagram URL , trim the perfect clip with server-side
                precision. Simple, fast, and powerful.
              </p>
              <div className="mt-10">
                <Link to="/auth">
                  <button className="text-white text-xl cursor-pointer bg-purple-700 hover:bg-purple-900 px-10 py-4 font-bold rounded-lg transition-transform transform hover:scale-105 duration-300">
                    Start Clipping
                  </button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mt-12">
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className="text-purple-700 h-6 w-6" />
                  <p className="text-gray-300 text-lg">
                    Multiple Platform Support
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className="text-purple-700 h-6 w-6" />
                  <p className="text-gray-300 text-lg">Precision Trimming</p>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className="text-purple-700 h-6 w-6" />
                  <p className="text-gray-300 text-lg">
                    Fast Server-Side Processing
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Your Content, <span className="text-white">Your Control</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Vortex provides the tools to get the exact video content you
                  need, quickly and efficiently.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-purple-700/50">
                  <FiDownload className="text-purple-700 h-12 w-12 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    High-Speed Trims
                  </h3>
                  <p className="text-gray-400">
                    Choose your preferred resolution.
                  </p>
                </div>
                <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-purple-700/50">
                  <FiTool className="text-purple-700 h-12 w-12 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Precision Trimming
                  </h3>
                  <p className="text-gray-400">
                    Use our intuitive controls to select the exact start and end
                    times. Vortex trims the video on the server for
                    frame-perfect cuts without re-encoding.
                  </p>
                </div>
                <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-purple-700/50">
                  <FiZap className="text-purple-700 h-12 w-12 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Simple Workflow
                  </h3>
                  <p className="text-gray-400">
                    No complex software needed. Just paste your link, preview
                    the details, and choose your action. From URL to finished
                    clip in seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div id="how-it-works" className="py-20 px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              From Link to Download in{" "}
              <span className="text-purple-700">Three Easy Steps</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
              Our entire process is designed to be simple and intuitive.
            </p>
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center text-white">
              <div className="flex flex-col items-center">
                <div className="bg-black/30 backdrop-blur-sm rounded-full h-24 w-24 flex items-center justify-center border-2 border-purple-700 text-purple-700 text-4xl font-bold">
                  1
                </div>
                <h3 className="text-2xl font-semibold mt-6 mb-2">Paste URL</h3>
                <p className="text-gray-400">
                  Provide a link to the video you want to process.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-black/30 backdrop-blur-sm rounded-full h-24 w-24 flex items-center justify-center border-2 border-purple-700 text-purple-700 text-4xl font-bold">
                  2
                </div>
                <h3 className="text-2xl font-semibold mt-6 mb-2">
                  Preview & Choose
                </h3>
                <p className="text-gray-400">
                  See the video details, select your resolution, and set your
                  trim times.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-black/30 backdrop-blur-sm rounded-full h-24 w-24 flex items-center justify-center border-2 border-purple-700 text-purple-700 text-4xl font-bold">
                  3
                </div>
                <h3 className="text-2xl font-semibold mt-6 mb-2">Download</h3>
                <p className="text-gray-400">Get your final video file.</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div id="faq" className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Frequently Asked{" "}
                  <span className="text-purple-700">Questions</span>
                </h2>
              </div>
              <div className="max-w-3xl mx-auto mt-8">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b-2 border-gray-700 py-4">
                    <button
                      onClick={() =>
                        setOpenFaq(openFaq === index ? null : index)
                      }
                      className="w-full cursor-pointer flex justify-between items-center text-left"
                    >
                      <span className="text-xl font-medium text-white">
                        {faq.question}
                      </span>
                      <FiChevronDown
                        className={`h-6 w-6 text-purple-700 transform transition-transform duration-300 ${
                          openFaq === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        openFaq === index ? "max-h-96 mt-4" : "max-h-0"
                      }`}
                    >
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer Section */}
        <footer className="bg-transparent">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center md:justify-start mb-6 md:mb-0">
              <div className="flex items-center">
                <GiVortex className="text-purple-700 h-10 w-10" />
                <div className="text-white font-bold text-3xl ml-2">Vortex</div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Vortex. All Rights Reserved.
              </p>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <a
                  href="https://github.com/aryan55254/Vortex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-purple-700 transition-colors duration-200"
                >
                  <span className="sr-only">GitHub</span>
                  <FaGithub className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;
