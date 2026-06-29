import { v4 as uuid } from 'uuid';
import type { ContactFlagsContent, ContactFlagsProps } from './types';

export const createDefaultContactFlagsContent = (): ContactFlagsContent => ({
  top: 227,
  backgroundColor: '#212529',
  textColor: '#ffffff',
  iconColor: '#ccff00',
  flags: [
    {
      label: 'Kontakt',
      link: 'https://www.nubuk-bikes.de/kontakt',
      icon: 'fa-envelope',
      visible: true,
    },
    {
      label: 'Retoure',
      link: 'https://www.nubuk-bikes.de/ueber-uns/retoure',
      icon: 'fa-undo',
      visible: true,
    },
    {
      label: 'Versand',
      link: 'https://www.nubuk-bikes.de/ueber-uns/versand',
      icon: 'fa-truck',
      visible: true,
    },
  ],
});

export const createDefault = (): ContactFlagsProps => ({
  name: 'ContactFlags',
  type: 'content',
  meta: {
    uuid: uuid(),
    isGlobalTemplate: true,
  },
  configuration: {
    visible: true,
  },
  content: createDefaultContactFlagsContent(),
});

export const labelPath = 'content.flags.0.label';
