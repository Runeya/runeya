const { betterAuth } = require("better-auth");
const { toNodeHandler } = require("better-auth/node");
const { MongoClient } = require("mongodb");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
const { apiKey, organization } = require("better-auth/plugins");
const { mailer } = require("@runeya/common-mailer");

const client = new MongoClient(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/runeya?authSource=admin`, {directConnection: true});
const db = client.db();
 
module.exports.express = (app) => {
  app.all("/api/auth/*", toNodeHandler(module.exports.auth)); 
};
const from = {
  name: 'Runeya',
  email: 'contact@runeya.dev',
};
module.exports.auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		autoSignIn: true,
		resetPasswordTokenExpiresIn: 3600,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({user, url, token}) => {
      await mailer.sendFromHtml({
        to: user.email,
        from,
        subject: 'Reset your password',
        html: `Click <a href="{{url}}">here</a> to reset your password.`,
        data: {
          url,
          token,
        },
      });
    },
  }, 
  emailVerification: {
    enabled: true,
    sendOnSignUp: false,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({user, url, token}) => {
      await mailer.sendFromHtml({
        to: user.email,
        from,
        subject: 'Verify your email',
        html: `Click <a href="{{url}}">here</a> to verify your email.`,
        data: {
          url: `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.APP_LANDING_URL}/app/dashboard`,
          token,
        },
      });
    },
  },
  basePath: '/api/auth',
  baseURL: 'http://localhost:5469',
  plugins: [
    apiKey(),
    organization({
      cancelPendingInvitationsOnReInvite: true,
      sendInvitationEmail: async (data) => {
        await mailer.sendFromHtml({
          to: data.email,
          subject: 'Invitation to join organization',
          html: `
            <p>You are invited to join the organization {{organization}}.</p>
            <p>Click <a href="{{url}}">here</a> to accept the invitation.</p>
          `,
          from,
          data: {
            organization: data.organization.name,
            url: `${process.env.APP_LANDING_URL}/accept-invitation/${data.id}`,
          },
        });
        console.log('Invitation sent to:', data.email, 'for organization:', data.organization.name);
      },
      organizationLimit: 5,
      membershipLimit: 50,
      invitationExpiresIn: 172800, // 48 hours
      enabled: true,
    })
  ],
  trustedOrigins: ['http://localhost:5555', 'https://runeya.dev', 'https://www.runeya.dev'],
  socialProviders: { 
      github: { 
        clientId: process.env.GITHUB_CLIENT_ID || '', 
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      }, 
  },
});
