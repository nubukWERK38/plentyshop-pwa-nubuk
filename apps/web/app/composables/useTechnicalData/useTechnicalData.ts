import { productGetters } from '@plentymarkets/shop-api';

type TechnicalProduct = {
  variationProperties?: TechnicalPropertyGroup[];
};

type TechnicalPropertyGroup = {
  id?: number | string | null;
  name?: string | null;
  names?: {
    name?: string | null;
  } | null;
  properties?: TechnicalProperty[];
};

type TechnicalProperty = {
  id?: number | string | null;
  groupId?: number | string | null;
  position?: number | null;
  names?: {
    name?: string | null;
    propertyId?: number | string | null;
  } | null;
  values?: {
    value?: unknown;
  } | null;
  groups?: TechnicalPropertyGroup[];
};

type TechnicalInfoProperty = {
  id: string;
  name: string;
  value: string;
  position: number;
};

type TechnicalInfoGroup = {
  id: number;
  name: string;
  properties: TechnicalInfoProperty[];
};

const TECHNICAL_GROUP_IDS = [5, 15, 16, 17, 18, 19, 20, 21, 22];
const TECHNICAL_GROUP_ID_SET = new Set(TECHNICAL_GROUP_IDS);
const TECHNICAL_GROUP_PROPERTY_FILTERS: Record<number, Set<number>> = {
  5: new Set([11, 13]),
};
const TECHNICAL_GROUP_NAMES: Record<number, string> = {
  5: 'Rahmenset',
  15: 'Fahrwerk',
  16: 'Bremsen',
  17: 'Antrieb',
  18: 'Laufr\u00e4der',
  19: 'Gewicht',
  20: 'Rahmengr\u00f6\u00dfe',
  21: 'E-Bike',
  22: 'Accessoires',
};

const getNumericId = (value: number | string | null | undefined) => {
  const numericId = Number(value);

  return Number.isInteger(numericId) ? numericId : null;
};

const normalizeGroupName = (name: string | null | undefined) => (name ?? '').replace(/^Beschreibung\s+/i, '').trim();

const getGroupName = (groupId: number, group?: TechnicalPropertyGroup) =>
  normalizeGroupName(group?.names?.name ?? group?.name) || TECHNICAL_GROUP_NAMES[groupId] || '';

const getPropertyValue = (property: TechnicalProperty) => {
  const value = property.values?.value;
  if (value === null || value === undefined) return '';

  return String(value).trim();
};

const getPropertyName = (property: TechnicalProperty) => property.names?.name?.trim() ?? '';

const getPropertyId = (property: TechnicalProperty) =>
  String(property.id ?? property.names?.propertyId ?? property.names?.name ?? property.values?.value ?? '');

const getNumericPropertyId = (property: TechnicalProperty) => getNumericId(property.id ?? property.names?.propertyId);

const isAllowedPropertyInGroup = (groupId: number, property: TechnicalProperty) => {
  const propertyFilter = TECHNICAL_GROUP_PROPERTY_FILTERS[groupId];
  if (!propertyFilter) return true;

  const propertyId = getNumericPropertyId(property);
  return propertyId !== null && propertyFilter.has(propertyId);
};

const getPropertyGroup = (property: TechnicalProperty) =>
  property.groups?.find((group) => {
    const groupId = getNumericId(group.id);

    return groupId !== null && TECHNICAL_GROUP_ID_SET.has(groupId);
  });

const addPropertyToGroup = (
  groups: Map<number, TechnicalInfoGroup>,
  groupId: number,
  property: TechnicalProperty,
  group?: TechnicalPropertyGroup,
) => {
  const value = getPropertyValue(property);
  const name = getPropertyName(property);

  if (!value || !name || !isAllowedPropertyInGroup(groupId, property)) return;

  if (!groups.has(groupId)) {
    groups.set(groupId, {
      id: groupId,
      name: getGroupName(groupId, group),
      properties: [],
    });
  }

  groups.get(groupId)?.properties.push({
    id: `${groupId}-${getPropertyId(property)}`,
    name,
    value,
    position: property.position ?? 0,
  });
};

const getTechnicalPropertyGroups = (product: TechnicalProduct | null | undefined): TechnicalInfoGroup[] => {
  const groups = new Map<number, TechnicalInfoGroup>();
  const variationProperties = product?.variationProperties ?? [];

  variationProperties.forEach((group) => {
    const groupId = getNumericId(group.id);
    const isTechnicalGroup = groupId !== null && TECHNICAL_GROUP_ID_SET.has(groupId);

    (group.properties ?? []).forEach((property) => {
      if (isTechnicalGroup && groupId !== null) {
        addPropertyToGroup(groups, groupId, property, group);
        return;
      }

      const propertyGroupId = getNumericId(property.groupId);
      if (propertyGroupId !== null && TECHNICAL_GROUP_ID_SET.has(propertyGroupId)) {
        const propertyGroup = property.groups?.find((nestedGroup) => getNumericId(nestedGroup.id) === propertyGroupId);
        addPropertyToGroup(groups, propertyGroupId, property, propertyGroup ?? group);
        return;
      }

      const propertyGroup = getPropertyGroup(property);
      const nestedGroupId = getNumericId(propertyGroup?.id);
      if (nestedGroupId !== null && TECHNICAL_GROUP_ID_SET.has(nestedGroupId)) {
        addPropertyToGroup(groups, nestedGroupId, property, propertyGroup);
      }
    });
  });

  return TECHNICAL_GROUP_IDS.map((groupId) => groups.get(groupId))
    .filter((group): group is TechnicalInfoGroup => Boolean(group?.properties.length))
    .map((group) => ({
      ...group,
      properties: [...group.properties].sort((a, b) => a.position - b.position),
    }));
};

const hasHtmlContent = (value: string | null | undefined) =>
  Boolean(
    value
      ?.replace(/<br\s*\/?>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim().length,
  );

export const useTechnicalData = () => {
  const { currentProduct } = useProducts();
  const text = computed(() => productGetters.getTechnicalData(currentProduct.value));
  const technicalPropertyGroups = computed(() => getTechnicalPropertyGroups(currentProduct.value as TechnicalProduct));
  const hasContent = computed(() => technicalPropertyGroups.value.length > 0 || hasHtmlContent(text.value));

  return {
    text,
    technicalPropertyGroups,
    hasContent,
  };
};
