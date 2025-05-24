<template>
  <div class="organization-members-view">
    <h2 class="text-2xl font-bold mb-4">{{ $t('dashboard.orgMembers.title') }}</h2>

    <div class="card">
      <div class="flex flex-row justify-between items-center mb-4 w-full">
        <h3>{{ $t('dashboard.orgMembers.membersList') }}</h3>
        <div class="flex gap-2">
          <Button
            v-if="isOwner"
            :label="$t('dashboard.orgMembers.transferOwnership.button')"
            icon="fas fa-crown"
            class="p-button-warning"
            @click="showTransferOwnership"
          />
          <Button
            v-if="canInvite"
            :label="$t('dashboard.orgMembers.inviteButton')"
            icon="fas fa-user-plus"
            @click="showInviteDialog = true"
          />
        </div>
      </div>
      <DataTable :value="members" :loading="isLoadingMembers">
        <Column field="user.name" :header="$t('dashboard.orgMembers.table.name')"></Column>
        <Column field="user.email" :header="$t('dashboard.orgMembers.table.email')"></Column>
        <Column field="role" :header="$t('dashboard.orgMembers.table.role')"></Column>
        <Column :header="$t('dashboard.orgMembers.table.actions')">
          <template #body="slotProps">
            <Button icon="fas fa-edit" class="p-button-sm p-button-text" @click="editMemberRole(slotProps.data)" v-if="canEditMember(slotProps.data)"></Button>
            <Button icon="fas fa-trash" class="p-button-sm p-button-danger p-button-text" @click="confirmRemoveMember(slotProps.data)" v-if="canRemoveMember(slotProps.data)"></Button>
          </template>
        </Column>
        <template #empty>
          {{ $t('dashboard.orgMembers.noMembers') }}
        </template>
      </DataTable>
    </div>

    <div class="card mt-4">
      <div class="flex flex-row justify-between items-center mb-4 w-full">
        <h3>{{ $t('dashboard.orgMembers.invitationsList') }}</h3>
      </div>
      <DataTable :value="invitations" :loading="isLoadingInvitations">
        <Column field="email" :header="$t('dashboard.orgMembers.table.email')"></Column>
        <Column field="role" :header="$t('dashboard.orgMembers.table.role')"></Column>
        <Column field="status" :header="$t('dashboard.orgMembers.table.status')"></Column>
        <Column :header="$t('dashboard.orgMembers.table.actions')">
          <template #body="slotProps">
            <Button icon="fas fa-copy" class="p-button-sm p-button-text" @click="copyInviteLink(slotProps.data)" v-if="slotProps.data.status === 'pending'"></Button>
            <Button icon="fas fa-times" class="p-button-sm p-button-warning p-button-text" @click="cancelInvitation(slotProps.data)" v-if="slotProps.data.status === 'pending' && canInvite"></Button>
            <Button icon="fas fa-refresh" class="p-button-sm p-button-warning p-button-text" @click="resendInvitation(slotProps.data)" v-if="(slotProps.data.status === 'canceled' || slotProps.data.status === 'expired' || slotProps.data.status === 'rejected') && canInvite"></Button>
          </template>
        </Column>
        <template #empty>
          {{ $t('dashboard.orgMembers.noInvitations') }}
        </template>
      </DataTable>
    </div>

    <Dialog v-model:visible="showInviteDialog" modal :header="$t('dashboard.orgMembers.inviteDialog.title')" :style="{ width: '400px' }">
      <div class="p-field mb-3">
        <label for="inviteEmail">{{ $t('dashboard.orgMembers.inviteDialog.emailLabel') }}</label>
        <InputText id="inviteEmail" v-model="inviteEmail" class="w-full" />
      </div>
      <div class="p-field">
        <label for="inviteRole">{{ $t('dashboard.orgMembers.inviteDialog.roleLabel') }}</label>
        <Dropdown id="inviteRole" v-model="inviteRole" :options="roleOptions(false)" optionLabel="label" optionValue="value" class="w-full" />
      </div>
      <template #footer>
        <Button :label="$t('dashboard.orgSettings.cancelButton')" class="p-button-text" @click="showInviteDialog = false" />
        <Button :label="$t('dashboard.orgMembers.inviteDialog.sendButton')" icon="fas fa-paper-plane" :loading="isSendingInvite" @click="sendInvite" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showEditRoleDialog" modal :header="$t('dashboard.orgMembers.editRoleDialog.title')" :style="{ width: '400px' }">
        <div class="p-field">
            <label for="editRole">{{ $t('dashboard.orgMembers.editRoleDialog.roleLabel') }}</label>
            <Dropdown id="editRole" v-model="selectedRole" :options="roleOptions(true)" optionLabel="label" optionValue="value" class="w-full" />
        </div>
        <template #footer>
            <Button :label="$t('dashboard.orgSettings.cancelButton')" class="p-button-text" @click="showEditRoleDialog = false" />
            <Button :label="$t('dashboard.orgMembers.editRoleDialog.saveButton')" :loading="isUpdatingRole" @click="updateMemberRole" />
        </template>
    </Dialog>

    <Dialog v-model:visible="showTransferOwnershipDialog" modal :header="$t('dashboard.orgMembers.transferOwnership.title')" :style="{ width: '400px' }">
       <div class="p-field">
         <label for="newOwner">{{ $t('dashboard.orgMembers.transferOwnership.newOwnerLabel') }}</label>
         <Select
            v-model="selectedNewOwner"
            :options="adminAndOwnerMembers.filter(m => m.role !== 'owner')"
            optionLabel="user.email"
            optionValue="user.id"
            class="w-full"
            :placeholder="$t('dashboard.orgMembers.transferOwnership.selectMember')" />
         
       </div>
       <template #footer>
         <Button :label="$t('dashboard.orgSettings.cancelButton')" class="p-button-text" @click="showTransferOwnershipDialog = false" />
         <Button :label="$t('dashboard.orgMembers.transferOwnership.transferButton')" :loading="isTransferringOwnership" @click="transferOwnership" />
       </template>
     </Dialog>

     <ConfirmDialog group="removeMember"></ConfirmDialog>
     <Toast position="bottom-right" />
  </div>
</template>

<script setup>
// @ts-nocheck - Disabling TypeScript checks for this file as it's using JavaScript

import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

import authStore from '../../stores/authStore';
import invitationStore from '../../stores/invitationStore';
import useOrganizationStore from '../../stores/organizationStore.js';
import { Select } from 'primevue';

const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const organizationStore = useOrganizationStore();

const currentOrganization = computed(() => organizationStore.currentOrganization.value);

// Define member and invitation structure for type safety
const members = ref([]);
const invitations = ref([]);
const isLoadingMembers = ref(false);
const isLoadingInvitations = ref(false);
const currentUserMember = ref(null); // Pour stocker le membre correspondant à l'utilisateur actuel

const showInviteDialog = ref(false);
const inviteEmail = ref('');
const inviteRole = ref('member'); // Default role

const showEditRoleDialog = ref(false);
const selectedMember = ref(null);
const selectedRole = ref('');

const showTransferOwnershipDialog = ref(false);
const selectedNewOwner = ref(null);

const isSendingInvite = ref(false);
const isUpdatingRole = ref(false);
const isTransferringOwnership = ref(false);

// Calculs pour les permissions et règles business
const currentUserRole = computed(() => {
  return currentUserMember.value?.role || 'member';
});

const isOwner = computed(() => currentUserRole.value === 'owner');
const isAdmin = computed(() => currentUserRole.value === 'admin');
const isMember = computed(() => currentUserRole.value === 'member');

const canInvite = computed(() => isOwner.value || isAdmin.value);
const canManageMembers = computed(() => isOwner.value || isAdmin.value);

const onlyOneOwner = computed(() => members.value.filter(m => m.role === 'owner').length === 1);
const onlyOneAdmin = computed(() => members.value.filter(m => m.role === 'admin').length === 1);

const adminAndOwnerMembers = computed(() => 
  members.value.filter(m => m.role === 'admin' || m.role === 'owner')
);

onMounted(async () => {
  await useOrganizationStore().waitReady()
  console.log(organizationStore.permissions.value)
});

// Fonction pour obtenir les options de rôles selon les permissions
const roleOptions = (isEdit = false, targetMember = null) => {
  const options = [];
  
  if (isOwner.value) {
    // Owner peut assigner admin et member, mais pas owner
    options.push({ label: t('roles.admin'), value: 'admin' });
    options.push({ label: t('roles.member'), value: 'member' });
  } else if (isAdmin.value) {
    // Admin peut assigner admin et member, mais pas owner
    options.push({ label: t('roles.admin'), value: 'admin' });
    options.push({ label: t('roles.member'), value: 'member' });
  }
  
  // Logique spéciale pour l'édition - empêcher de réduire le dernier admin
  if (isEdit && onlyOneAdmin.value && targetMember?.role === 'admin') {
    // Ne pas permettre de changer le rôle du dernier admin
    return options.filter(opt => opt.value === 'admin');
  }
  
  return options;
};

// Helper function to safely display error messages
const getErrorMessage = (error) => {
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message;
  }
  return String(error);
};

const getCurrentUserFromMembers = async () => {
  try {
    const session = await authStore.getSession();
    if (session?.user?.email) {
      currentUserMember.value = members.value.find(member => 
        member.user?.email === session.user.email
      );
    }
  } catch (error) {
    console.error("Error getting current user:", error);
  }
};

const fetchMembers = async () => {
  if (!currentOrganization.value?.id) return;
  isLoadingMembers.value = true;
  try {
    // Better Auth: Get full organization details to get members
    const orgDetails = await organizationStore.getFullOrganization(currentOrganization.value.id);
    
    // Extract members from the response - handle both possible response structures
    if (orgDetails && typeof orgDetails === 'object') {
      if ('data' in orgDetails && orgDetails.data && typeof orgDetails.data === 'object') {
        // Response has a data property - likely { data: { members: [...] } }
        const data = orgDetails.data;
        members.value = Array.isArray(data.members) ? data.members : [];
      } else if ('members' in orgDetails && Array.isArray(orgDetails.members)) {
        // Response has members directly - likely { members: [...] }
        members.value = orgDetails.members;
      } else {
        // Unknown structure
        members.value = [];
      }
    } else {
      members.value = [];
    }
    
    // Obtenir l'utilisateur actuel une fois les membres chargés
    await getCurrentUserFromMembers();
  } catch (error) {
    console.error("Error fetching members:", error);
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.errors.fetchMembersError'), 
      detail: getErrorMessage(error), 
      life: 3000 
    });
    members.value = [];
  } finally {
    isLoadingMembers.value = false;
  }
};

const fetchInvitations = async () => {
  if (!currentOrganization.value?.id) return;
  isLoadingInvitations.value = true;
  try {
    const result = await invitationStore.listInvitations(currentOrganization.value.id);
    invitations.value = result;
  } catch (error) {
    console.error("Error fetching invitations:", error);
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.errors.fetchInvitationsError'), 
      detail: getErrorMessage(error), 
      life: 3000 
    });
    invitations.value = [];
  } finally {
    isLoadingInvitations.value = false;
  }
};

const sendInvite = async () => {
  if (!canInvite.value) {
    toast.add({ 
      severity: 'warn', 
      summary: t('dashboard.orgMembers.inviteDialog.noPermissionWarning'), 
      life: 3000 
    });
    return;
  }
  
  if (!inviteEmail.value || !inviteRole.value || !currentOrganization.value?.id) {
    toast.add({ severity: 'warn', summary: t('dashboard.orgMembers.inviteDialog.validationWarning'), life: 3000 });
    return;
  }
  
  // Ne jamais permettre d'inviter un owner
  if (inviteRole.value === 'owner') {
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.inviteDialog.cannotInviteOwner'), 
      life: 3000 
    });
    return;
  }
  
  isSendingInvite.value = true;
  try {
    // Ensure role is one of the valid values the API expects
    const role = inviteRole.value === 'admin' || inviteRole.value === 'member' 
      ? inviteRole.value 
      : 'member'; // Default to member if somehow invalid
      
    await invitationStore.inviteMember({
      email: inviteEmail.value,
      role: role,
      organizationId: currentOrganization.value.id,
    });
    
    toast.add({ severity: 'success', summary: t('dashboard.orgMembers.inviteDialog.inviteSentSuccess'), life: 3000 });
    showInviteDialog.value = false;
    inviteEmail.value = '';
    inviteRole.value = 'member';
    fetchInvitations(); // Refresh invitations list
  } catch (error) {
    console.error("Error sending invite:", error);
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.inviteDialog.inviteSentError'), 
      detail: getErrorMessage(error), 
      life: 3000 
    });
  } finally {
    isSendingInvite.value = false;
  }
};

const canEditMember = (member) => {
  if (isMember.value) return false; // Les members ne peuvent rien modifier
  if (!canManageMembers.value) return false;
  
  // Ne pas permettre à un admin de modifier un owner
  if (isAdmin.value && member.role === 'owner') return false;
  
  // Un owner peut modifier tous les autres (sauf pour donner ownership)
  // Un admin peut modifier les admins et members
  return true;
};

const canRemoveMember = (member) => {
  if (isMember.value) return false; // Les members ne peuvent rien supprimer
  if (!canManageMembers.value) return false;
  
  // Ne pas permettre de supprimer le seul owner
  if (member.role === 'owner' && onlyOneOwner.value) return false;
  
  // Ne pas permettre de supprimer le dernier admin
  if (member.role === 'admin' && onlyOneAdmin.value) return false;
  
  // Ne pas permettre à un admin de supprimer un owner
  if (isAdmin.value && member.role === 'owner') return false;
  
  return true;
};

const editMemberRole = (member) => {
  if (!canEditMember(member)) return;
  
  selectedMember.value = member;
  selectedRole.value = member.role || 'member';
  showEditRoleDialog.value = true;
};

const updateMemberRole = async () => {
  if (!selectedMember.value || !selectedRole.value || !currentOrganization.value?.id) return;
  
  const member = selectedMember.value;
  if (!member || typeof member !== 'object' || !('id' in member)) {
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.editRoleDialog.updateError'), 
      detail: 'Missing member ID', 
      life: 3000 
    });
    return;
  }
  
  // Vérifications de sécurité
  if (!canEditMember(member)) {
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.editRoleDialog.noPermission'), 
      life: 3000 
    });
    return;
  }
  
  // Ne jamais permettre d'assigner le rôle owner via cette fonction
  if (selectedRole.value === 'owner') {
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.editRoleDialog.cannotAssignOwner'), 
      life: 3000 
    });
    return;
  }
  
  const memberId = member.id;
  
  isUpdatingRole.value = true;
  try {
    const role = selectedRole.value === 'admin' || selectedRole.value === 'member' 
      ? selectedRole.value 
      : 'member';
      
    await organizationStore.updateMemberRole({
      memberId: memberId,
      role: role,
    }, currentOrganization.value.id);
    
    toast.add({ severity: 'success', summary: t('dashboard.orgMembers.editRoleDialog.updateSuccess'), life: 3000 });
    showEditRoleDialog.value = false;
    fetchMembers(); // Refresh members list
  } catch (error) {
    console.error("Error updating member role:", error);
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.editRoleDialog.updateError'), 
      detail: getErrorMessage(error), 
      life: 3000 
    });
  } finally {
    isUpdatingRole.value = false;
  }
};

const confirmRemoveMember = (member) => {
  if (!canRemoveMember(member)) {
    if (member.role === 'owner' && onlyOneOwner.value) {
      toast.add({
        severity: 'error',
        summary: t('dashboard.orgMembers.cannotRemoveOnlyOwner'),
        life: 3000
      });
    } else if (member.role === 'admin' && onlyOneAdmin.value) {
      toast.add({
        severity: 'error',
        summary: t('dashboard.orgMembers.removeAdminError'),
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: t('dashboard.orgMembers.noPermissionToRemove'),
        life: 3000
      });
    }
    return;
  }
  
  confirm.require({
    group: 'removeMember',
    message: t('dashboard.orgMembers.removeConfirmMessage', { email: member.user?.email || 'this member' }),
    header: t('dashboard.orgMembers.removeConfirmTitle'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    acceptLabel: t('dashboard.orgSettings.deleteButton'),
    rejectLabel: t('dashboard.orgSettings.cancelButton'),
    accept: async () => {
      await removeMember(member);
    },
  });
};

const removeMember = async (member) => {
  const identifier = member.id || (member.user && member.user.email);
  if (!identifier) {
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.removeError'), 
      detail: 'Member identifier not found', 
      life: 3000 
    });
    return;
  }
  
  try {
    await organizationStore.removeMember(identifier, currentOrganization.value?.id);
    toast.add({ severity: 'success', summary: t('dashboard.orgMembers.removeSuccess'), life: 3000 });
    fetchMembers(); // Refresh list
  } catch (error) {
    console.error("Error removing member:", error);
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.removeError'), 
      detail: getErrorMessage(error), 
      life: 3000 
    });
  }
};

const showTransferOwnership = () => {
  if (!isOwner.value) {
    toast.add({
      severity: 'error',
      summary: t('dashboard.orgMembers.transferOwnership.onlyOwnerCanTransfer'),
      life: 3000
    });
    return;
  }
  
  selectedNewOwner.value = null;
  showTransferOwnershipDialog.value = true;
};

const transferOwnership = async () => {
  if (!selectedNewOwner.value || !isOwner.value) return;
  
  isTransferringOwnership.value = true;
  try {
    // Transférer l'ownership au nouveau propriétaire
    await organizationStore.updateMemberRole({
      memberId: selectedNewOwner.value,
      role: 'owner',
    }, currentOrganization.value.id);
    
    // Rétrograder l'ancien owner en admin
    await organizationStore.updateMemberRole({
      memberId: currentUserMember.value.id,
      role: 'admin',
    }, currentOrganization.value.id);
    
    toast.add({ 
      severity: 'success', 
      summary: t('dashboard.orgMembers.transferOwnership.transferSuccess'), 
      life: 3000 
    });
    showTransferOwnershipDialog.value = false;
    fetchMembers(); // Refresh members list
  } catch (error) {
    console.error("Error transferring ownership:", error);
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.transferOwnership.transferError'), 
      detail: getErrorMessage(error), 
      life: 3000 
    });
  } finally {
    isTransferringOwnership.value = false;
  }
};

const copyInviteLink = async (invitation) => {
  if (!invitation || !invitation.id) {
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.errors.copyLinkError'), 
      detail: 'Invitation ID not found', 
      life: 3000 
    });
    return;
  }
  
  try {
    await navigator.clipboard.writeText(window.location.origin + '/accept-invitation/' + invitation.id);
    toast.add({ 
      severity: 'info', 
      summary: t('dashboard.orgMembers.invitationLinkCopied', {id: invitation.id}), 
      life: 3000 
    });
  } catch (err) {
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.errors.copyLinkError'), 
      detail: getErrorMessage(err), 
      life: 3000 
    });
  }
};

const cancelInvitation = async (invitation) => {
  if (!canInvite.value) {
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.noPermissionToCancelInvitation'), 
      life: 3000 
    });
    return;
  }
  
  if (!invitation || !invitation.id) {
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.errors.cancelInvitationError'), 
      detail: 'Invitation ID not found', 
      life: 3000 
    });
    return;
  }
  
  try {
    await invitationStore.cancelInvitation(invitation.id);
    
    toast.add({ severity: 'success', summary: t('dashboard.orgMembers.invitationCancelled'), life: 3000 });
    fetchInvitations(); // Refresh list
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.errors.cancelInvitationError'), 
      detail: getErrorMessage(error), 
      life: 3000 
    });
  }
};

const resendInvitation = async (invitation) => {
  if (!canInvite.value) {
    toast.add({ 
      severity: 'error', 
      summary: t('dashboard.orgMembers.noPermissionToResendInvitation'), 
      life: 3000 
    });
    return;
  }
  
  try {
    await invitationStore.inviteMember({
      email: invitation.email,
      role: invitation.role,
      organizationId: currentOrganization.value.id,
    });
    toast.add({ severity: 'success', summary: t('dashboard.orgMembers.invitationResent'), life: 3000 });
    fetchInvitations();
  } catch (error) {
    console.error("Error resending invitation:", error);
    toast.add({ 
      severity: 'error',
      summary: t('dashboard.orgMembers.errors.resendInvitationError'), 
      detail: getErrorMessage(error), 
      life: 3000
    });
  }
};

watch(currentOrganization, (newOrg) => {
  if (newOrg && newOrg.id) {
    fetchMembers();
    fetchInvitations();
  } else {
    members.value = [];
    invitations.value = [];
    currentUserMember.value = null;
  }
}, { immediate: true });

onMounted(() => {
  // Data fetching is now triggered by the watch on currentOrganization
});

</script>

<style scoped lang="scss">
.organization-members-view {
  padding: 20px;
}
.card {
  background-color: var(--surface-card);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
}
.p-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
</style> 