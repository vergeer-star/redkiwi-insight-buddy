import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AvatarSelectionProps {
  onSelect: (avatarUrl: string, avatarName: string) => void;
}

const avatars = [
  {
    name: "Katya",
    url: "eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJLYXR5YV9DaGFpcl9TaXR0aW5nX3B1Ymxp%0D%0AYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzL2IxZmY1%0D%0AZWRiZjk2MjQyZTZhYzk0NjkyMjdkZjQwOTI0XzU1MzYwL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJu%0D%0AZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6IjIwMWZkZDcxMmIy%0D%0ANDQwYjZiNmViNDdiYzVmOTYwNmIwIiwidXNlcm5hbWUiOiI2MGQxOTExYjQxZmM0YWI5YTkzYjY4%0D%0AY2EyYTE4ODY4NiJ9",
    preview: "https://files2.heygen.ai/avatar/v3/b1ff5edbf96242e6ac9469227df40924_55360/preview_target.webp"
  },
  {
    name: "Bryan",
    url: "eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJCcnlhbl9JVF9TaXR0aW5nX3B1YmxpYyIs%0D%0AInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzLzMzYzlhYzRh%0D%0AZWFkNDRkZmM4YmMwMDgyYTM1MDYyYTcwXzQ1NTgwL3ByZXZpZXdfdGFsa18zLndlYnAiLCJuZWVk%0D%0AUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6IjIwMWZkZDcxMmIyNDQw%0D%0AYjZiNmViNDdiYzVmOTYwNmIwIiwidXNlcm5hbWUiOiI2MGQxOTExYjQxZmM0YWI5YTkzYjY4Y2Ey%0D%0AYTE4ODY4NiJ9",
    preview: "https://files2.heygen.ai/avatar/v3/33c9ac4aead44dfc8bc0082a35062a70_45580/preview_talk_3.webp"
  },
  {
    name: "Anastasia",
    url: "eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJBbmFzdGFzaWFfQ2hhaXJfU2l0dGluZ19w%0D%0AdWJsaWMiLCJwcmV2aWV3SW1nIjoiaHR0cHM6Ly9maWxlczIuaGV5Z2VuLmFpL2F2YXRhci92My9k%0D%0AMzM3MGQwZjg2Nzg0YmRlOGUyMTQ0ZDE2ZDU3M2RjY181NTI4MC9wcmV2aWV3X3RhcmdldC53ZWJw%0D%0AIiwibmVlZFJlbW92ZUJhY2tncm91bmQiOmZhbHNlLCJrbm93bGVkZ2VCYXNlSWQiOiIyMDFmZGQ3%0D%0AMTJiMjQ0MGI2YjZlYjQ3YmM1Zjk2MDZiMCIsInVzZXJuYW1lIjoiNjBkMTkxMWI0MWZjNGFiOWE5%0D%0AM2I2OGNhMmExODg2ODYifQ%3D%3D",
    preview: "https://files2.heygen.ai/avatar/v3/d3370d0f86784bde8e2144d16d573dcc_55280/preview_target.webp"
  }
];

export const AvatarSelection = ({ onSelect }: AvatarSelectionProps) => {
  const handleAvatarClick = (avatar: typeof avatars[0]) => {
    onSelect(avatar.url, avatar.name);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      <div className="relative max-w-6xl w-full">
        <h2 className="text-5xl md:text-6xl font-bold text-white text-center mb-4">
          KIES JE <span className="text-[#FF2B2B]">INTERVIEWER</span>
        </h2>
        <p className="text-gray-400 text-center mb-16">
          Klik op de persoon om het gesprek te starten
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {avatars.map((avatar) => (
            <div key={avatar.name} className="flex flex-col items-center gap-4 animate-fade-in group">
              <button
                onClick={() => handleAvatarClick(avatar)}
                className="relative"
              >
                {/* Glow effect behind */}
                <div className="absolute inset-0 rounded-full bg-[#FF2B2B]/0 blur-xl transition-all duration-500 group-hover:bg-[#FF2B2B]/30 group-hover:scale-125" />
                
                {/* Main avatar bubble */}
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover:border-[#FF2B2B] group-hover:shadow-[0_30px_100px_rgba(237,28,36,0.6)] group-hover:scale-110 group-hover:-translate-y-2">
                  <img
                    src={avatar.preview}
                    alt={avatar.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FF2B2B]/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              </button>
              <h3 className="text-2xl font-bold text-white transition-all duration-300 group-hover:text-[#FF2B2B]">{avatar.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
