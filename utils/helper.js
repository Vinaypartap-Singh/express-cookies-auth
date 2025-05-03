import { ZodError } from "zod";

export const formatError = (error) => {
  let errors = {};
  error.errors?.map((error) => {
    errors[error.path?.[0]] = error.message;
  });

  return errors;
};

export const handleCatchError = (error, res, errorMessage) => {
  if (error instanceof ZodError) {
    const formattedError = formatError(error);
    return res.status(400).json({
      message: errorMessage || "validation error",
      error: formattedError,
    });
  }

  return res.status(500).json({
    message: error.message || "An Error Occured",
    error: error.message || "Unknown Error",
  });
};

export const handleTryResponseHandler = (res, status, message, data) => {
  if (data) {
    return res.status(status || 200).json({
      message: message || "Common Try Response Error Handler",
      data: data,
    });
  }

  return res.status(status || 200).json({
    message: message || "Common Try Response Error Handler",
    data: {},
  });
};
