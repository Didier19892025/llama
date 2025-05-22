export const TypingIndicator = () => (
  <div className="flex items-center space-x-2 ml-2">
    <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></span>
    <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-150"></span>
    <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-300"></span>
    <span className="text-sm text-gray-500 ml-2">NEC está escribiendo...</span>
  </div>
);
