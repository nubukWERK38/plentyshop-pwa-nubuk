export interface NumericIdPreviewItem {
  id: number;
  label: string;
  description?: string;
}

export interface NumericIdTagSelectProps {
  modelValue: number[];
  label: string;
  placeholder: string;
  tagPlaceholder: string;
  deselectLabel: string;
  helpText?: string;
  invalidTitle: string;
  invalidHelpText: string;
  previewTitle?: string;
  previewEmptyText?: string;
  previewUnavailableText?: string;
  previewItems?: NumericIdPreviewItem[];
  dataTestId?: string;
}