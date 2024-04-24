import CenterForm from './CenterForm';
import Form from './Form';
import fields from './putFields';
import { putNews } from '../../util/fetch';

function PutForm({article, updateData, updateForm, openNotification}) {
  const putData = async (inputs) => {
    // console.log(inputs);
    let inputtedValues = {};
    for (let field in inputs) { //fields and inputs will be in same order (check Form.js)
      if (inputs[field]) inputtedValues[field] = inputs[field]; //only send input to api if it's not ""
    }

    let response = await putNews(inputtedValues);

    if (!response.success) {
      openNotification({
        heading: "PUT /news/<uuid> error",
        body: response.error,
        show: true,
        success: false
      });
      return;
    }

    // response.output = {uuid: "uuid", locale: "locale", categories: ["categories"], article: {}}

    let old_locale = inputtedValues.old_locale;
    let old_categories = inputtedValues.old_categories.split(",");

    let uuid = response.output.uuid;
    let locale = response.output.locale === "same"
                  ? old_locale
                  : response.output.locale;
    let categories = response.output.categories[0] === "same" 
                      ? old_categories
                      : response.output.categories;
    let article = response.output.article;

    if (response.output.locale === "same" && response.output.categories[0] === "same") {
      // dont remove articles, just update them in place
      let x = false;
      for (let i = 0; i < categories.length; i++) {
        updateData((prevData) => {
          let newData = {...prevData};
          let ind = newData[locale].news[categories[i]].findIndex((a) => a.uuid === uuid);
          if (ind === -1) { //user somehow did a put request for an article that isn't displayed
            openNotification({ //if you want to, you can change this to do a GET /news/<uuid> request to get this article
              heading: ">:(",
              body: "PUT /news/<uuid> request was made for an article that isn't displayed on the website",
              show: true,
              success: false
            });
            x = true;
            return newData;
          }
          newData[locale].news[categories[i]][ind] = article;
          return newData;
        });

        if (x) { //article that isn't displayed was found
          return;
        }
      }
    } else {
      // remove articles from old places
      let x = false;
      for (let i = 0; i < old_categories.length; i++) {
        updateData((prevData) => {
          let newData = {...prevData};
          let ind = newData[old_locale].news[old_categories[i]].findIndex((a) => a.uuid === uuid);
          if (ind === -1) { //user somehow did a put request for an article that isn't displayed
            //if you want to, you can change this to do a GET /news/<uuid> request to get this article
            openNotification({
              heading: ">:(",
              body: "PUT /news/<uuid> request was made for an article that isn't displayed on the website",
              show: true,
              success: false
            });
            x = true;
            return newData;
          }
          newData[old_locale].news[old_categories[i]].splice(ind,1);
          return newData;
        });
        
        if (x) { //article that isn't displayed was found
          return;
        }
      }
      // add articles to new places
      for (let i = 0; i < categories.length; i++) {
        updateData((prevData) => {
          let newData = {...prevData};
          newData[locale].news[categories[i]].push(article);
          return newData;
        });
      }
    }

    openNotification({
      heading: "PUT /news/<uuid> success",
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
              id="put-form"
              heading="Update Article"
              onSubmit={putData}
              onClose={handleClose}
              refresh={false}
              fields={formFields}
             />;

  return <CenterForm form={form} />;
}

export default PutForm;