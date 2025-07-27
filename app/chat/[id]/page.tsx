import { Id } from "@/convex/_generated/dataModel";
import Chatbox from "@/features/basic-functionality/components/chatbox";

const NewChatPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const chatId = id as Id<"chats">;

  return (
    <div className="w-full h-screen">
      <Chatbox chatId={chatId} />
    </div>
  );
};
export default NewChatPage;
