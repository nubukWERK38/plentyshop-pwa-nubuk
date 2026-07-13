import { mount } from '@vue/test-utils';
import type { Product } from '@plentymarkets/shop-api';
import ManufacturerInformation from '../ManufacturerInformation.vue';

vi.mock('@plentymarkets/shop-api', () => ({
  productGetters: {
    getManufacturer: (product: Product) => product.item.manufacturer,
  },
  manufacturerGetters: {
    getManufacturerContactUrl: () => '',
    getManufacturerCountry: () => null,
    getManufacturerEmail: () => '',
    getManufacturerExternalName: () => '',
    getManufacturerFaxNumber: () => '',
    getManufacturerHouseNo: () => '',
    getManufacturerLegalName: () => '',
    getManufacturerLogo: () => '',
    getManufacturerName: () => 'Wolf Tooth',
    getManufacturerPhoneNumber: () => '',
    getManufacturerPostCode: () => '',
    getManufacturerStreet: () => '',
    getManufacturerTown: () => '',
    getManufacturerUrl: (manufacturer: { url?: string }) => manufacturer.url ?? '',
  },
}));

describe('ManufacturerInformation', () => {
  it('renders manufacturer homepage without protocol as external link', () => {
    const wrapper = mount(ManufacturerInformation, {
      props: {
        product: {
          item: {
            manufacturer: {
              url: 'www.wolftoothcomponents.com',
            },
          },
        } as Product,
      },
    });

    const link = wrapper.find('a[href="https://www.wolftoothcomponents.com"]');

    expect(link.exists()).toBe(true);
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toBe('noopener noreferrer');
    expect(link.text()).toContain('www.wolftoothcomponents.com');
  });
});
