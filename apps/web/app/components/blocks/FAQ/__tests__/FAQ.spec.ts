import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import FAQ from '../FAQ.vue';

const { registerBlockVisibilityMock, useHeadMock } = vi.hoisted(() => ({
  registerBlockVisibilityMock: vi.fn(),
  useHeadMock: vi.fn(),
}));

mockNuxtImport('useBlocksVisibility', () => () => ({
  registerBlockVisibility: registerBlockVisibilityMock,
}));

mockNuxtImport('useHead', () => useHeadMock);

describe('FAQ.vue', () => {
  const baseProps = {
    meta: { uuid: 'faq-uuid' },
    content: {
      text: {
        title: 'FAQ',
      },
      items: [
        {
          question: 'Wie sende ich Ware zurueck?',
          answerHtml: '<p>Du kannst Ware an uns zurueck senden.</p>',
        },
        {
          question: '',
          answerHtml: '<p>Wird nicht angezeigt.</p>',
        },
      ],
      layout: {
        initiallyOpenFirst: true,
      },
    },
  };

  it('renders questions and answers', () => {
    const wrapper = mount(FAQ, { props: baseProps });

    expect(wrapper.text()).toContain('FAQ');
    expect(wrapper.text()).toContain('Wie sende ich Ware zurueck?');
    expect(wrapper.find('[data-testid="faq-answer-0"]').html()).toContain('Du kannst Ware');
    expect(wrapper.findAll('[data-testid^="faq-item-"]')).toHaveLength(1);
  });

  it('registers FAQPage structured data', () => {
    mount(FAQ, { props: baseProps });

    expect(useHeadMock).toHaveBeenCalled();
    const headFactory = useHeadMock.mock.calls[0]?.[0] as () => { script: Array<{ innerHTML: string }> };
    const script = headFactory().script[0];
    const structuredData = JSON.parse(script!.innerHTML);

    expect(structuredData['@type']).toBe('FAQPage');
    expect(structuredData.mainEntity[0]).toMatchObject({
      '@type': 'Question',
      name: 'Wie sende ich Ware zurueck?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Du kannst Ware an uns zurueck senden.',
      },
    });
  });
});
