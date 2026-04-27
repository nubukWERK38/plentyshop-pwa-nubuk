import { mount } from '@vue/test-utils';
import NumericIdTagSelect from '../NumericIdTagSelect.vue';

describe('NumericIdTagSelect', () => {
  const MultiselectStub = defineComponent({
    name: 'Multiselect',
    props: {
      modelValue: {
        type: Array,
        required: true,
      },
    },
    emits: ['update:modelValue', 'tag'],
    template: `
      <div>
        <div data-testid="selected-model">{{ JSON.stringify(modelValue) }}</div>
        <button data-testid="emit-invalid" @click="$emit('tag', 'abc')">invalid</button>
        <button data-testid="emit-valid" @click="$emit('tag', '21')">valid</button>
        <button data-testid="remove-all" @click="$emit('update:modelValue', [])">clear</button>
        <slot />
      </div>
    `,
  });

  const createWrapper = () =>
    mount(NumericIdTagSelect, {
      props: {
        modelValue: [10],
        label: 'Property IDs',
        placeholder: 'Add IDs',
        tagPlaceholder: 'Press Enter',
        deselectLabel: 'Selected',
        helpText: 'Help text',
        invalidTitle: 'Invalid IDs',
        invalidHelpText: 'Only numbers are allowed',
        previewTitle: 'Live preview',
        previewEmptyText: 'No IDs selected',
        previewUnavailableText: 'No match found',
        previewItems: [{ id: 10, label: 'Material', description: 'Cotton' }],
        dataTestId: 'property-ids',
      },
      global: {
        stubs: {
          UiFormLabel: { template: '<label><slot /></label>' },
          Multiselect: MultiselectStub,
        },
      },
    });

  it('should render preview rows for selected IDs', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('[data-testid="property-ids-preview"]').text()).toContain('Material');
    expect(wrapper.text()).toContain('Cotton');
  });

  it('should include property name in selected tag display model', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('[data-testid="selected-model"]').text()).toContain('#10 - Material');
  });

  it('should show a validation error for invalid tags', async () => {
    const wrapper = createWrapper();

    await wrapper.find('[data-testid="emit-invalid"]').trigger('click');

    expect(wrapper.find('[data-testid="property-ids-errors"]').text()).toContain('Invalid IDs');
    expect(wrapper.text()).toContain('abc');
  });

  it('should emit numeric IDs for valid tags', async () => {
    const wrapper = createWrapper();

    await wrapper.find('[data-testid="emit-valid"]').trigger('click');

    expect(wrapper.emitted('update:modelValue')).toEqual([[[10, 21]]]);
  });
});