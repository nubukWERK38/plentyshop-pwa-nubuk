export const columnLayoutBlockUuid = 'b792164e-9657-4ccc-99d6-7ae11c5b666f';

export const mockColumnLayoutProps = {
  name: 'ColumnLayout',
  type: 'structure',
  content: [
    {
      name: 'TextCard',
      type: 'content',
      content: { text: { title: 'Left' } },
      meta: { uuid: '7c78e801-fb6e-41a1-bfd6-030ea6ec4744' },
      parent_slot: 0,
    },
    {
      name: 'TextCard',
      type: 'content',
      content: { text: { title: 'Right' } },
      meta: { uuid: 'e9f6e7f3-f58a-4c45-ad13-b1d34e8d8f66' },
      parent_slot: 1,
    },
  ],
  configuration: {
    columns: 2,
    columnWidths: [6, 6],
    layout: {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
      backgroundColor: '#ffffff',
      gap: 'M',
    },
  },
  meta: {
    uuid: columnLayoutBlockUuid,
  },
};
