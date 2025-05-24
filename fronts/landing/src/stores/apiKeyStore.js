import { ref } from 'vue';
import { authClient } from '../auth';

// Create store state outside of the store creation for singleton pattern
const apiKeys = ref([]);
const isLoading = ref(false);
const error = ref(null);

/**
 * API Key store for managing API key state
 */
const createStore = () => {
  /**
   * Fetch all API keys for the current user
   */
  const fetchApiKeys = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const { data, error: apiError } = await authClient.apiKey.list();
      if (apiError) {
        throw new Error(apiError.message);
      }
      apiKeys.value = data || [];
      return apiKeys.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Create a new API key
   */
  const createApiKey = async (apiKeyData) => {
    isLoading.value = true;
    error.value = null;
    try {
      const { data, error: apiError } = await authClient.apiKey.create(apiKeyData);
      if (apiError) {
        throw new Error(apiError.message);
      }
      await fetchApiKeys(); // Refresh the list
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update an existing API key
   */
  const updateApiKey = async (keyId, updateData) => {
    isLoading.value = true;
    error.value = null;
    try {
      const { data, error: apiError } = await authClient.apiKey.update({
        keyId,
        ...updateData
      });
      if (apiError) {
        throw new Error(apiError.message);
      }
      await fetchApiKeys(); // Refresh the list
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete an API key
   */
  const deleteApiKey = async (keyId) => {
    isLoading.value = true;
    error.value = null;
    try {
      const { data, error: apiError } = await authClient.apiKey.delete({
        keyId
      });
      if (apiError) {
        throw new Error(apiError.message);
      }
      await fetchApiKeys(); // Refresh the list
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // State
    apiKeys,
    isLoading,
    error,
    
    // Actions
    fetchApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey
  };
};

// Create singleton store instance
let storeInstance = null;

/**
 * Get the API key store instance (singleton)
 */
const useApiKeyStore = () => {
  if (!storeInstance) {
    storeInstance = createStore();
  }
  return storeInstance;
};

export default useApiKeyStore; 