type VoidCallback = () => void;

let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _onExpired: VoidCallback | null = null;

export const tokenManager = {
  setTokens(accessToken: string, refreshToken: string): void {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
  },

  clearTokens(): void {
    _accessToken = null;
    _refreshToken = null;
  },

  getAccessToken(): string | null {
    return _accessToken;
  },

  getRefreshToken(): string | null {
    return _refreshToken;
  },

  setSessionExpiredCallback(cb: VoidCallback): void {
    _onExpired = cb;
  },

  onSessionExpired(): void {
    _onExpired?.();
  },
};
