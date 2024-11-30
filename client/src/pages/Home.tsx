import { VoiceChat } from "../components/VoiceChat";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <img 
              src="https://instabank.no/logo.svg" 
              alt="Instabank" 
              className="h-8"
            />
          </div>
        </header>
        
        <main className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Chat med oss
          </h1>
          <VoiceChat />
        </main>
      </div>
    </div>
  );
}
