# Runeya Landing Page

This is the landing page for Runeya, a powerful process management and monitoring tool. The landing page is built with Vue 3 and Tailwind CSS.

## Development

To start the development server:

```bash
# Install dependencies
yarn install

# Start development server
yarn serve
```

## Building for Production

To build the site for production:

```bash
yarn build
```

The output will be in the `dist` directory, which can be deployed to any static hosting service.

## Technologies Used

- Vue 3
- Vite
- Tailwind CSS
- Font Awesome

## Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, styles, etc.
│   ├── components/      # Vue components
│   ├── views/           # Page views
│   ├── App.vue          # Root component
│   └── main.js          # Application entry point
├── index.html           # HTML template
├── package.json         # Project dependencies
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.mjs      # Vite configuration
``` 