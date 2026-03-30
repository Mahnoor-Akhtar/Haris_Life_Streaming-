import React from 'react';
import { 
  ChevronUp, 
  MicOff, 
  VideoOff, 
  MonitorUp, 
  Smile, 
  Subtitles, 
  Hand, 
  MoreVertical, 
  PhoneOff,
  Info,
  MessageSquare,
  Shapes,
  Lock,
  User,
  Mic
} from 'lucide-react';

export default function MeetUI() {
  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-[#f8fafd] via-[#f0f4f8] to-[#eaf0f7] text-[#202124] font-sans overflow-hidden">
      {/* Top Header Layer (floating over everything) */}
      <div className="absolute top-0 right-0 p-4 flex items-center gap-4 z-10 w-full justify-end">
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600">
             <User size={16} />
          </div>
          <span className="text-sm font-medium text-[#202124]">1</span>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 p-4 pb-0 flex relative">
        <div 
          className="w-full h-full rounded-2xl relative overflow-hidden shadow-lg border border-gray-200"
          style={{ backgroundColor: '#f0f4f8' }}
        >
          {/* Top Right Corner Mic Indicator */}
          <div className="absolute top-4 right-4 z-10">
             <div className="bg-[#ea4335] p-1.5 rounded-full shadow-md">
               <MicOff size={16} className="text-white" />
             </div>
          </div>

          {/* Centered Avatar */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <User size={80} className="text-blue-400" />
            </div>
          </div>

          {/* Bottom Left Name */}
          <div className="absolute bottom-4 left-4 z-10">
            <span className="text-[#202124] font-medium drop-shadow-sm tracking-wide bg-white/70 px-3 py-1 rounded-lg">
              Mah Noor
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-[88px] w-full flex items-center justify-between px-6 bg-white/70 backdrop-blur-sm border-t border-gray-200">
        
        {/* Left Info */}
        <div className="flex items-center gap-2 text-[15px] font-medium tracking-wide">
          <span className="text-[#202124] text-base">11:49 AM</span>
          <span className="text-gray-400 mx-1">|</span>
          <span className="text-[#202124] text-base">rcb-rhxv-myi</span>
        </div>

        {/* Center Controls */}
        <div className="flex items-center justify-center gap-3">
          
          {/* Mic Group */}
          <div className="flex items-center h-10 w-24">
            <button className="bg-gray-200 hover:bg-gray-300 text-[#202124] h-10 w-10 flex items-center justify-center rounded-full transition-colors hidden sm:flex shrink-0">
              <ChevronUp size={20} />
            </button>
            <button className="bg-[#ea4335] hover:bg-[#d93025] text-white h-10 w-14 flex items-center justify-center rounded-3xl transition-colors shadow-sm ml-1">
              <MicOff size={20} />
            </button>
          </div>

          {/* Cam Group */}
          <div className="flex items-center h-10 w-24">
            <button className="bg-gray-200 hover:bg-gray-300 text-[#202124] h-10 w-10 flex items-center justify-center rounded-full transition-colors hidden sm:flex shrink-0">
              <ChevronUp size={20} />
            </button>
            <button className="bg-[#ea4335] hover:bg-[#d93025] text-white h-10 w-14 flex items-center justify-center rounded-3xl transition-colors shadow-sm ml-1">
              <VideoOff size={20} />
            </button>
          </div>

          {/* Other Controls */}
          <button className="bg-gray-200 hover:bg-gray-300 text-[#202124] h-10 w-10 flex items-center justify-center rounded-full transition-colors hidden md:flex shrink-0">
            <MonitorUp size={20} />
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-[#202124] h-10 w-10 flex items-center justify-center rounded-full transition-colors hidden md:flex shrink-0">
            <Smile size={20} />
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-[#202124] h-10 w-10 flex items-center justify-center rounded-full transition-colors hidden md:flex shrink-0">
            <Subtitles size={20} />
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-[#202124] h-10 w-10 flex items-center justify-center rounded-full transition-colors shrink-0">
            <Hand size={20} />
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-[#202124] h-10 w-10 flex items-center justify-center rounded-full transition-colors shrink-0">
            <MoreVertical size={20} />
          </button>
          
          {/* Hangup button */}
          <button className="bg-[#ea4335] hover:bg-[#d93025] text-white h-10 w-16 flex items-center justify-center rounded-3xl transition-colors shadow-sm ml-2 shrink-0">
            <PhoneOff size={20} />
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-4 text-gray-600">
          <button className="hover:text-[#202124] transition-colors hidden lg:block">
            <Info size={24} />
          </button>
          <button className="hover:text-[#202124] transition-colors hidden lg:block">
            <MessageSquare size={24} />
          </button>
          <button className="hover:text-[#202124] transition-colors hidden lg:block">
            <Shapes size={24} />
          </button>
          <button className="hover:text-[#202124] transition-colors hidden lg:block">
            <Lock size={24} />
          </button>
          
          {/* Optional fallback for smaller screens to show they are omitted */}
          <button className="lg:hidden hover:text-[#202124] transition-colors">
            <MoreVertical size={24} />
          </button>
        </div>

      </div>
    </div>
  );
}
