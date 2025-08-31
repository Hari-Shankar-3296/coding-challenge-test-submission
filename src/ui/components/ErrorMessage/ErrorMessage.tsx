import React, { FunctionComponent } from "react";

import $ from "./ErrorMessage.module.css";

export interface ErrorMessageProps {
  errorMessage: string | undefined;
  type?: "error" | "warning" | "info"; // Future use
}

const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({ errorMessage, type = "error" }) => {
  return errorMessage && <div className={`${$[type]}`}>{errorMessage}</div>;
};

export default ErrorMessage;
