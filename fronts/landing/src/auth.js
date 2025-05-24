import { createAuthClient } from 'better-auth/client';
import { apiKeyClient, organizationClient } from "better-auth/client/plugins"
 

// Create and export the auth client
export const authClient = createAuthClient({
  // The base URL of your auth server
  baseURL: process.env.VUE_APP_API_URL ? `${process.env.VUE_APP_API_URL}/api/auth` : '/api/auth',
  plugins: [ 
    apiKeyClient(),
    organizationClient()
  ],

  // Configure fetch options for all requests
  fetchOptions: {
    // Store tokens securely in localStorage when received
    onSuccess: (ctx) => {
      const authToken = ctx.response?.headers?.get('set-auth-token');
      if (authToken) {
        localStorage.setItem('bearer_token', authToken);
      }
    },
    
    // Include Bearer token in all requests
    auth: {
      type: 'Bearer',
      token: () => localStorage.getItem('bearer_token') || ''
    }
  },
});
// Export specific methods for easier imports
export const { 
  signIn, 
  signUp, 
  signOut,
  getSession,
  useSession,
} = authClient; 