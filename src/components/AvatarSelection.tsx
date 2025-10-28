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
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedAvatar) {
      const avatar = avatars.find(a => a.url === selectedAvatar);
      if (avatar) {
        onSelect(avatar.url, avatar.name);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Kies je interviewer
        </h2>
        <p className="text-gray-400 text-center mb-12">
          Selecteer met wie je het gesprek wilt voeren
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {avatars.map((avatar) => (
            <button
              key={avatar.name}
              onClick={() => setSelectedAvatar(avatar.url)}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                selectedAvatar === avatar.url
                  ? 'ring-4 ring-primary scale-105'
                  : 'ring-2 ring-gray-700 hover:ring-gray-500'
              }`}
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
                {selectedAvatar === avatar.url && (
                  <div className="flex items-center gap-2 text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold">Geselecteerd</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedAvatar}
            size="lg"
            className="px-12 py-6 text-lg"
          >
            Doorgaan naar checklist
          </Button>
        </div>
      </div>
    </div>
  );
};
