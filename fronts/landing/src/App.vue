<template>
  <div class="font-inter min-h-screen bg-stone-50 text-neutral-800 antialiased">
    <!-- Subtle organic background shapes -->
    <div class="fixed inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
      <div class="absolute top-0 -left-1/4 w-96 h-96 bg-emerald-200 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 -right-1/4 w-96 h-96 bg-sky-200 rounded-full blur-3xl"></div>
    </div>

    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center space-x-2">
            <svg class="h-8 w-auto text-emerald-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11.26 18.08C8.32 17.62 6 15.08 6 12C6 8.92 8.32 6.38 11.26 5.92C11.48 5.04 12.48 4.4 13.42 4.8C16.88 6.02 18.5 9.38 17.82 12.8C17.32 15.78 15.02 17.98 12.2 18.16C11.86 18.18 11.52 18.16 11.26 18.08Z" />
            </svg>
            <h1 class="text-2xl font-semibold tracking-tight">
              <span class="text-emerald-600">rune</span><span class="text-neutral-700">ya</span>
            </h1>
          </div>
          
          <!-- Desktop navigation -->
          <nav class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-neutral-600 hover:text-emerald-600 transition-colors font-medium text-sm">{{ $t('header.features') }}</a>
            <a href="#benefits" class="text-neutral-600 hover:text-emerald-600 transition-colors font-medium text-sm">{{ $t('header.benefits') }}</a>
            <a href="#about" class="text-neutral-600 hover:text-emerald-600 transition-colors font-medium text-sm">{{ $t('header.about') }}</a>
            <a href="https://github.com/runeya/runeya" target="_blank" class="text-neutral-600 hover:text-emerald-600 transition-colors font-medium text-sm">{{ $t('header.github') }}</a>
          </nav>
          
          <!-- Right side -->
          <div class="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            <a :href="docsUrl" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md">
              {{ $t('header.launch') }}
            </a>
          </div>
          
          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button @click="toggleMobileMenu" type="button" class="text-neutral-700 hover:text-emerald-600 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMobileMenuOpen" class="md:hidden bg-white border-b border-stone-200 shadow-lg">
        <nav class="px-4 pt-2 pb-4 space-y-3">
          <a href="#features" @click="closeMobileMenu" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50">{{ $t('header.features') }}</a>
          <a href="#benefits" @click="closeMobileMenu" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50">{{ $t('header.benefits') }}</a>
          <a href="#about" @click="closeMobileMenu" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50">{{ $t('header.about') }}</a>
          <a href="https://github.com/runeya/runeya" @click="closeMobileMenu" target="_blank" class="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-emerald-600 hover:bg-emerald-50">{{ $t('header.github') }}</a>
          <div class="pt-3">
            <LanguageSelector @language-changed="closeMobileMenu" />
          </div>
          <a :href="docsUrl" target="_blank" class="mt-4 block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg text-base font-medium transition-colors shadow-sm hover:shadow-md">
            {{ $t('header.launch') }}
          </a>
        </nav>
      </div>
    </header>

    <main class="relative z-10">
      <!-- Hero section -->
      <section class="pt-24 pb-20 md:pt-32 md:pb-28">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {{ $t('hero.title') }}
              <span class="block mt-2 bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">pour un développement harmonieux</span>
            </h1>
            <p class="text-lg sm:text-xl text-neutral-600 max-w-2xl mb-10 mx-auto">
              {{ $t('hero.description') }}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a :href="docsUrl" target="_blank" class="inline-flex items-center justify-center px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                {{ $t('hero.getStarted') }}
                <svg class="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="https://github.com/runeya/runeya" target="_blank" class="inline-flex items-center justify-center px-7 py-3 bg-white hover:bg-stone-100 text-neutral-700 font-medium rounded-lg border border-stone-300 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                <svg class="w-5 h-5 mr-2 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z" />
                </svg>
                {{ $t('hero.viewGithub') }}
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Features section -->
      <section id="features" class="py-20 bg-white">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <span class="text-sm font-semibold text-emerald-600 uppercase tracking-wider">{{ $t('features.title') }}</span>
            <h2 class="mt-2 text-3xl font-bold text-neutral-800 sm:text-4xl">
              {{ $t('features.synergyTitle') }}
            </h2>
            <p class="mt-4 max-w-2xl text-lg text-neutral-600 mx-auto">
              {{ $t('features.synergyDescription') }}
            </p>
          </div>
          
          <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <!-- Feature 1 -->
            <div class="bg-stone-50 rounded-xl p-8 border border-stone-100 shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
              <div class="w-14 h-14 rounded-lg bg-emerald-100 flex items-center justify-center mb-6 ring-4 ring-emerald-200/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-neutral-800 mb-3">{{ $t('features.monitoring.title') }}</h3>
              <p class="text-neutral-600 text-sm leading-relaxed">{{ $t('features.monitoring.description') }}</p>
            </div>

            <!-- Feature 2 -->
            <div class="bg-stone-50 rounded-xl p-8 border border-stone-100 shadow-lg hover:shadow-sky-500/20 transition-shadow duration-300">
              <div class="w-14 h-14 rounded-lg bg-sky-100 flex items-center justify-center mb-6 ring-4 ring-sky-200/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A7.985 7.985 0 0112 0c0 0 0 0 0 0zm6.343 0A8 8 0 0112 2.343v0M12 12H3M12 12l9-9" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-neutral-800 mb-3">{{ $t('features.microservices.title') }}</h3>
              <p class="text-neutral-600 text-sm leading-relaxed">{{ $t('features.microservices.description') }}</p>
            </div>

            <!-- Feature 3 -->
            <div class="bg-stone-50 rounded-xl p-8 border border-stone-100 shadow-lg hover:shadow-amber-500/20 transition-shadow duration-300">
              <div class="w-14 h-14 rounded-lg bg-amber-100 flex items-center justify-center mb-6 ring-4 ring-amber-200/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-neutral-800 mb-3">{{ $t('features.sharing.title') }}</h3>
              <p class="text-neutral-600 text-sm leading-relaxed">{{ $t('features.sharing.description') }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Benefits section -->
      <section id="benefits" class="py-20">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <span class="text-sm font-semibold text-emerald-600 uppercase tracking-wider">{{ $t('benefits.title') }}</span>
            <h2 class="mt-2 text-3xl font-bold text-neutral-800 sm:text-4xl">
              Cultivez votre <span class="text-emerald-600">productivité</span>
            </h2>
            <p class="mt-4 max-w-2xl text-lg text-neutral-600 mx-auto">
              Runeya est conçu pour que vous puissiez vous concentrer sur l'essentiel : créer.
            </p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-10 items-center">
            <div class="space-y-8">
              <!-- Benefit 1 -->
              <div class="flex items-start p-6 bg-white rounded-xl shadow-lg border border-stone-100 hover:shadow-emerald-500/10 transition-shadow">
                <div class="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-semibold text-neutral-800">{{ $t('benefits.productivity.title') }}</h3>
                  <p class="mt-1 text-neutral-600 text-sm leading-relaxed">{{ $t('benefits.productivity.description') }}</p>
                </div>
              </div>
              
              <!-- Benefit 2 -->
              <div class="flex items-start p-6 bg-white rounded-xl shadow-lg border border-stone-100 hover:shadow-sky-500/10 transition-shadow">
                <div class="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-semibold text-neutral-800">{{ $t('benefits.detection.title') }}</h3>
                  <p class="mt-1 text-neutral-600 text-sm leading-relaxed">{{ $t('benefits.detection.description') }}</p>
                </div>
              </div>
              
              <!-- Benefit 3 -->
              <div class="flex items-start p-6 bg-white rounded-xl shadow-lg border border-stone-100 hover:shadow-amber-500/10 transition-shadow">
                <div class="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-xl">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                </div>
                <div class="ml-5">
                  <h3 class="text-lg font-semibold text-neutral-800">{{ $t('benefits.debugging.title') }}</h3>
                  <p class="mt-1 text-neutral-600 text-sm leading-relaxed">{{ $t('benefits.debugging.description') }}</p>
                </div>
              </div>
            </div>
            
            <div class="mt-10 md:mt-0">
              <div class="relative">
                <div class="absolute inset-0 -m-4 bg-gradient-to-br from-emerald-200 to-sky-200 rounded-2xl blur-xl opacity-50"></div>
                <img src="@/assets/images/placeholder.svg" alt="Developer using Runeya" class="relative w-full h-auto rounded-2xl shadow-2xl border border-stone-200" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- About section -->
      <section id="about" class="py-20 bg-white">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto">
            <span class="text-sm font-semibold text-emerald-600 uppercase tracking-wider">{{ $t('about.title') }}</span>
            <h2 class="mt-2 text-3xl font-bold text-neutral-800 sm:text-4xl">
              Notre <span class="text-emerald-600">engagement</span>
            </h2>
            <div class="mt-10 bg-stone-50 rounded-2xl p-10 border border-stone-100 shadow-xl">
              <p class="text-xl text-neutral-700 leading-relaxed">{{ $t('about.description') }}</p>
              <div class="mt-8">
                <a href="https://github.com/runeya/runeya" target="_blank" class="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z" />
                  </svg>
                  {{ $t('about.visitGithub') }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA section -->
      <section class="py-24">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="relative bg-gradient-to-br from-emerald-500 to-sky-600 rounded-2xl p-12 shadow-2xl overflow-hidden">
            <div class="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle fill="#FFF" cx="2" cy="2" r="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#dots)"/></svg>
            </div>
            <div class="text-center relative z-10">
              <h2 class="text-3xl sm:text-4xl font-bold text-white">
                Prêt à faire éclore vos projets ?
              </h2>
              <p class="mt-4 text-lg text-emerald-100 max-w-xl mx-auto">
                Rejoignez Runeya aujourd'hui et cultivez un environnement de développement plus productif et serein.
              </p>
              <div class="mt-10">
                <a :href="docsUrl" target="_blank" class="inline-flex items-center justify-center px-8 py-3.5 bg-white text-emerald-600 font-semibold rounded-lg shadow-lg hover:bg-emerald-50 transition-colors duration-300 text-lg transform hover:scale-105">
                  Lancer Runeya
                  <svg class="ml-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-stone-100 border-t border-stone-200 text-neutral-600">
      <div class="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-8 md:mb-0 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start space-x-2 mb-2">
               <svg class="h-7 w-auto text-emerald-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11.26 18.08C8.32 17.62 6 15.08 6 12C6 8.92 8.32 6.38 11.26 5.92C11.48 5.04 12.48 4.4 13.42 4.8C16.88 6.02 18.5 9.38 17.82 12.8C17.32 15.78 15.02 17.98 12.2 18.16C11.86 18.18 11.52 18.16 11.26 18.08Z" /></svg>
              <h2 class="text-xl font-semibold text-neutral-700">
                <span class="text-emerald-600">rune</span>ya
              </h2>
            </div>
            <p class="text-sm">{{ $t('footer.description') }}</p>
          </div>
          <div class="flex space-x-5">
            <a href="https://github.com/runeya/runeya" target="_blank" class="text-neutral-500 hover:text-emerald-600 transition-colors">
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <title>GitHub</title>
                <path d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z" />
              </svg>
            </a>
            <a href="https://www.npmjs.com/~runeya" target="_blank" class="text-neutral-500 hover:text-emerald-600 transition-colors">
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <title>NPM</title>
                <path d="M0 0v24h24V0H0zm19.2 19.2h-2.4V9.6h-4.8v9.6H4.8V4.8h14.4v14.4z"/>
              </svg>
            </a>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-stone-300 text-center text-sm text-neutral-500">
          <p>{{ $t('footer.copyright', { year: new Date().getFullYear() }) }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import LanguageSelector from './components/LanguageSelector.vue';

const docsUrl = process.env.VUE_APP_DOCS_URL;
const isMobileMenuOpen = ref(false);
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<style>
html {
  scroll-behavior: smooth;
}
/* Suppression des anciens styles futuristes spécifiques */
</style> 