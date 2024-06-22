import React from "react";
import { Button } from "@/components/ui/button";

const ActionButton = ({
  name,
  isActive,
  activeLabel,
  inactiveLabel,
  onClickHandler,
}: {
  name: string;
  isActive: boolean;
  activeLabel: string;
  inactiveLabel: string;
  onClickHandler: () => {};
}) => {
  return (
    <Button
      variant={isActive ? "default" : "secondary"}
      onClick={onClickHandler}
      aria-label={name}
    >
      {isActive ? activeLabel : inactiveLabel}
    </Button>
  );
};

export default ActionButton;
