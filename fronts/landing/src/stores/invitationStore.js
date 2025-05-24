import { ref } from 'vue';
import { authClient } from '../auth';

/**
 * @typedef {Object} Invitation
 * @property {string} id - The invitation's unique ID
 * @property {string} email - The invited user's email
 * @property {string} status - The invitation status
 * @property {Date} expiresAt - When the invitation expires
 * @property {string} organizationId - The organization ID
 * @property {string} role - The role assigned to the invitation
 * @property {string} inviterId - The inviter's ID
 * @property {string} [teamId] - The team ID if applicable
 * @property {string} [organizationSlug] - The organization slug
 */

/**
 * Invitation store for managing invitation state and operations
 */
export const useInvitations = () => {
  /** @type {import('vue').Ref<Invitation[]>} */
  const invitations = ref([]);
  
  /** @type {import('vue').Ref<Invitation|null>} */
  const currentInvitation = ref(null);
  
  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false);
  
  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null);

  /**
   * Get invitation details by ID
   * @param {string} invitationId - The invitation ID
   * @returns {Promise<Invitation|null>} The invitation details or null
   */
  const getInvitation = async (invitationId) => {
      const { data, error: invitationError } = await authClient.organization.getInvitation({
        query: { id: invitationId }
      });
      if (invitationError) throw invitationError;
      if (data) {
        currentInvitation.value = data;
        return data;
      }
      return null;
  };

  /**
   * Accept an invitation
   * @param {string} invitationId - The invitation ID to accept
   * @returns {Promise<void>}
   */
  const acceptInvitation = async (invitationId) => {
    const { error: acceptError } = await authClient.organization.acceptInvitation({
        invitationId
      });
    if (acceptError) throw acceptError;
  };

  /**
   * Reject an invitation
   * @param {string} invitationId - The invitation ID to reject
   * @returns {Promise<void>}
   */
  const rejectInvitation = async (invitationId) => {
    const { error: rejectError } = await authClient.organization.rejectInvitation({
      invitationId
    })
    if (rejectError) throw rejectError
  };

  /**
   * List invitations for an organization
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Invitation[]>} The list of invitations
   */
  const listInvitations = async (organizationId) => {
    const {data, error: listInvitationsError} = await authClient.organization.listInvitations({
      query: { organizationId }
    });
    if (listInvitationsError) throw listInvitationsError;
    return data;
  };

  /**
   * Send an invitation to join an organization
   * @param {Object} invitationData - The invitation data
   * @param {string} invitationData.email - The email to invite
   * @param {'member'|'admin'|'owner'} invitationData.role - The role to assign
   * @param {string} invitationData.organizationId - The organization ID
   * @returns {Promise<void>}
   */
  const inviteMember = async (invitationData) => {
    const { error: inviteMemberError } = await authClient.organization.inviteMember({
      email: invitationData.email,
      role: /** @type {'member'|'admin'|'owner'} */ (invitationData.role),
      organizationId: invitationData.organizationId,
    });
    if (inviteMemberError) throw inviteMemberError;
  };

  /**
   * Cancel an invitation
   * @param {string} invitationId - The invitation ID to cancel
   * @returns {Promise<void>}
   */
  const cancelInvitation = async (invitationId) => {
    const { error: cancelInvitationError } = await authClient.organization.cancelInvitation({
      invitationId
    });
    if (cancelInvitationError) throw cancelInvitationError;
  };

  return {
    // State
    invitations,
    currentInvitation,
    isLoading,
    error,
    
    // Actions
    getInvitation,
    acceptInvitation,
    rejectInvitation,
    listInvitations,
    inviteMember,
    cancelInvitation
  };
};

// Create a singleton instance of the store
const invitationStore = useInvitations();
export default invitationStore; 