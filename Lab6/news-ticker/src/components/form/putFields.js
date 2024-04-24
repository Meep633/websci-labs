const fields = [
  {
    id: "put-uuid",
    name: "uuid",
    label: "uuid",
    type: "text",
    readOnly: true,
    defaultValue: "",
    fieldType: "uuid"
  },
  {
    id: "put-title",
    name: "title",
    label: "Title",
    type: "text",
    readOnly: false,
    defaultValue: "",
    fieldType: "title"
  },
  {
    id: "put-description",
    name: "description",
    label: "Description",
    type: "text",
    readOnly: false,
    defaultValue: "",
    fieldType: "description"
  },
  {
    id: "put-keywords",
    name: "keywords",
    label: "Keywords",
    type: "text",
    readOnly: false,
    defaultValue: "",
    fieldType: "keywords"
  },
  {
    id: "put-snippet",
    name: "snippet",
    label: "Snippet",
    type: "text",
    readOnly: false,
    defaultValue: "",
    fieldType: "snippet"
  },
  {
    id: "put-url",
    name: "url",
    label: "URL",
    type: "text",
    readOnly: false,
    defaultValue: "",
    fieldType: "url"
  },
  {
    id: "put-image_url",
    name: "image_url",
    label: "Image URL",
    type: "text",
    readOnly: false,
    defaultValue: "",
    fieldType: "image_url"
  },
  {
    id: "put-language",
    name: "language",
    label: "Language",
    type: "text",
    readOnly: false,
    defaultValue: "",
    fieldType: "language"
  },
  {
    id: "put-published_at",
    name: "published_at",
    label: "Published At",
    type: "date",
    readOnly: false,
    defaultValue: "",
    fieldType: "published_at"
  },
  {
    id: "put-source",
    name: "source",
    label: "Source",
    type: "text",
    readOnly: false,
    defaultValue: "",
    fieldType: "source"
  },
  {
    id: "put-locale",
    name: "locale",
    label: "Locale",
    type: "text",
    readOnly: false,
    defaultValue: "same",
    fieldType: "locale"
  },
  {
    id: "put-categories",
    name: "categories",
    label: "Categories",
    type: "text",
    readOnly: false,
    defaultValue: "same",
    fieldType: "categories"
  },
  {
    id: "put-old_locale",
    name: "old_locale",
    label: "Old Locale",
    type: "text",
    readOnly: false,
    defaultValue: "",
    fieldType: "locale"
  },
  {
    id: "put-old_categories",
    name: "old_categories",
    label: "Old Categories",
    type: "text",
    readOnly: false,
    defaultValue: "",
    fieldType: "categories"
  }
];

export default fields;