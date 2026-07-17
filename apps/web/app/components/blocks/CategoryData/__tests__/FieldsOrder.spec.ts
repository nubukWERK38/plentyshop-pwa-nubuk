import { flushPromises, mount } from '@vue/test-utils';
import FieldsOrder from '../FieldsOrder.vue';

describe('FieldsOrder', () => {
  const nuxtLinkStub = {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  };

  it('handles the subcategory list template ref rendered inside the fields loop', async () => {
    const wrapper = mount(FieldsOrder, {
      props: {
        fields: {
          name: true,
          description1: false,
          description2: false,
          shortDescription: false,
        },
        fieldsOrder: ['name', 'description1', 'description2', 'shortDescription'],
        texts: {
          name: 'E-Bikes',
          description1: '',
          description2: '',
          shortDescription: '',
        },
        showSubcategories: true,
        subcategories: [
          { name: 'E-Mountainbikes', link: '/e-mountainbikes' },
          { name: 'E-Citybikes', link: '/e-citybikes' },
        ],
        showBrands: false,
        brands: [],
        maxSubcategoryRows: 2,
      },
      global: {
        stubs: {
          NuxtLink: nuxtLinkStub,
        },
      },
    });

    await flushPromises();

    expect(wrapper.findAll('[data-testid="category-subcategory-item"]')).toHaveLength(2);
  });

  it('limits the brand list to the configured number of rows', () => {
    const wrapper = mount(FieldsOrder, {
      props: {
        fields: {
          name: true,
          description1: false,
          description2: false,
          shortDescription: false,
        },
        fieldsOrder: ['name', 'description1', 'description2', 'shortDescription'],
        texts: {
          name: 'Bremsen',
          description1: '',
          description2: '',
          shortDescription: '',
        },
        showSubcategories: false,
        subcategories: [],
        showBrands: true,
        brands: [{ name: 'Shimano', link: '/bremsen?facets=shimano' }],
        maxBrandRows: 4,
      },
      global: {
        stubs: {
          NuxtLink: nuxtLinkStub,
        },
      },
    });

    expect(wrapper.get('[data-testid="category-brands"]').attributes('style')).toContain('max-height: calc(4 * 1.5rem');
    expect(wrapper.get('[data-testid="category-brands"]').attributes('style')).toContain('overflow: hidden');
  });
});
