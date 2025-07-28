import { FloatingDock } from "@/components/ui/floating-dock";
import { Bot, Presentation, SquareStack, Brain } from "lucide-react";

interface RightDockProps {
  onQuizClick: () => void;
  onFlashCardsClick: () => void;
  onWhiteBoardClick: () => void;
  onAITutorClick: () => void;
}

const RightDock = ({
  onQuizClick,
  onFlashCardsClick,
  onWhiteBoardClick,
  onAITutorClick,
}: RightDockProps) => {
  const items = [
    {
      title: "Quiz",
      icon: <Brain />,
      href: "#",
      onClick: onQuizClick,
    },
    {
      title: "Flash Cards",
      icon: <SquareStack />,
      href: "#",
      onClick: onFlashCardsClick,
    },
    {
      title: "White Board",
      icon: <Presentation />,
      href: "#",
      onClick: onWhiteBoardClick,
    },
    {
      title: "AI Tutor",
      icon: <Bot />,
      href: "#",
      onClick: onAITutorClick,
    },
  ];
  return (
    <>
      <FloatingDock items={items} />
    </>
  );
};
export default RightDock;
