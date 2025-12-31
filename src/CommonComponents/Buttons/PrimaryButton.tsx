import React from "react";
import { Button } from "antd";
import "./Buttons.scss";
import type { PrimaryButtonProps } from "../../types/common";

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  text,
  imgSrc,
  imgAlt,
  imgPosition = "before",
  className = "",   // <-- keep only this
  ...rest
}) => {
  return (
    <Button
      type="primary"
      shape="round"
      className={`btn-primary-custom ${className}`}  // <-- merged
      {...rest}
    >
      {imgSrc && imgPosition === "before" && (
        <img src={imgSrc} alt={imgAlt || ""} className="button-icon" />
      )}
      <span className="button-text">{text}</span>
      {imgSrc && imgPosition === "after" && (
        <img src={imgSrc} alt={imgAlt || ""} className="button-icon" />
      )}
    </Button>
  );
};

export default PrimaryButton;
