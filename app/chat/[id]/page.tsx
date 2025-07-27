import { Id } from "@/convex/_generated/dataModel";
import Chatbox from "@/features/basic-functionality/components/chatbox";
import RightDrawer from "@/features/main/components/right-drawer";

const NewChatPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const chatId = id as Id<"chats">;

  return (
    <div className="w-full h-screen relative flex">
      <div className="flex-1">
        <Chatbox chatId={chatId} />
      </div>
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
        <RightDrawer chatId={chatId} />
      </div>
    </div>
  );
};
export default NewChatPage;
