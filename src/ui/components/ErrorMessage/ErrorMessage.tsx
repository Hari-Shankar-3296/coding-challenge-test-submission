import React, { FunctionComponent } from "react";

import $ from "./ErrorMessage.module.css";

export interface ErrorMessageProps {
  errorMessage: string;
}

const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({ errorMessage }) => {
  return errorMessage && <div className={$.error}>{errorMessage}</div>;
};

export default ErrorMessage;
