import { useState } from "react";
import type { FC } from "react";
import { Link } from "react-router-dom";
import { GiVortex } from "react-icons/gi";
import {
  FiCheck,
  FiTool,
  FiZap,
  FiUploadCloud,
  FiChevronDown,
  FiArrowRight,
  FiPlay,
  FiVideo,
} from "react-icons/fi";
import { FaGithub } from "react-icons/fa";
import "../StarryBackground.css";

const faqs = [
  {
    question: "What file formats are supported?",
    answer: "Vortex currently supports MP4, MOV, and MKV video formats.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Yes. To ensure fast processing for all users, uploads are currently limited to 100MB per video file.",
  },
  {
    question: "Do you store my videos?",
    answer:
      "No. Vortex is designed with privacy in mind. Your uploaded videos are processed securely and are automatically deleted from our servers shortly after processing is complete.",
  },
];

const Landing: FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Starry background layers */}
      <div className="stars stars1"></div>
      <div className="stars stars2"></div>
      <div className="stars stars3"></div>
      <div className="stars stars4"></div>
      <div className="stars stars5"></div>
      <div className="stars stars6"></div>

      <div className="relative z-10 min-h-screen flex flex-col font-sans selection:bg-purple-500 selection:text-white">
        {/* --- HEADER --- */}
        <header className="fixed top-0 w-full z-50 transition-all duration-300 bg-black/10 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="p-2 bg-purple-900/30 rounded-lg group-hover:bg-purple-800/50 transition-colors">
                  <GiVortex className="text-purple-500 h-6 w-6 md:h-8 md:w-8" />
                </div>
                <span className="text-white font-bold text-xl md:text-2xl tracking-tight">
                  Vortex
                </span>
              </div>

              <nav className="hidden md:flex items-center gap-8">
                {["Features", "How It Works", "FAQ"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm font-medium text-gray-300 hover:text-white hover:underline decoration-purple-500 underline-offset-4 transition-all"
                  >
                    {item}
                  </a>
                ))}
              </nav>

              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/aryan55254/Vortex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:block text-gray-400 hover:text-white transition-colors"
                >
                  <FaGithub className="h-6 w-6" />
                </a>
                <Link to="/auth">
                  <button className="bg-white cursor-pointer text-black hover:bg-purple-50 px-5 py-2.5 text-sm font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                    Launch App
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          {/* --- HERO SECTION --- */}
          <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Vortex is Live
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                  Video processing <br />
                  <span className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                    Uncluttered.
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Upload raw footage directly to the cloud. Trim, compress, and
                  process with server-side precision. No software to install.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link to="/auth" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900/50 hover:bg-gray-800 border border-gray-700 cursor-pointer text-white text-lg font-bold px-8 py-4 rounded-xl transition-all shadow-[0_10px_40px_-10px_rgba(147,51,234,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(147,51,234,0.7)] hover:-translate-y-1">
                      Start Processing <FiArrowRight />
                    </button>
                  </Link>
                  <a href="#how-it-works" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900/50 hover:bg-gray-800 text-white border border-gray-700 cursor-pointer text-lg font-semibold px-8 py-4 rounded-xl transition-all">
                      <FiPlay className="w-5 h-5" /> How it works
                    </button>
                  </a>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-400 font-medium">
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-green-400" /> 100MB Uploads
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-green-400" /> MP4/MOV/MKV
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-green-400" /> Open Source
                  </div>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"></div>

                <div className="relative bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden ring-1 ring-white/10">
                  <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      vortex-processor.exe
                    </div>
                  </div>

                  {/* Fake Upload State */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-purple-500/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded text-purple-400">
                          <FiVideo />
                        </div>
                        <div>
                          <div className="text-sm text-white font-medium">
                            gameplay_clip_01.mp4
                          </div>
                          <div className="text-xs text-gray-500">45.2 MB</div>
                        </div>
                      </div>
                      <FiCheck className="text-green-400" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Processing...</span>
                        <span>85%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 w-[85%]"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="h-10 bg-gray-800/50 rounded animate-pulse"></div>
                      <div className="h-10 bg-gray-900 rounded flex items-center justify-center text-white border border-gray-700 text-sm font-bold shadow-lg shadow-purple-900/20">
                        Download
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="features" className="py-24 bg-black/20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Powerhouse in your browser.
                </h2>
                <p className="text-gray-400 text-lg">
                  We've stripped away the complexity. Upload your content and
                  let our distributed cloud workers handle the heavy lifting.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: FiUploadCloud,
                    title: "S3 Direct Upload",
                    desc: "Bypass server bottlenecks. Files go straight to our secure storage bucket.",
                  },
                  {
                    icon: FiTool,
                    title: "Server-Side FFmpeg",
                    desc: "Powered by C++ workers running FFmpeg for frame-perfect cuts.",
                  },
                  {
                    icon: FiZap,
                    title: "Queue System",
                    desc: "Built on Redis & BullMQ to handle high concurrency without crashing.",
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="bg-gray-900/40 backdrop-blur-sm border border-white/5 p-8 rounded-2xl hover:bg-gray-800/40 transition-colors group"
                  >
                    <div className="w-14 h-14 bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-7 h-7 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- HOW IT WORKS (Timeline) --- */}
          <div id="how-it-works" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
                Workflow
              </h2>

              <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent -translate-y-1/2"></div>

                <div className="grid md:grid-cols-3 gap-12 relative z-10">
                  {[
                    {
                      step: "01",
                      title: "Upload",
                      desc: "Select video. Signed URL generated. Direct S3 transfer.",
                    },
                    {
                      step: "02",
                      title: "Process",
                      desc: "Job added to BullMQ. Worker downloads & transcodes.",
                    },
                    {
                      step: "03",
                      title: "Download",
                      desc: "Result stored. You get a secure, temporary link.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-black border-4 border-purple-600 flex items-center justify-center text-xl font-bold text-white mb-6 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                        {item.step}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 max-w-xs">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- FAQ SECTION --- */}
          <div id="faq" className="py-24 max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              FAQ
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-900/30 border border-white/5 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center cursor-pointer justify-between p-6 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium text-white">
                      {faq.question}
                    </span>
                    <FiChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      openFaq === index
                        ? "max-h-48 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="p-6 pt-0 text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="border-t border-white/10 bg-black/20 py-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <GiVortex className="text-purple-600 h-6 w-6" />
              <span className="text-white font-bold text-lg">Vortex</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Aryan Mishra.
            </p>
            <div className="flex gap-6">
              <a
                href="https://github.com/aryan55254"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <FaGithub className="w-5 h-5" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;
