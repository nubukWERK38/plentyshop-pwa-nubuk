import { defineComponent } from 'vue';
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import Tabs from '../Tabs.vue';

const { registerBlockVisibilityMock } = vi.hoisted(() => ({
  registerBlockVisibilityMock: vi.fn(),
}));

mockNuxtImport('useBlocksVisibility', () => () => ({
  registerBlockVisibility: registerBlockVisibilityMock,
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
});
