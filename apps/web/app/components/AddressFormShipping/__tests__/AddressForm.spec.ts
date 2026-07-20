import { flushPromises, mount } from '@vue/test-utils';
import { AddressFormShipping } from '#components';
import { AddressType } from '@plentymarkets/shop-api';

describe('<AddressFormShipping />', () => {
  beforeEach(() => {
    clearNuxtState();
  });

  it('shows validation errors for required fields on submit', async () => {
    const addressForm = useAddressForm(AddressType.Shipping);
    const validationResult = await addressForm.validationSchema.parse({});
    expect(validationResult.errors.length).toBeGreaterThan(0);
    addressForm.add.value = true;

    const wrapper = mount(AddressFormShipping, {
      attachTo: document.body,
      props: {
        disabled: false,
        addAddress: true,
      },
    });

    const saveButton = wrapper.get(`[data-testid='save-address-${AddressType.Shipping}']`);
    expect(saveButton.attributes('type')).toBe('button');
    await saveButton.trigger('click');
    await flushPromises();

    expect(wrapper.get(`[data-testid='save-address-${AddressType.Shipping}']`));
    expect(wrapper.text()).toContain('This is a mandatory field.');
    wrapper.unmount();
  });
});
