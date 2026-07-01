import { defineComponent } from 'vue';
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import Tabs from '../Tabs.vue';

const { registerBlockVisibilityMock, technicalDataHasContentMock } = vi.hoisted(() => ({
  registerBlockVisibilityMock: vi.fn(),
  technicalDataHasContentMock: { value: true },
}));

mockNuxtImport('useBlocksVisibility', () => () => ({
  registerBlockVisibility: registerBlockVisibilityMock,
}));

mockNuxtImport('useTechnicalData', () => () => ({
  hasContent: technicalDataHasContentMock,
}));

mockNuxtImport('useRoute', () => () => ({
  hash: '',
}));

describe('Tabs.vue', () => {
  const UiButtonStub = defineComponent({
    emits: ['click'],
    template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
  });

  const baseProps = {
    meta: { uuid: 'tabs-uuid' },
    content: {
      items: [
        { title: 'First', html: '<p>First content</p>' },
        { title: 'Second', html: '<p>Second content</p>' },
      ],
      layout: {},
    },
  };

  const propsWithTechnicalDataTab = {
    meta: { uuid: 'tabs-uuid' },
    content: {
      items: [
        { title: 'Beschreibung', html: '<p>Beschreibung content</p>' },
        {
          title: 'Technische Daten',
          html: '',
          blocks: [
            {
              name: 'TechnicalData',
              type: 'content',
              meta: { uuid: 'technical-data-uuid' },
              content: { text: { title: '' }, layout: {} },
            },
          ],
        },
      ],
      layout: {},
    },
  };

  it('should render tab titles', () => {
    const wrapper = mount(Tabs, {
      props: baseProps,
      global: {
        stubs: {
          UiButton: UiButtonStub,
        },
      },
    });

    expect(wrapper.text()).toContain('First');
    expect(wrapper.text()).toContain('Second');
  });

  it('should show first tab content by default', () => {
    const wrapper = mount(Tabs, {
      props: baseProps,
      global: {
        stubs: {
          UiButton: UiButtonStub,
        },
      },
    });

    expect(wrapper.find('[data-testid="tabs-item-content-0"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('First content');
  });

  it('should switch active tab content when clicking a tab', async () => {
    const wrapper = mount(Tabs, {
      props: baseProps,
      global: {
        stubs: {
          UiButton: UiButtonStub,
        },
      },
    });

    await wrapper.get('[data-testid="tabs-item-1"]').trigger('click');

    expect(wrapper.find('[data-testid="tabs-item-content-1"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Second content');
  });

  it('should hide technical data tab when technical data is empty', () => {
    technicalDataHasContentMock.value = false;

    const wrapper = mount(Tabs, {
      props: propsWithTechnicalDataTab,
      global: {
        stubs: {
          UiButton: UiButtonStub,
        },
      },
    });

    expect(wrapper.text()).toContain('Beschreibung');
    expect(wrapper.text()).not.toContain('Technische Daten');
  });

  it('should show technical data tab when technical data has content', () => {
    technicalDataHasContentMock.value = true;

    const wrapper = mount(Tabs, {
      props: propsWithTechnicalDataTab,
      global: {
        stubs: {
          UiButton: UiButtonStub,
        },
      },
    });

    expect(wrapper.text()).toContain('Technische Daten');
  });
});
