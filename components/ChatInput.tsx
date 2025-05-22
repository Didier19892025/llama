import { Send, Loader2, CircleStop } from "lucide-react";

export const ChatInput = ({
  prompt,
  setPrompt,
  onSubmit,
  onCancel,
  isLoading,
  abortController,
  textareaRef
}: any) => (
  <form onSubmit={onSubmit} className="relative">
    <textarea
      ref={textareaRef}
      value={prompt}
      onChange={e => {
        setPrompt(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onSubmit(e);
        }
      }}
      placeholder="Escribe tu mensaje aquí..."
      className="w-full p-3 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 resize-none overflow-hidden min-h-[46px] max-h-[150px] text-sm"
      disabled={isLoading && !abortController}
    />
    <button
      type="submit"
      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full ${
        (isLoading && !abortController) || (!isLoading && !prompt.trim())
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
      disabled={(isLoading && !abortController) || (!isLoading && !prompt.trim())}
    >
      {isLoading ? (
        abortController ? <CircleStop className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
    </button>
  </form>
);
