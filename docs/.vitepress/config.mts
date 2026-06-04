import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'PanoCloudViewer',
  description: 'Embeddable React component for Potree 2.0 point clouds and 360° panoramic images',
  lang: 'en-US',

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'PanoCloudViewer',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api' },
      { text: 'GitHub', link: 'https://github.com/der-ort/pano-cloud-viewer' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Data Format', link: '/guide/data-format' },
          { text: 'Integration Guide', link: '/integration' },
        ],
      },
      {
        text: 'UI & Customisation',
        items: [
          { text: 'Custom UI', link: '/guide/custom-ui' },
          { text: 'Theming', link: '/guide/theming' },
          { text: 'Navigation Modes', link: '/guide/navigation' },
        ],
      },
      {
        text: 'Developer Guide',
        items: [
          { text: 'Development Setup', link: '/guide/development' },
          { text: 'Architecture', link: '/architecture' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Full API Reference', link: '/api' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/der-ort/pano-cloud-viewer' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © der-ort',
    },

    search: {
      provider: 'local',
    },
  },
})
