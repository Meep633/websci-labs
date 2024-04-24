import Form from './Form';
import CenterForm from './CenterForm';
import fields from './postFields';
import { postNews } from '../../util/fetch';

function PostForm({updateData, updateForm, openNotification}) {
  const postData = async (inputs) => {
    let inputtedValues = {};
    for (let field in inputs) { //fields and inputs will be in same order (check Form.js)
      if (inputs[field]) inputtedValues[field] = inputs[field]; //only send input to api if it's not ""
    }

    let response = await postNews(inputtedValues);
    
    if (!response.success) {
      openNotification({
        heading: "POST /news error",
        body: response.error,
        show: true,
        success: false
      });
      return;
    }

    // response.output = {uuid: "uuid", locale: "locale", categories: ["categories"], article: {}}

    let locale = response.output.locale;
    let categories = response.output.categories;
    let article = response.output.article;

    for (let i = 0; i < categories.length; i++) {
      updateData((prevData) => {
        let newData = {...prevData}; //want to make a new copy, don't edit reference to prevData
        newData[locale].news[categories[i]].push(article);
        return newData;
      });
    }
    
    openNotification({
      heading: "POST /news success",
      body: JSON.stringify(response.output, null, 2),
      show: true,
      success: true
    });
    updateForm(<></>);
  };

  const handleClose = () => {
    updateForm(<></>);
  };

  let form = <Form
              id="post-form"
              heading="Create New Article"
              onSubmit={postData}
              onClose={handleClose}
              refresh={false}
              fields={fields}
             />;
  return <CenterForm form={form} />;
}

export default PostForm;