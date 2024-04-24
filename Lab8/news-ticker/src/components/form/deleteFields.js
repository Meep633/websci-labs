const fields = [
  {
    id: "del-uuid",
    name: "uuid",
    label: "uuid",
    type: "text",
    readOnly: true,
    defaultValue: "",
    fieldType: "uuid"
  },
  {
    id: "del-locale",
    name: "locale",
    label: "Locale",
    type: "text",
    readOnly: false,
    defaultValue: "us",
    fieldType: "locale"
  },
  {
    id: "del-categories",
    name: "categories",
    label: "Categories",
    type: "text",
    readOnly: false,
    defaultValue: "all",
    fieldType: "categories"
  }
];

export default fields;