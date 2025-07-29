import { FloatingDock } from "@/components/ui/floating-dock";
import { Presentation, SquareStack, Brain } from "lucide-react";

interface RightDockProps {
  onQuizClick: () => void;
  onFlashCardsClick: () => void;
  onWhiteBoardClick: () => void;
}

const RightDock = ({
  onQuizClick,
  onFlashCardsClick,
  onWhiteBoardClick,
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
  ];
  return (
    <>
      <FloatingDock items={items} />
    </>
  );
};
export default RightDock;
