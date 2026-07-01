import type { Product } from '@plentymarkets/shop-api';
import { getProductDownloads, hasProductDownloads } from '~/utils/productDownloads';

describe('productDownloads', () => {
  it('returns configured downloads with type and size labels', () => {
    const downloads = getProductDownloads({} as Product, {
      downloads: {
        items: [
          {
            title: 'Manual',
            url: 'https://example.test/manual.pdf',
            fileType: 'pdf',
            fileSize: '2048',
          },
        ],
      },
    });

    expect(downloads).toEqual([
      {
        title: 'Manual',
        url: 'https://example.test/manual.pdf',
        fileType: 'pdf',
        fileSize: '2 KB',
        source: 'manual',
      },
    ]);
  });

  it('extracts file-like product media and ignores product search documents', () => {
    const product = {
      item: {
        documents: [{ data: { texts: { name1: 'Search document' } } }, { name: 'Datasheet', url: '/manual.pdf', size: 1048576 }],
      },
    } as unknown as Product;

    const downloads = getProductDownloads(product);

    expect(downloads).toHaveLength(1);
    expect(downloads[0]).toMatchObject({
      title: 'Datasheet',
      url: '/manual.pdf',
      fileType: 'pdf',
      fileSize: '1 MB',
      source: 'product',
    });
  });

  it('reports no downloads for empty content', () => {
    expect(hasProductDownloads({} as Product, { downloads: { items: [] } })).toBe(false);
  });

  it('maps bare configured file names to the documents path', () => {
    const downloads = getProductDownloads({} as Product, {
      downloads: {
        items: [{ title: '', url: 'manual.pdf' }],
      },
    });

    expect(downloads[0]).toMatchObject({
      title: 'manual.pdf',
      url: '/documents/manual.pdf',
      fileType: 'pdf',
    });
  });

  it('extracts downloads from variation properties in the Artikel Downloads group', () => {
    const product = {
      variationProperties: [
        {
          names: { name: 'Artikel Downloads' },
          properties: [
            {
              names: { name: 'Dokument_1' },
              values: {
                value:
                  'https://s3-eu-west-1.amazonaws.com/plentymarkets-public-94/0bcmhf2jjh7k/propertyItems/1598188/91725-53-CHISEL-HT-GLOSS-DOVE-GREY---ASHEN-RDSQ-21413496-21413496.pdf',
              },
            },
            {
              names: { name: 'Leer' },
              values: { value: '' },
            },
          ],
        },
      ],
    } as unknown as Product;

    const downloads = getProductDownloads(product);

    expect(downloads).toEqual([
      {
        title: 'Dokument 1',
        url: 'https://s3-eu-west-1.amazonaws.com/plentymarkets-public-94/0bcmhf2jjh7k/propertyItems/1598188/91725-53-CHISEL-HT-GLOSS-DOVE-GREY---ASHEN-RDSQ-21413496-21413496.pdf',
        fileType: 'pdf',
        fileSize: '',
        source: 'property',
      },
    ]);
  });

  it('extracts downloads when the property carries the group relation itself', () => {
    const product = {
      variationProperties: [
        {
          properties: [
            {
              names: { name: 'Bild' },
              groups: [{ names: { name: 'Artikel Downloads' } }],
              values: { value: 'detailbild.png' },
            },
          ],
        },
      ],
    } as unknown as Product;

    expect(getProductDownloads(product)[0]).toMatchObject({
      title: 'Bild',
      url: '/documents/detailbild.png',
      fileType: 'image',
      source: 'property',
    });
  });

  it('extracts downloads from main variation properties for child variations', () => {
    const product = {
      variationProperties: [],
      mainVariationProperties: [
        {
          name: 'Artikel Downloads',
          properties: [
            {
              names: { name: 'Geometrie' },
              values: { downloadLink: 'https://example.test/geometrie.pdf', value: '' },
            },
          ],
        },
      ],
    } as unknown as Product;

    expect(getProductDownloads(product)).toEqual([
      {
        title: 'Geometrie',
        url: 'https://example.test/geometrie.pdf',
        fileType: 'pdf',
        fileSize: '',
        source: 'property',
      },
    ]);
  });

  it('extracts downloads from item-level variation properties fetched by item id', () => {
    const product = {
      variationProperties: [],
      itemVariationProperties: [
        {
          name: 'Artikel Downloads',
          properties: [
            {
              names: { name: 'Dokument_1' },
              values: { value: 'https://example.test/manual.pdf' },
            },
          ],
        },
      ],
    } as unknown as Product;

    expect(getProductDownloads(product)[0]).toMatchObject({
      title: 'Dokument 1',
      url: 'https://example.test/manual.pdf',
      fileType: 'pdf',
      source: 'property',
    });
  });
});
