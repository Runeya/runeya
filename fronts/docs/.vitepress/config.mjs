import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Runeya",
  vite: {
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5173
    } 
  },
  description: "Configure, share, launch and monitor all your services in the same place for your development team",
  base: '/',
  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    // fr: {
    //   label: 'French',
    //   lang: 'fr', 
    // }
  },
  themeConfig: {
    search: {
      provider: 'local',
      options: {}
    },
    logo: '/rocket.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting started', link: '/introduction/getting-started' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is Runeya', link: '/introduction/what-is' },
          { text: 'Getting started', link: '/introduction/getting-started' },
        ]
      }, {
        text: 'Guide',
        items: [
          { text: 'First launch', link: '/guide/first-launch.md' },
          { text: 'Create your first service', link: '/guide/create-new-service.md' }
        ]
      }, {
        text: 'Reference',
        items: [
          { text: 'Global environment variables', link:'/reference/global-environment-variables.md'},
          { text: 'Commands', link: '/reference/commands.md' },
          { text: 'Envs', link: '/reference/envs.md' },
          { text: 'Git', link: '/reference/git.md' },
          { text: 'Health Check', link: '/reference/health-check.md' },
          { text: 'Metadata', link: '/reference/metadata.md' },
          { text: 'OpenAPI', link: '/reference/openapi.md' },
          { text: 'Parsers', link: '/reference/parsers.md' },
          { text: 'Security', link: '/reference/security.md' }
        ]
      }, {
        text: 'Integration',
        items: [
          { text: 'Visual Studio Code', link: '/integration/vscode' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/runeya/runeya' }
    ]
  }
})
