import { Twitter, MessageCircle, ExternalLink } from 'lucide-react';

export const SocialButtons = () => {
  return (
    <div className="fixed bottom-4 left-4 flex flex-col space-y-2">
      <a
        href="https://x.com/Copytrade_Pro"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors shadow-lg"
      >
        <Twitter size={20} />
      </a>
      <a
        href="https://t.me/Copytradepro_sol"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors shadow-lg"
      >
        <MessageCircle size={20} />
      </a>
      <a
        href="https://pump.fun/"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors shadow-lg"
      >
        <ExternalLink size={20} />
      </a>
    </div>
  );
}; 