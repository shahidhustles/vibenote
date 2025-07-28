import { FloatingDock } from "@/components/ui/floating-dock";
import { DraftingCompass, Library, PlusCircle, HomeIcon } from "lucide-react";

const RightDock = () => {
  const items = [
    {
      title: "Quiz",
      icon: <HomeIcon />,
      href: "/chat",
    },
    {
      title: "Flash Cards",
      icon: <PlusCircle />,
      href: "#",
    },
    {
      title: "White Board",
      icon: <Library />,
      href: "#",
    },
    {
      title: "AI Tutor",
      icon: <DraftingCompass />,
      href: "#",
    },
  ];
  return (
    <>
      <FloatingDock items={items} />
    </>
  );
};
export default RightDock;
