import HeroText from "@/components/hero-chat";
import Orb from "@/components/ui/orb";

const ChatPage = () => {
  return (
    <div className="w-full min-h-screen relative bg-gray-50">
      {/* Orb background */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-30">
        <div className="w-[250px] h-[220px]">
          <Orb
            hoverIntensity={0.5}
            rotateOnHover={true}
            hue={0}
            forceHoverState={false}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center  px-4">
        <HeroText />
      </div>
    </div>
  );
};
export default ChatPage;
