export function generateId() {
  return (
    Date.now().toString(36) + Math.floor(Math.random() * 36 ** 2).toString(36)
  );
}

export const socketError = (message: string, status: number = 500) => {
  return {
    isError: true,
    error: {
      message,
      statusCode: status,
    },
  };
};
