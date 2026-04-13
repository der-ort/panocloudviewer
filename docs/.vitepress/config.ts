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
      { text: 'Features', link: '/features/measurements' },
      { text: 'API', link: '/api/components' },
      { text: 'GitHub', link: 'https://github.com/der-ort/pano-cloud-viewer' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Data Format', link: '/guide/data-format' },
          { text: 'Point Cloud Preparation', link: '/guide/point-cloud-preparation' },
        ],
      },
      {
        text: 'Integrations',
        items: [
          { text: 'React', link: '/integrations/react' },
          { text: 'Next.js', link: '/integrations/nextjs' },
          { text: 'Electron', link: '/integrations/electron' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'Measurements', link: '/features/measurements' },
          { text: 'Panoramas', link: '/features/panoramas' },
          { text: 'Clipping & Sections', link: '/features/clipping' },
          { text: 'Export', link: '/features/export' },
        ],
      },
      {
        text: 'Customization',
        items: [
          { text: 'Theming', link: '/theming' },
          { text: 'Composable API', link: '/composable-api' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Components', link: '/api/components' },
          { text: 'Hooks', link: '/api/hooks' },
          { text: 'Providers', link: '/api/providers' },
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
