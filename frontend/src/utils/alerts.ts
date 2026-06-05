// Utility for safe alerts - uses import.meta.env for Vite compatibility
export const showAlert = (msg: string) => {
  if (import.meta.env.MODE !== 'test') {
    alert(msg);
  }
};
