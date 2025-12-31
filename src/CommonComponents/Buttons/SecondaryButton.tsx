import React from "react";
import { Button } from "antd";
import "./Buttons.scss";
import type { SecondaryButtonProps } from "../../types/common";

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  text,
  imgSrc,
  imgAlt,
  imgPosition = "before",
  className = "", 
   children,
  ...rest
}) => {
  return (
    <Button
      type="default"
      shape="round"
      className={`btn-secondary-custom ${className}`}  // <-- merged
      {...rest}
    >
      {imgSrc && imgPosition === "before" && (
        <img src={imgSrc} alt={imgAlt || ""} className="button-icon" />
      )}
      <span className="button-text">{text}</span>
      {imgSrc && imgPosition === "after" && (
        <img src={imgSrc} alt={imgAlt || ""} className="button-icon" />
      )}
      {children}
    </Button>
  );
};

export default SecondaryButton;
