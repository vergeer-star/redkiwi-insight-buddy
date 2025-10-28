import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AvatarSelectionProps {
  onSelect: (avatarUrl: string, avatarName: string) => void;
}

const avatars = [
  {
    name: "Bryan",
    url: "eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJCcnlhbl9JVF9TaXR0aW5nX3B1YmxpYyIs%0D%0AInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzLzMzYzlhYzRh%0D%0AZWFkNDRkZmM4YmMwMDgyYTM1MDYyYTcwXzQ1NTgwL3ByZXZpZXdfdGFsa18zLndlYnAiLCJuZWVk%0D%0AUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6IjIwMWZkZDcxMmIyNDQw%0D%0AYjZiNmViNDdiYzVmOTYwNmIwIiwidXNlcm5hbWUiOiI2MGQxOTExYjQxZmM0YWI5YTkzYjY4Y2Ey%0D%0AYTE4ODY4NiJ9",
    preview: "https://files2.heygen.ai/avatar/v3/33c9ac4aead44dfc8bc0082a35062a70_45580/preview_talk_3.webp"
  },
  {
    name: "Katya",
    url: "eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJLYXR5YV9DaGFpcl9TaXR0aW5nX3B1Ymxp%0D%0AYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzL2IxZmY1%0D%0AZWRiZjk2MjQyZTZhYzk0NjkyMjdkZjQwOTI0XzU1MzYwL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJu%0D%0AZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6IjIwMWZkZDcxMmIy%0D%0ANDQwYjZiNmViNDdiYzVmOTYwNmIwIiwidXNlcm5hbWUiOiI2MGQxOTExYjQxZmM0YWI5YTkzYjY4%0D%0AY2EyYTE4ODY4NiJ9",
    preview: "https://files2.heygen.ai/avatar/v3/b1ff5edbf96242e6ac9469227df40924_55360/preview_target.webp"
  }
];

export const AvatarSelection = ({ onSelect }: AvatarSelectionProps) => {
  const handleAvatarClick = (avatar: typeof avatars[0]) => {
    onSelect(avatar.url, avatar.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Kies je interviewer
        </h2>
        <p className="text-gray-400 text-center mb-12">
          Klik op de persoon om het gesprek te starten
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {avatars.map((avatar) => (
            <button
              key={avatar.name}
              onClick={() => handleAvatarClick(avatar)}
              className="relative rounded-2xl overflow-hidden transition-all duration-300 ring-2 ring-gray-700 hover:ring-4 hover:ring-primary hover:scale-105"
            >
              <div className="aspect-[3/4] bg-gray-800">
                <img
                  src={avatar.preview}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <h3 className="text-2xl font-bold text-white mb-1">{avatar.name}</h3>
                <p className="text-sm text-gray-400">Klik om te starten</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
