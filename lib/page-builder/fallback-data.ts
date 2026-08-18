import type { Data } from '@puckeditor/core';

import type { BuilderPage } from './types';

export function getFallbackBuilderData(slug: BuilderPage): Data {
    return {
        content:
            slug === 'homepage'
                ? [
                      {
                          type: 'HeroBlock',
                          props: {
                              id: 'homepage-hero',
                              tags: [{ label: 'homepage' }, { label: 'portfolio' }, { label: 'studio' }],
                              ctas: [],
                              image: {
                                  url: '',
                                  mode: 'inline',
                              },
                              title: 'Homepage builder',
                              subtitle: 'A simple editable homepage draft powered by Puck.',
                              align: 'left',
                              backgroundColor: '',
                              tagBackgroundColor: '',
                              tagTextColor: '',
                              textColors: {},
                          },
                      },
                      {
                          type: 'TextBlock',
                          props: {
                              id: 'homepage-featured-work',
                              title: 'This is a title',
                              text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut aliquam lacinia, nunc nisl aliquam nisl, eget aliquam nunc nisl eget nunc.',
                              backgroundColor: '',
                              textColors: {},
                          },
                      },
                  ]
                : [
                      {
                          type: 'HeroBlock',
                          props: {
                              id: 'about-hero',
                              tags: [{ label: 'about' }, { label: 'story' }],
                              ctas: [],
                              image: {
                                  url: '',
                                  mode: 'inline',
                              },
                              title: 'About builder',
                              subtitle: 'A first editable version of the photographer about page.',
                              align: 'center',
                              backgroundColor: '',
                              tagBackgroundColor: '',
                              tagTextColor: '',
                              textColors: {},
                          },
                      },
                      {
                          type: 'TextBlock',
                          props: {
                              id: 'about-story',
                              title: 'Story',
                              text: 'Use this page to introduce the photographer, their visual approach, and the kind of sessions or collaborations they offer.',
                              backgroundColor: '',
                              textColors: {},
                          },
                      },
                  ],
        root: {},
        zones: {},
    };
}
