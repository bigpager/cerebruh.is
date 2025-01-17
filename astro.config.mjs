import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import {defineConfig} from 'astro/config';

export default defineConfig({
  integrations: [
    react(), // Add React integration
    tailwind(),
    starlight({
      title: 'Cerebruh',
      description: '2nd Brain Infrastructure',
      social: {
        github: 'https://github.com/bigpager/cerebruh.is',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/getting-started/introduction/' },
            { label: 'Installation', link: '/getting-started/installation/' },
          ],
        },
      ],
    }),
  ],
});