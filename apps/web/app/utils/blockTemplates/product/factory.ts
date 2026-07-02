import type { Block } from '@plentymarkets/shop-api';
import { v4 as uuid } from 'uuid';

export const createProduct = (): Block[] => {
  const itemTextTitle = t('defaultTemplate.product.itemText.title');
  const technicalDataTitle = t('defaultTemplate.product.technicalData.title');
  const downloadsTitle = 'Downloads';
  const customerReviewTitle = t('defaultTemplate.product.customerReview.title');
  const legalInfoTitle = t('defaultTemplate.product.productLegalInformation.title');
  const legalInfoLinkText = t('defaultTemplate.product.productLegalInformation.linkText');

  return [
    {
      name: 'MultiGrid',
      type: 'structure',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      configuration: {
        columnWidths: [6, 6],
        sticky: [1],
        layout: {
          marginTop: '0',
          marginBottom: '0',
        },
      },
      layout: {
        gap: 'XL',
        narrowContainer: true,
      },
      content: [
        {
          name: 'ImageGallery',
          type: 'content',
          meta: {
            uuid: uuid(),
            isGlobalTemplate: false,
          },
          parent_slot: 0,
          content: {
            thumbnails: {
              showThumbnails: true,
              thumbnailType: 'left-vertical',
              enableHoverZoom: true,
            },
          },
        },
        {
          name: 'PriceCard',
          type: 'content',
          meta: {
            uuid: uuid(),
            isGlobalTemplate: false,
          },
          parent_slot: 1,
          content: {
            fields: {
              itemName: true,
              price: true,
              tags: true,
              availability: true,
              starRating: true,
              orderProperties: true,
              variationProperties: true,
              previewText: true,
              attributes: true,
              itemBundle: false,
              graduatedPrices: false,
              addToWishlist: true,
              quantityAndAddToCart: true,
              itemText: false,
              technicalData: false,
            },
            fieldsOrder: [
              'itemName',
              'price',
              'tags',
              'availability',
              'starRating',
              'variationProperties',
              'orderProperties',
              'previewText',
              'attributes',
              'itemBundle',
              'graduatedPrices',
              'addToWishlist',
              'quantityAndAddToCart',
              'itemText',
              'technicalData',
            ],
            fieldsDisabled: ['quantityAndAddToCart', 'price', 'itemBundle', 'attributes'],
            wishlistSize: 'small',
            dropShadow: true,
            borders: true,
            borderColor: '#EFF4F1',
            layout: {
              paddingTop: 0,
              paddingBottom: 0,
              paddingRight: 0,
              paddingLeft: 0,
            },
          },
        },
      ],
    },
    {
      name: 'Tabs',
      type: 'content',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      content: {
        items: [
          {
            title: itemTextTitle,
            html: '',
            blocks: [
              {
                name: 'ItemText',
                type: 'content',
                meta: {
                  uuid: uuid(),
                  isGlobalTemplate: false,
                },
                content: {
                  text: {
                    title: '',
                  },
                  layout: {
                    displayAsCollapsable: false,
                    initiallyCollapsed: false,
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                },
              },
            ],
          },
          {
            title: technicalDataTitle,
            html: '',
            blocks: [
              {
                name: 'TechnicalData',
                type: 'content',
                meta: {
                  uuid: uuid(),
                  isGlobalTemplate: false,
                },
                content: {
                  text: {
                    title: '',
                  },
                  layout: {
                    displayAsCollapsable: false,
                    initiallyCollapsed: false,
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                },
              },
            ],
          },
          {
            title: downloadsTitle,
            html: '',
            blocks: [
              {
                name: 'ProductDownloads',
                type: 'content',
                meta: {
                  uuid: uuid(),
                  isGlobalTemplate: false,
                },
                content: {
                  text: {
                    title: '',
                  },
                  downloads: {
                    items: [],
                  },
                  layout: {
                    displayAsCollapsable: false,
                    initiallyCollapsed: false,
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                },
              },
            ],
          },
          {
            title: 'Noch Fragen?',
            html: '',
            blocks: [
              {
                name: 'ProductQuestion',
                type: 'content',
                meta: {
                  uuid: uuid(),
                  isGlobalTemplate: false,
                },
                content: {
                  text: {
                    title: '',
                    intro:
                      'Wenn Du noch weitere Fragen zu diesem Artikel hast, kannst Du uns gerne über das folgende Formular benachrichtigen.',
                    successText: 'Vielen Dank für Deine Anfrage. Wir melden uns schnellst möglich bei Dir. ',
                  },
                  layout: {
                    displayAsCollapsable: false,
                    initiallyCollapsed: false,
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                },
              },
            ],
          },
        ],
        layout: {
          fullWidth: false,
          additionalClasses: '',
          htmlId: 'product-detail-tabs',
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
    },
    {
      name: 'CustomerReview',
      type: 'content',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      content: {
        text: {
          title: customerReviewTitle,
        },
        layout: {
          collapsible: true,
          initiallyCollapsed: false,
        },
      },
    },
    {
      name: 'ProductLegalInformation',
      type: 'content',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      content: {
        text: {
          title: legalInfoTitle,
          linkText: legalInfoLinkText,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 15,
          paddingRight: 0,
        },
      },
    },
    {
      name: 'ProductRecommendedProducts',
      type: 'content',
      meta: {
        uuid: uuid(),
        isGlobalTemplate: false,
      },
      content: {
        source: {
          type: 'category',
          itemId: '',
          categoryId: '',
          variationIds: '',
          crossSellingRelation: 'Similar',
        },
        layout: {
          fullWidth: false,
          gap: 16,
          marginLeft: 0,
          marginRight: 0,
          backgroundColor: 'transparent',
          gradient: {
            enabled: false,
            type: 'linear',
            startColor: '#ffffff',
            endColor: '#e2e8f0',
            angle: 180,
          },
        },
      },
    },
  ] as Block[];
};
