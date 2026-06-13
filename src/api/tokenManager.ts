type VoidCallback = () => void;

let _onExpired: VoidCallback | null = null;

export const tokenManager = {
  setSessionExpiredCallback(cb: VoidCallback): void {
    _onExpired = cb;
  },

  onSessionExpired(): void {
    _onExpired?.();
  },
};
