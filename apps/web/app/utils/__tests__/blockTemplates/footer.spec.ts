import { createFooter } from '~/utils/blockTemplates/footer/factory';

describe('createFooter', () => {
  it('should create a single Footer block', () => {
    const footer = createFooter();
    expect(footer).toBeDefined();
    expect(footer.name).toBe('Footer');
  });

  it('should have correct block structure', () => {
    const footer = createFooter();
    expect(footer).toHaveProperty('name');
    expect(footer).toHaveProperty('type');
    expect(footer).toHaveProperty('meta');
    expect(footer.meta).toHaveProperty('uuid');
    expect(footer).toHaveProperty('content');
  });

  it('should be a content type block', () => {
    const footer = createFooter();
    expect(footer.type).toBe('content');
  });

  it('should be marked as global template', () => {
    const footer = createFooter();
    expect(footer.meta.isGlobalTemplate).toBe(true);
  });

  it('should have all four column configurations', () => {
    const footer = createFooter();
    const content = footer.content as {
      column1?: unknown;
      column2?: unknown;
      column3?: unknown;
      column4?: unknown;
    };
    expect(content.column1).toBeDefined();
    expect(content.column2).toBeDefined();
    expect(content.column3).toBeDefined();
    expect(content.column4).toBeDefined();
  });

  it('should use translations for column titles', () => {
    const footer = createFooter();
    const content = footer.content as {
      column1?: { title?: string };
      column2?: { title?: string };
    };
    expect(content.column1?.title).toBeDefined();
    expect(typeof content.column1?.title).toBe('string');
    expect(content.column2?.title).toBeDefined();
    expect(typeof content.column2?.title).toBe('string');
  });

  it('should have footnote configuration', () => {
    const footer = createFooter();
    const content = footer.content as {
      footnote?: string;
      footnoteAlign?: string;
    };
    expect(content).toHaveProperty('footnote');
    expect(content).toHaveProperty('footnoteAlign');
    expect(content.footnoteAlign).toBe('right');
  });

  it('should have color configuration', () => {
    const footer = createFooter();
    const content = footer.content as {
      colors?: {
        background?: string;
        text?: string;
        footnoteBackground?: string;
        footnoteText?: string;
      };
    };
    expect(content.colors).toBeDefined();
    expect(content.colors?.background).toBeDefined();
    expect(content.colors?.text).toBeDefined();
    expect(content.colors?.footnoteBackground).toBeDefined();
    expect(content.colors?.footnoteText).toBeDefined();
  });

  it('should have configurable footer layout', () => {
    const footer = createFooter();
    const content = footer.content as {
      layout?: {
        backgroundImage?: string;
        contentBackground?: string;
        contentOpacity?: number;
      };
    };

    expect(content.layout?.backgroundImage).toBeDefined();
    expect(content.layout?.contentBackground).toBeDefined();
    expect(content.layout?.contentOpacity).toBeDefined();
  });

  it('should have dynamic column configuration', () => {
    const footer = createFooter();
    const content = footer.content as {
      columns?: Array<{ title?: string; description?: string; width?: string }>;
    };

    expect(content.columns).toHaveLength(4);
    expect(content.columns?.[0]?.description).toBeDefined();
    expect(content.columns?.[0]?.width).toBeDefined();
  });
});
