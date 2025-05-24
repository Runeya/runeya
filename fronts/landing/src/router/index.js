import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import AuthCallback from '../views/AuthCallback.vue';
import Home from '../views/Home.vue';
import SignUp from '../views/SignUp.vue';
import AcceptInvitation from '../views/AcceptInvitation.vue';
import authStore from '../stores/authStore';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import Organizations from '../views/dashboard/Organizations.vue';
import OrganizationSettings from '../views/dashboard/OrganizationSettings.vue';
import OrganizationMembers from '../views/dashboard/OrganizationMembers.vue';
import useOrganizationStore from '../stores/organizationStore.js';
import NewOrganization from '../views/dashboard/NewOrganization.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: 'Runeya - Harmonious Development',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'Sign in - Runeya',
      requiresAuth: false
    }
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignUp,
    meta: {
      title: 'Create account - Runeya',
      requiresAuth: false
    }
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: AuthCallback,
    meta: {
      title: 'Authenticating - Runeya',
      requiresAuth: false
    }
  },
  
  // Dashboard Routes
  {
    path: '/app/dashboard',
    name: 'dashboard-root',
    beforeEnter: async (to, from, next) => {
      const store = await useOrganizationStore().waitReady();
      const orgs = store.organizations.value;
      console.log(orgs)
      if (orgs && orgs.length > 0) {
        next(`/app/dashboard/${orgs[0].id}/organizations`);
      } else {
        next();
      }
    },
    component: DashboardLayout,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/app/dashboard/:orgId',
    component: DashboardLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'organizations',
        name: 'organizations',
        component: Organizations,
        meta: {
          title: 'Organizations - Runeya',
          requiresAuth: true
        }
      },
      {
        path: 'organization/settings',
        name: 'organization-settings',
        component: OrganizationSettings,
        meta: {
          title: 'Organization Settings - Runeya',
          requiresAuth: true
        }
      },
      {
        path: 'organization/members',
        name: 'organization-members',
        component: OrganizationMembers,
        meta: {
          title: 'Organization Members - Runeya',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/accept-invitation/:id',
    name: 'accept-invitation',
    component: AcceptInvitation,
    meta: {
      title: 'Accept Invitation - Runeya',
      requiresAuth: true
    }
  },
  // Route pour la création d'organisation
  {
    path: '/app/dashboard/new-organization',
    name: 'new-organization',
    component: NewOrganization,
    meta: {
      title: 'Créer une organisation',
      requiresAuth: true
    }
  },
  // Fallback route
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

// Update document title and check authentication
router.beforeEach(async (to, from, next) => {
  if (to.meta.title) {
    document.title = String(to.meta.title);
  } else {
    document.title = 'Runeya';
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    try {
      const session = await authStore.getSession();
      if (!session) {
        // Redirect to login with return URL for post-login redirect
        return next({
          path: '/login',
          query: { returnUrl: to.fullPath }
        });
      }
    } catch (err) {
      console.error('Authentication check failed:', err);
      return next({
        path: '/login',
        query: { returnUrl: to.fullPath }
      });
    }
  }
  
  next();
});

export default router; 