import { flushPromises, mount } from '@vue/test-utils';
import { AddressFormBilling } from '#components';
import { AddressType } from '@plentymarkets/shop-api';

describe('<AddressFormBilling />', () => {
  beforeEach(() => {
    clearNuxtState();
  });

  it('shows validation errors for required fields on submit', async () => {
    const addressForm = useAddressForm(AddressType.Billing);
    const validationResult = await addressForm.validationSchema.parse({});
    expect(validationResult.errors.length).toBeGreaterThan(0);
    addressForm.add.value = true;

    const wrapper = mount(AddressFormBilling, {
      attachTo: document.body,
      props: {
        disabled: false,
        addAddress: true,
      },
    });

    const saveButton = wrapper.get(`[data-testid='save-address-${AddressType.Billing}']`);
    expect(saveButton.attributes('type')).toBe('button');
    await saveButton.trigger('click');
    await flushPromises();

    expect(wrapper.get(`[data-testid='save-address-${AddressType.Billing}']`));
    expect(wrapper.text()).toContain('This is a mandatory field.');
    wrapper.unmount();
  });
});
