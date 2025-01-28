export function prepareResponse(hasError, content) {
  return {
    hasError: hasError,
    content: content,
  };
}