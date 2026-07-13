import { flushPromises, mount } from '@vue/test-utils';
import FieldsOrder from '../FieldsOrder.vue';

describe('FieldsOrder', () => {
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
        texts: { name: 'E-Bikes' },
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
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.findAll('[data-testid="category-subcategory-item"]')).toHaveLength(2);
  });
});
