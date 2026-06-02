// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap'
        }
      ],
      script: [
        {
          'src': 'https://saltwood.top:3033/script.js',
          'data-website-id': '97184747-f3f3-4a0b-83ed-9a08f53822b9',
          'defer': true
        }
      ]
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/404': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
