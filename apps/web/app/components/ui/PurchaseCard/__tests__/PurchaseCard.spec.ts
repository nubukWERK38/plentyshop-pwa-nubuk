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
});
