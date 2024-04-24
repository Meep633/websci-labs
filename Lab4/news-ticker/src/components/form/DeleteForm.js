import CenterForm from './CenterForm';
import Form from './Form';
import fields from './deleteFields';
import { deleteNews } from '../../util/fetch';

function DeleteForm({article, updateData, updateForm, openNotification}) {
  const deleteData = async (inputs) => {
    let inputtedValues = {};
    for (let field in inputs) { //fields and inputs will be in same order (check Form.js)
      if (inputs[field]) inputtedValues[field] = inputs[field]; //only send input to api if it's not ""
    }

    let response = await deleteNews(inputtedValues);

    if (!response.success) {
      openNotification({
        heading: "DELETE /news/<uuid> error",
        body: response.error,
        show: true,
        success: false
      });
      return;
    }

    let affected_locale = response.output.affected_locale;
    let affected_categories = response.output.affected_categories;
    let uuid = inputtedValues.uuid;

    if (affected_locale !== "") {
      for (let i = 0; i < affected_categories.length; i++) {
        updateData((prevData) => {
          let newData = {...prevData};
          let ind = newData[affected_locale].news[affected_categories[i]].findIndex((a) => a.uuid === uuid);
          if (ind !== -1) newData[affected_locale].news[affected_categories[i]].splice(ind,1);
          return newData;
        });
      }
      updateData((prevData) => {
        let newData = {...prevData};
        let ind = newData[affected_locale].news.bookmarks.findIndex((a) => a.uuid === uuid);
        if (ind !== -1) newData[affected_locale].news.bookmarks.splice(ind,1);
        return newData;
      });
    }

    openNotification({
      heading: "DELETE /news/<uuid> success",
      body: JSON.stringify(response.output, null, 2),
      show: true,
      success: true
    });
    updateForm(<></>);
  };

  let formFields = [];
  for (let i = 0; i < fields.length; i++) {
    formFields.push(fields[i]);
    for (let key in article) {
      if (fields[i].name === key) {
        let val = article[key];
        if (key === "categories") val = article[key].join(",");
        formFields[i].defaultValue = val;
      }
    }
  }

  const handleClose = () => {
    updateForm(<></>);
  };

  let form = <Form
              id="del-form"
              heading="Delete Article"
              onSubmit={deleteData}
              onClose={handleClose}
              refresh={false}
              fields={fields}
             />;

  return <CenterForm form={form} />;
}

export default DeleteForm;