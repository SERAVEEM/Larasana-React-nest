let isLoaded = false;
/**
 * Loads the Google Identity Services script only once.
 * If the script is already present, the callback runs immediately.
 */
export const loadGoogleScript = (callback: () => void) => {
  if (isLoaded) {
    callback();
    return;
  }
  const existing = document.getElementById('google-client-script');
  if (existing) {
    // Script tag exists but may not be loaded yet – attach onload.
    existing.addEventListener('load', () => {
      isLoaded = true;
      callback();
    });
    return;
  }
  const script = document.createElement('script');
  script.id = 'google-client-script';
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    isLoaded = true;
    callback();
  };
  document.body.appendChild(script);
};
