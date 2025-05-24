import Chat from "@/components/Chat";


interface HomePageProps {
  currentConversationId?: string | null;
}

const HomePage = ({ currentConversationId }: HomePageProps) => {
  return <Chat conversationId={currentConversationId ?? null} />;
};
export default HomePage;