interface MessageProps {
  sender: 'user' | 'bot';
  content: string;
  username: string;
}

export const MessageBubble = ({ sender, content, username }: MessageProps) => (
  <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className="relative max-w-[85%] sm:max-w-[75%]">
      {/* Etiquetas flotantes: NEC o inicial del usuario */}
      {sender === 'bot' && (
        <div className="absolute -top-4 -left-4 text-xs bg-blue-600 rounded-full text-white font-bold px-2 py-1 z-10">
          NEC
        </div>
      )}
      {sender === 'user' && (
        <div className="absolute -top-4 -right-2 h-5 w-5 text-xs bg-blue-600 rounded-full text-white font-bold flex justify-center items-center z-10">
          {username ? username.charAt(0).toUpperCase() : 'U'}
        </div>
      )}

      {/* Burbuja del mensaje */}
      <div
        className={`px-3 py-2 rounded-2xl shadow-sm whitespace-pre-wrap break-words break-all overflow-hidden
          ${sender === 'user'
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-gray-200 text-gray-800 rounded-tl-none'
          }`}
      >
        <span className="text-sm">{content}</span>
      </div>
    </div>
  </div>
);
