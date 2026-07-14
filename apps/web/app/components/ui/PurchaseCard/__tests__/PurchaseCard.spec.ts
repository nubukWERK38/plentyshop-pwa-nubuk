import { mount } from '@vue/test-utils';
import { UiPurchaseCard } from '#components';
import type { ReviewCounts } from '@plentymarkets/shop-api';
import { SfIconCancel, SfIconCheckCircle, SfIconSchedule, SfIconWarehouse } from '@storefront-ui/vue';
import { ProductMock } from '../../../../../__tests__/__mocks__/product.mock';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  onBeforeRouteLeave: vi.fn(),
}));

describe('<PurchaseCard />', () => {
  it('should render component', () => {
    const wrapper = mount(UiPurchaseCard, {
      props: {
        product: ProductMock,
        reviewAverage: {} as ReviewCounts,
      },
      global: {
        stubs: {
          PayPalExpressButton: true,
          PayPalPayLaterBanner: true,
          UnitContentSelect: true,
        },
      },
    });

    expect(wrapper.getByTestId('purchase-card'));
  });

  it('should render without availability data', () => {
    const productWithoutAvailability = JSON.parse(JSON.stringify(ProductMock));
    delete productWithoutAvailability.variation.availability;

    const wrapper = mount(UiPurchaseCard, {
      props: {
        product: productWithoutAvailability,
        reviewAverage: {} as ReviewCounts,
      },
      global: {
        stubs: {
          PayPalExpressButton: true,
          PayPalPayLaterBanner: true,
          UnitContentSelect: true,
        },
      },
    });

    expect(wrapper.find('[data-testid="badges"]').exists()).toBe(false);
  });

  it('should render in-stock availability in green', () => {
    const inStockProduct = JSON.parse(JSON.stringify(ProductMock));
    inStockProduct.variation.availabilityId = 1;
    inStockProduct.variation.availability.names.name = 'LAGERND, VERSANDBEREIT IN 1 WERKTAG';

    const wrapper = mount(UiPurchaseCard, {
      props: {
        product: inStockProduct,
        reviewAverage: {} as ReviewCounts,
      },
      global: {
        stubs: {
          PayPalExpressButton: true,
          PayPalPayLaterBanner: true,
          UnitContentSelect: true,
        },
      },
    });

    expect(wrapper.find('.purchase-card__availability-icon--success').exists()).toBe(true);
    expect(wrapper.text()).toContain('Lagernd, Versandbereit in 1 Werktag');
    expect(wrapper.text()).not.toContain('LAGERND, VERSANDBEREIT IN 1 WERKTAG');
  });

  it.each([
    [1, 'success', SfIconCheckCircle],
    [2, 'info', SfIconCheckCircle],
    [3, 'info', SfIconSchedule],
    [4, 'info', SfIconWarehouse],
    [5, 'danger', SfIconCancel],
    [6, 'danger', SfIconCancel],
    [7, 'danger', SfIconCancel],
    [8, 'danger', SfIconCancel],
    [9, 'danger', SfIconCancel],
    [10, 'black', SfIconWarehouse],
  ])('should render availability %i with the %s color and its existing icon', (id, tone, icon) => {
    const product = JSON.parse(JSON.stringify(ProductMock));
    product.variation.availabilityId = id;

    const wrapper = mount(UiPurchaseCard, {
      props: {
        product,
        reviewAverage: {} as ReviewCounts,
      },
      global: {
        stubs: {
          PayPalExpressButton: true,
          PayPalPayLaterBanner: true,
          UnitContentSelect: true,
        },
      },
    });

    expect(wrapper.find(`.purchase-card__availability-icon--${tone}`).exists()).toBe(true);
    expect(wrapper.findComponent(icon).exists()).toBe(true);
  });

  it('should hide availability until a valid variation is selected', () => {
    const productWithUnselectedAttributes = JSON.parse(JSON.stringify(ProductMock));
    productWithUnselectedAttributes.attributes = [];
    productWithUnselectedAttributes.variationAttributeMap = {
      variations: [
        {
          variationId: 1100,
          isSalable: true,
          attributes: [{ attributeId: 1, attributeValueId: 1 }],
        },
        {
          variationId: 1101,
          isSalable: true,
          attributes: [{ attributeId: 1, attributeValueId: 2 }],
        },
      ],
      attributes: [
        {
          attributeId: 1,
          position: 1,
          name: 'Size',
          type: 'dropdown',
          values: [
            { attributeValueId: 1, position: 1, name: 'Small', imageUrl: '' },
            { attributeValueId: 2, position: 2, name: 'Large', imageUrl: '' },
          ],
        },
      ],
    };

    const wrapper = mount(UiPurchaseCard, {
      props: {
        product: productWithUnselectedAttributes,
        reviewAverage: {} as ReviewCounts,
      },
      global: {
        stubs: {
          PayPalExpressButton: true,
          PayPalPayLaterBanner: true,
          UnitContentSelect: true,
        },
      },
    });

    expect(wrapper.find('[data-testid="badges"]').exists()).toBe(false);
  });

  it('should hide the main availability until the automatically selected variation is loaded', async () => {
    const initialProduct = JSON.parse(JSON.stringify(ProductMock));
    initialProduct.variation.availabilityId = 8;
    initialProduct.variation.availability.names.name = 'Leider Ausverkauft';
    initialProduct.attributes = [];
    initialProduct.variationAttributeMap = {
      variations: [
        {
          variationId: 1101,
          isSalable: true,
          attributes: [{ attributeId: 1, attributeValueId: 1 }],
        },
      ],
      attributes: [
        {
          attributeId: 1,
          position: 1,
          name: 'Size',
          type: 'dropdown',
          values: [{ attributeValueId: 1, position: 1, name: 'Small', imageUrl: '' }],
        },
      ],
    };
    useProductAttributes().setAttribute(initialProduct, false);

    const wrapper = mount(UiPurchaseCard, {
      props: {
        product: initialProduct,
        reviewAverage: {} as ReviewCounts,
      },
      global: {
        stubs: {
          ProductAttributes: true,
          PayPalExpressButton: true,
          PayPalPayLaterBanner: true,
          UnitContentSelect: true,
        },
      },
    });

    expect(wrapper.find('[data-testid="badges"]').exists()).toBe(false);

    const selectedProduct = JSON.parse(JSON.stringify(initialProduct));
    selectedProduct.variation.id = 1101;
    selectedProduct.variation.availabilityId = 3;
    selectedProduct.variation.availability.names.name = 'Versandbereit in 3-7 Werktagen';
    await wrapper.setProps({ product: selectedProduct });

    expect(wrapper.find('[data-testid="badges"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Versandbereit in 3-7 Werktagen');
  });

  it('should show the main variation availability when no salable variation exists', async () => {
    const productWithoutSalableVariations = JSON.parse(JSON.stringify(ProductMock));
    productWithoutSalableVariations.variation.availabilityId = 8;
    productWithoutSalableVariations.variation.availability.names.name = 'Leider Ausverkauft';
    productWithoutSalableVariations.attributes = [];
    productWithoutSalableVariations.variationAttributeMap = {
      variations: [
        {
          variationId: 1100,
          isSalable: false,
          attributes: [{ attributeId: 1, attributeValueId: 1 }],
        },
      ],
      attributes: [
        {
          attributeId: 1,
          position: 1,
          name: 'Size',
          type: 'dropdown',
          values: [{ attributeValueId: 1, position: 1, name: 'Small', imageUrl: '' }],
        },
      ],
    };

    const wrapper = mount(UiPurchaseCard, {
      props: {
        product: productWithoutSalableVariations,
        reviewAverage: {} as ReviewCounts,
      },
      global: {
        stubs: {
          PayPalExpressButton: true,
          PayPalPayLaterBanner: true,
          UnitContentSelect: true,
        },
      },
    });
    await nextTick();

    expect(wrapper.find('[data-testid="badges"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Leider Ausverkauft');
  });
});
