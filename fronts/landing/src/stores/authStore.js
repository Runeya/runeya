import { ref } from 'vue';
import { authClient } from '../auth';

/**
 * @typedef {Object} User
 * @property {string} id - The user's unique ID
 * @property {string} email - The user's email address
 * @property {string} displayName - The user's display name
 */

/**
 * Authentication store for managing user authentication state
 */
export const useAuth = () => {
  /** @type {import('vue').Ref<User|null>} */
  const user = ref(null);
  
  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false);
  
  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null);
  
  /** @type {import('vue').Ref<boolean>} */
  const isAuthenticated = ref(false);

  /**
   * Get the current authenticated user
   * @returns {Promise<User|null>} The current user or null if not authenticated
   */
  const getCurrentUser = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: sessionError } = await authClient.getSession();
      
      if (sessionError) {
        throw new Error(sessionError.message || 'Failed to get session');
      }
      
      if (data?.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.name || data.user.email
        };
        isAuthenticated.value = true;
      } else {
        user.value = null;
        isAuthenticated.value = false;
      }
      
      return user.value;
    } catch (/** @type {any} */ err) {
      console.error('Failed to get current user:', err);
      error.value = err.message || 'Failed to get current user';
      user.value = null;
      isAuthenticated.value = false;
      
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Login user with email and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<User>} The authenticated user
   */
  const login = async (credentials) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: loginError } = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password
      });
      
      if (loginError) {
        // Create error object with code and status information
        const errorInfo = {
          code: loginError.code,
          message: loginError.message,
          status: loginError.status
        };
        
        console.error('Login error details:', errorInfo);
        throw errorInfo;
      }
      
      if (data?.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.name || data.user.email
        };
        isAuthenticated.value = true;
        
        return /** @type {User} */ (user.value);
      }
      
      throw new Error('No user data received');
    } catch (/** @type {any} */ err) {
      console.error('Login failed:', err);
      
      // If it's our custom error object, preserve it
      if (err && typeof err === 'object' && err.code) {
        error.value = err;
        throw err;
      }
      
      // Otherwise wrap in standard error
      const errorCode = err.message || 'Login failed';
      error.value = errorCode;
      throw errorCode;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Logout the current user
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: signOutError } = await authClient.signOut();
      
      if (signOutError) {
        throw new Error(signOutError.message || 'Logout failed');
      }
      
      user.value = null;
      isAuthenticated.value = false;
    } catch (/** @type {any} */ err) {
      console.error('Logout failed:', err);
      error.value = err.message || 'Logout failed';
      
      // Clear the user state even if logout fails
      user.value = null;
      isAuthenticated.value = false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User full name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @returns {Promise<User>} The registered user
   */
  const register = async (userData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: signUpError } = await authClient.signUp.email({
        name: userData.name,
        email: userData.email,
        password: userData.password
      });
      
      if (signUpError) {
        throw new Error(signUpError.code || signUpError.message || 'Registration failed');
      }
      
      if (data?.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.name || data.user.email
        };
        isAuthenticated.value = true;
        
        return /** @type {User} */ (user.value);
      }
      
      throw new Error('No user data received');
    } catch (/** @type {any} */ err) {
      console.error('Registration failed:', err);
      error.value = err.message || 'Registration failed';
      throw error.value;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Login user with GitHub OAuth
   * @param {string} [callbackURL] - Optional callback URL after successful login
   * @returns {Promise<void>}
   */
  const loginWithGithub = async (callbackURL = `${window.location.origin}/app/dashboard`) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: callbackURL
      });
      // Note: This function will redirect, so the code after this won't execute
    } catch (/** @type {any} */ err) {
      console.error('GitHub authentication error:', err);
      error.value = err.message || 'GitHub authentication failed';
      throw error.value;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Resend verification email to user
   * @param {string} email - User email address
   * @returns {Promise<void>}
   */
  const resendVerificationEmail = async (email) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: resendError } = await authClient.sendVerificationEmail({
        email: email,
        callbackURL: `${process.env.VUE_APP_LANDING_URL}/app/dashboard`
      });
      
      if (resendError) {
        throw new Error(resendError.message || 'Failed to resend verification email');
      }
    } catch (/** @type {any} */ err) {
      console.error('Failed to resend verification email:', err);
      error.value = err.message || 'Failed to resend verification email';
      throw error.value;
    } finally {
      isLoading.value = false;
    }
  };

  const getSession = async () => {
    const { data, error: sessionError } = await authClient.getSession();
    if(!data || sessionError) {
      isAuthenticated.value = false;
      throw sessionError;
    } else {
      isAuthenticated.value = true;
    }
    return data;
  };

  return {
    // State
    user,
    isLoading,
    error,
    isAuthenticated,
    
    // Actions
    getCurrentUser,
    login,
    loginWithGithub,
    signOut,
    register,
    getSession,
    resendVerificationEmail
  };
};

// Create a singleton instance of the store
const authStore = useAuth();
export default authStore; 