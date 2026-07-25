
export const setOrigin = (allowedOrigins) => {
  return (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed`));
    }
  };
};
