const TOKEN_KEY = "token";

export const setToken = (token: string) =>
  localStorage.setItem("token", token);

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => !!getToken();

// Logout utility function
export const logout = () => {
  removeToken();
  // Clear any other user data if needed
  localStorage.removeItem("userDetails");
  
  // Remove any modal overlays that might be persisting
  const modalOverlays = document.querySelectorAll('.app-modal-overlay');
  modalOverlays.forEach(overlay => overlay.remove());
  
  // Remove any other modal overlays (like logout modal from sidebar)
  const allOverlays = document.querySelectorAll('[style*="position: fixed"][style*="z-index"]');
  allOverlays.forEach(overlay => {
    const style = (overlay as HTMLElement).style;
    if (style.position === 'fixed' && (style.zIndex === '999' || style.zIndex === '1000')) {
      overlay.remove();
    }
  });
  
  // Reset body styles that might have been modified by modals
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
  
  // Redirect to login page
  window.location.href = "/login";
};