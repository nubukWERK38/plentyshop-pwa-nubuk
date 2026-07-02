import type { Product } from '@plentymarkets/shop-api';
import type { ProductDownloadEntry, ProductDownloadsContent } from '~/components/blocks/ProductDownloads/types';

export type ProductDownload = {
  title: string;
  url: string;
  fileType: string;
  fileSize?: string;
  source: 'product' | 'property' | 'manual';
};

type UnknownRecord = Record<string, unknown>;

const URL_KEYS = ['url', 'href', 'fileUrl', 'downloadUrl', 'downloadLink', 'publicUrl', 'previewUrl', 'path'];
const TITLE_KEYS = ['title', 'name', 'fileName', 'filename', 'cleanImageName', 'label', 'description'];
const SIZE_KEYS = ['size', 'fileSize', 'filesize', 'sizeBytes', 'bytes'];
const TYPE_KEYS = ['fileType', 'mimeType', 'mime', 'contentType', 'type', 'cast'];
const DOWNLOAD_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg', 'bmp', 'tif', 'tiff'];
const DOWNLOAD_PROPERTY_GROUP_NAMES = ['artikel downloads'];
const DOWNLOAD_PROPERTY_GROUP_IDS = [4];

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getStringValue = (record: UnknownRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return '';
};

const getNumberValue = (record: UnknownRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }

  return undefined;
};

export const getFileExtension = (value: string) => {
  const cleanValue = value.split('?')[0]?.split('#')[0] ?? '';
  const extension = cleanValue.split('.').pop()?.toLowerCase() ?? '';

  return extension.length <= 5 ? extension : '';
};

export const getDownloadFileType = (url: string, fallback = '') => {
  const lowerFallback = fallback.toLowerCase();
  const extension = getFileExtension(url) || getFileExtension(lowerFallback);

  if (lowerFallback.includes('pdf') || extension === 'pdf') return 'pdf';
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg', 'bmp', 'tif', 'tiff'];

  if (lowerFallback.includes('image') || imageExtensions.includes(extension)) {
    return 'image';
  }

  return extension || 'file';
};

const isDownloadUrl = (url: string, fallback = '') => {
  const extension = getFileExtension(url) || getFileExtension(fallback);
  const lowerFallback = fallback.toLowerCase();

  return DOWNLOAD_EXTENSIONS.includes(extension) || lowerFallback.includes('pdf') || lowerFallback.includes('image');
};

export const formatFileSize = (value?: string | number) => {
  if (typeof value === 'string' && value.trim() && !Number.isFinite(Number(value))) return value.trim();

  const bytes = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return '';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const displaySize = Number.isInteger(size) || size >= 10 || unitIndex === 0 ? Math.round(size) : size.toFixed(1);

  return `${displaySize} ${units[unitIndex]}`;
};

const getFileNameFromUrl = (url: string) => {
  const cleanUrl = url.split('?')[0]?.split('#')[0] ?? '';
  const fileName = decodeURIComponent(cleanUrl.split('/').pop() ?? '').trim();

  return fileName || 'Download';
};

const normalizeUrl = (url: string) => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '';
  if (/^(https?:)?\/\//i.test(trimmedUrl) || trimmedUrl.startsWith('/')) return trimmedUrl;
  if (isDownloadUrl(trimmedUrl)) return `/documents/${trimmedUrl.replace(/^\/+/, '')}`;

  return `/${trimmedUrl.replace(/^\/+/, '')}`;
};

const normalizeManualDownload = (entry: ProductDownloadEntry): ProductDownload | null => {
  const url = normalizeUrl(entry.url);
  if (!url) return null;

  return {
    title: entry.title?.trim() || getFileNameFromUrl(url),
    url,
    fileType: getDownloadFileType(url, entry.fileType),
    fileSize: formatFileSize(entry.fileSize),
    source: 'manual',
  };
};

const normalizeName = (value: unknown) =>
  typeof value === 'string'
    ? value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
    : '';

const getNameFromNames = (value: unknown) => {
  if (Array.isArray(value)) {
    const firstName = value
      .map((entry) => (isRecord(entry) ? getStringValue(entry, ['name']) : ''))
      .find(Boolean);

    return firstName ?? '';
  }

  return isRecord(value) ? getStringValue(value, ['name']) : '';
};

const getNamedValue = (record: UnknownRecord, directKeys: string[]) =>
  getStringValue(record, directKeys) || getNameFromNames(record.names);

const getPropertyName = (property: UnknownRecord) => getNamedValue(property, TITLE_KEYS).trim();

const normalizePropertyKey = (value: string) =>
  normalizeName(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getDocumentTitleKey = (propertyName: string) => {
  const normalizedName = normalizePropertyKey(propertyName);
  const titleMatch = normalizedName.match(/^(dokument\s+\d+)\s+name$/);

  return titleMatch?.[1] ?? '';
};

const getDocumentFileKey = (propertyName: string) => {
  const normalizedName = normalizePropertyKey(propertyName);
  const fileMatch = normalizedName.match(/^dokument\s+\d+$/);

  return fileMatch?.[0] ?? '';
};

const isDownloadsGroup = (group: unknown) => {
  if (!isRecord(group)) return false;

  const id = getNumberValue(group, ['id', 'groupId']);
  if (id && DOWNLOAD_PROPERTY_GROUP_IDS.includes(id)) return true;

  const name = normalizeName(getNamedValue(group, ['name']));
  return DOWNLOAD_PROPERTY_GROUP_NAMES.includes(name);
};

const isPropertyInDownloadsGroup = (property: UnknownRecord, parentGroup?: unknown) => {
  if (isDownloadsGroup(parentGroup)) return true;

  const groups = property.groups;
  if (Array.isArray(groups) && groups.some(isDownloadsGroup)) return true;

  const group = property.group;
  return isDownloadsGroup(group);
};

const getPropertyRawValue = (property: UnknownRecord) => {
  const directValue = getStringValue(property, ['value', ...URL_KEYS]);
  if (directValue) return directValue;

  const values = property.values;
  if (!isRecord(values)) return '';

  const downloadLink = getStringValue(values, ['downloadLink']);
  if (downloadLink) return downloadLink;

  const value = values.value;
  if (typeof value === 'string') return value.trim();
  if (isRecord(value)) return getStringValue(value, URL_KEYS);

  return '';
};

const getPropertyTitle = (property: UnknownRecord, url: string) => {
  const title = getPropertyName(property);
  if (!title) return getFileNameFromUrl(url);

  return title.replace(/_/g, ' ');
};

const normalizePropertyDownload = (
  property: unknown,
  parentGroup?: unknown,
  titleOverrides = new Map<string, string>(),
): ProductDownload | null => {
  if (!isRecord(property) || !isPropertyInDownloadsGroup(property, parentGroup)) return null;

  const rawUrl = getPropertyRawValue(property);
  if (!rawUrl || !isDownloadUrl(rawUrl)) return null;

  const url = normalizeUrl(rawUrl);
  const type = getStringValue(property, TYPE_KEYS);
  const overrideTitle = titleOverrides.get(getDocumentFileKey(getPropertyName(property)));

  return {
    title: overrideTitle || getPropertyTitle(property, url),
    url,
    fileType: getDownloadFileType(url, type),
    fileSize: formatFileSize(getNumberValue(property, SIZE_KEYS) ?? getStringValue(property, SIZE_KEYS)),
    source: 'property',
  };
};

const normalizeProductDownload = (value: unknown): ProductDownload | null => {
  if (!isRecord(value)) return null;

  const rawUrl = getStringValue(value, URL_KEYS);
  const type = getStringValue(value, TYPE_KEYS);
  if (!rawUrl || !isDownloadUrl(rawUrl, type)) return null;

  const url = normalizeUrl(rawUrl);
  const title = getStringValue(value, TITLE_KEYS) || getFileNameFromUrl(url);
  const fileSize = formatFileSize(getNumberValue(value, SIZE_KEYS) ?? getStringValue(value, SIZE_KEYS));

  return {
    title,
    url,
    fileType: getDownloadFileType(url, type),
    fileSize,
    source: 'product',
  };
};

const getProductDownloadCandidates = (product: Product) => {
  const rawProduct = product as unknown as UnknownRecord;
  const item = isRecord(rawProduct.item) ? rawProduct.item : {};
  const variation = isRecord(rawProduct.variation) ? rawProduct.variation : {};

  return [
    rawProduct.documents,
    rawProduct.media,
    rawProduct.files,
    item.documents,
    item.media,
    item.files,
    variation.documents,
    variation.media,
    variation.files,
  ].filter(Array.isArray) as unknown[][];
};

const getVariationPropertyGroups = (product: Product) => {
  const rawProduct = product as unknown as UnknownRecord;
  const mainVariation = isRecord(rawProduct.mainVariation) ? rawProduct.mainVariation : {};

  return [
    rawProduct.variationProperties,
    rawProduct.itemVariationProperties,
    rawProduct.mainVariationProperties,
    mainVariation.variationProperties,
  ].filter(Array.isArray) as unknown[][];
};

const getProductPropertyDownloads = (product: Product) => {
  const propertyGroups = getVariationPropertyGroups(product).flat();

  return propertyGroups.flatMap((group) => {
    if (!isRecord(group)) return [];

    const properties = Array.isArray(group.properties) ? group.properties : [];
    const titleOverrides = properties.reduce((titles, property) => {
      if (!isRecord(property) || !isPropertyInDownloadsGroup(property, group)) return titles;

      const titleKey = getDocumentTitleKey(getPropertyName(property));
      const titleValue = getPropertyRawValue(property);
      if (titleKey && titleValue) titles.set(titleKey, titleValue);

      return titles;
    }, new Map<string, string>());

    return properties
      .map((property) => normalizePropertyDownload(property, group, titleOverrides))
      .filter((item): item is ProductDownload => Boolean(item));
  });
};

export const getProductDownloads = (product: Product, content?: Partial<ProductDownloadsContent>) => {
  const configuredDownloads = (content?.downloads?.items ?? [])
    .map(normalizeManualDownload)
    .filter((item): item is ProductDownload => Boolean(item));

  const productDownloads = getProductDownloadCandidates(product)
    .flat()
    .map(normalizeProductDownload)
    .filter((item): item is ProductDownload => Boolean(item));

  const propertyDownloads = getProductPropertyDownloads(product);
  const seen = new Set<string>();

  return [...propertyDownloads, ...productDownloads, ...configuredDownloads].filter((download) => {
    const key = download.url.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const hasProductDownloads = (product: Product, content?: Partial<ProductDownloadsContent>) =>
  getProductDownloads(product, content).length > 0;
