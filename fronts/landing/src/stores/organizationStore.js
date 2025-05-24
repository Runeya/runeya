import { ref } from 'vue';
import axios from '../helpers/axios';
import { authClient } from '../auth';

/**
 * @typedef {Object} Organization
 * @property {string} id - The organization's unique ID
 * @property {string} name - The organization's name
 * @property {Date} createdAt - When the organization was created
 * @property {string} slug - The organization's slug
 * @property {any} [metadata] - The organization's metadata
 * @property {?string} [logo] - The organization's logo (can be null)
 */

// Create store state outside of the store creation for singleton pattern
/** @type {import('vue').Ref<Organization[]>} */
const organizations = ref([]);
/** @type {import('vue').Ref<Organization|null>} */
const currentOrganization = ref(null);
/** @type {import('vue').Ref<boolean>} */
const isLoading = ref(false);
/** @type {import('vue').Ref<string|null>} */
const error = ref(null);

/**
 * Organization store for managing organization state
 */
const createStore = () => {
  const ready = ref(false);

  const permissions = ref({
    invitation: {
      create: false,
      update: false,
      delete: false,
    },
    member: {
      create: false,
      update: false,
      delete: false,
    },
    organization: {
      create: false,
      update: false,
      delete: false,
    },
    team: {
      create: false,
      update: false,
      delete: false,
    }
  });

  /**
   * 
   * @param {keyof typeof permissions.value} namespace 
   * @param {keyof typeof permissions.value[keyof typeof permissions.value]} action 
   * @returns 
   */
  const hasPermission = async (namespace, action) => {
    if(!currentOrganization.value?.id) {throw new Error('No organization selected');}
    const {data, error } = await authClient.organization.hasPermission({
      organizationId: currentOrganization.value.id,
      permissions: {
        [namespace]: [action]
      }
    })
    if(error) {throw new Error(error.message);}
    return data.success;
  }

  const updatePermissions = async () => {
    if(!currentOrganization.value?.id) {throw new Error('No organization selected');}
    await Promise.all(Object.keys(permissions.value).map(async (namespace) => {
      await Promise.all(Object.keys(permissions.value[namespace]).map(async (action) => {
        permissions.value[namespace][action] = await hasPermission(/** @type {'invitation'|'member'|'organization'|'team'} */ (namespace), /** @type {'create'|'update'|'delete'} */ (action));
      }));
    }));
  }
  /**
   * Fetch all organizations for the current user
   * @returns {Promise<Organization[]>} The fetched organizations
   */
  const fetchOrganizations = async () => {
    isLoading.value = true;
    try {
      const organizationsRes = await authClient.organization.list();
      if(organizationsRes.error) {throw new Error(organizationsRes.error.message);}
      organizations.value = organizationsRes.data || [];
      organizations.value.forEach(org => {
        if(org.metadata) {
          org.metadata = JSON.parse(org.metadata)
        }
      });
      if (!currentOrganization.value && organizations.value.length > 0) {
        await setCurrentOrganization(organizations.value[0]);
      }
      return organizations.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Create a new organization
   * @param {Object} organizationData - The organization data
   * @param {string} organizationData.name - The organization name
   * @param {string} organizationData.slug - The organization slug
   * @param {string} [organizationData.logo] - The organization logo
   */
  const createOrganization = async (organizationData) => {
    const res = await authClient.organization.create(organizationData);
    if(res.error) {throw new Error(res.error.message);}
    await fetchOrganizations();
  };

  /**
   * Update an existing organization
   * @param {string} id - The organization ID
   * @param {Object} organizationData - The organization data to update
   */
  const updateOrganization = async (id, organizationData) => {
    const res = await authClient.organization.update({
      data: organizationData,
      ...(organizationData.metadata && {metadata: organizationData.metadata}),
      organizationId: id
    });
    if(res.error) {throw new Error(res.error.message);}
    await fetchOrganizations();
  };

  /**
   * Delete an organization
   * @param {string} id - The organization ID to delete
   */
  const deleteOrganization = async (id) => {
    const res = await authClient.organization.delete({
      organizationId: id
    });
    if(res.error) {throw new Error(res.error.message);}
    if (currentOrganization.value?.id === id) {
      currentOrganization.value = null;
    }
    await fetchOrganizations();
  };


  /**
   * Set the current organization
   * @param {Organization|null} organization - The organization to set as current
   */
  const setCurrentOrganization = async (organization) => {
    currentOrganization.value = organization;
    localStorage.setItem('currentOrganizationId', organization?.id || '');
    await authClient.organization.setActive({
      organizationId: organization?.id || ''
    });
    await updatePermissions();
  };

  /**
   * Get full organization details including members
   * @param {string} organizationId - The organization ID
   * @returns {Promise<any>} The full organization details
   */
  const getFullOrganization = async (organizationId) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const orgDetails = await authClient.organization.getFullOrganization({
        query: { organizationId }
      });
      
      return orgDetails;
    } catch (/** @type {any} */ err) {
      console.error('Failed to get full organization:', err);
      error.value = err.message || 'Failed to get full organization';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update a member's role in the organization
   * @param {Object} memberData - The member data
   * @param {string} memberData.memberId - The member ID
   * @param {'member'|'admin'|'owner'} memberData.role - The new role
   * @param {string} organizationId - The organization ID
   * @returns {Promise<void>}
   */
  const updateMemberRole = async (memberData, organizationId) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await authClient.organization.updateMemberRole({
        memberId: memberData.memberId,
        role: /** @type {'member'|'admin'|'owner'} */ (memberData.role),
        organizationId
      });
    } catch (/** @type {any} */ err) {
      console.error('Failed to update member role:', err);
      error.value = err.message || 'Failed to update member role';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Remove a member from the organization
   * @param {string} memberIdOrEmail - The member ID or email to remove
   * @param {string} organizationId - The organization ID
   * @returns {Promise<void>}
   */
  const removeMember = async (memberIdOrEmail, organizationId) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: removeError } = await authClient.organization.removeMember({
        memberIdOrEmail,
        organizationId
      });
      
      if (removeError) {
        throw new Error(removeError.message || 'Failed to remove member');
      }
    } catch (/** @type {any} */ err) {
      console.error('Failed to remove member:', err);
      error.value = err.message || 'Failed to remove member';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Check if a slug is available
   * @param {string} slug - The slug to check
   * @returns {Promise<any>} The slug check result
   */
  const checkSlug = async (slug) => {
    try {
      const res = await authClient.organization.checkSlug({ slug });
      return res;
    } catch (/** @type {any} */ err) {
      console.error('Failed to check slug:', err);
      throw err;
    }
  };

  const myInvitations = async () => {
    const {data} = await axios.get('/organisations/my-invitations');
    return data?.invitations || [];
  }

  const store = {
    // State
    ready,
    organizations,
    currentOrganization,
    isLoading,
    permissions,
    error,
    
    // Actions
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    setCurrentOrganization,
    getFullOrganization,
    updateMemberRole,
    removeMember,
    checkSlug,
    hasPermission,
    myInvitations,
    waitReady: () => {
      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (ready.value) {
            clearInterval(interval);
            resolve(store);
          }
        }, 0);
      });
    }
  };

  // Initial fetch
  fetchOrganizations().finally(() => {
    ready.value = true;
  }).catch(console.error);

  return store;
};

/** @type {ReturnType<typeof createStore>|null}*/
let storeInstance = null;
export default () => {
  return storeInstance || (storeInstance = createStore());
};