import { mount } from '@vue/test-utils';
import { UiPurchaseCard } from '#components';
import type { ReviewCounts } from '@plentymarkets/shop-api';
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
});
