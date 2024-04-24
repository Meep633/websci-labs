import './dbform.css';
import {Header, Field, Submit} from './Form';
import CenterForm from './CenterForm';
import fields from './dbFields.js';
import { getDB, postDB, putDB, deleteDB } from '../../util/fetch';

import {useState} from 'react';

function DBForm({updateForm, openNotification}) {
  let originalInputs = {
    endpoint: "GET",
    path: "",
    parameters: {}
  };
  for (let i = 0; i < fields.length; i++) {
    originalInputs.parameters[fields[i].name] = fields[i].defaultValue;
  }
  const [inputs, setInputs] = useState(originalInputs);

  const handleChange = (e) => {
    if (e.target.name === "endpoint" || e.target.name === "path") {
      setInputs({
        ...inputs,
        [e.target.name]: e.target.value
      });
    } else {
      setInputs({
        ...inputs,
        parameters: {
          ...inputs.parameters,
          [e.target.name]: e.target.value
        }
      });
    }
  };

  const handleClose = () => {
    updateForm(<></>);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = inputs.endpoint;
    const path = inputs.path;
    const params = inputs.parameters; //only used for POST and PUT (i was too lazy to hide this on the form for GET and DELETE)

    let response;
    if (endpoint === "GET") {
      response = await getDB({path: path});
    } else if (endpoint === "POST") {
      response = await postDB({path: path, params: params});
    } else if (endpoint === "PUT") {
      response = await putDB({path: path, params: params});
    } else {
      response = await deleteDB({path: path});
    }

    if (!response.success) {
      openNotification({
        heading: endpoint + " /db error",
        body: response.error,
        show: true,
        success: false
      });
      return;
    }
    openNotification({
      heading: endpoint + " /db success",
      body: JSON.stringify(response.output, null, 2),
      show: true,
      success: true
    });

    updateForm(<></>);
  };

  let fieldList = fields.map((field) => {
    return <Field 
            key={field.id}
            id={field.id} 
            name={field.name}
            label={field.label} 
            type={field.type} 
            readOnly={field.readOnly} 
            defaultValue={field.defaultValue} 
            onChange={handleChange} 
          />;
  });

  let form = (
    <form id="db-form" className="text-bg-light p-3" onSubmit={handleSubmit}>
      <Header heading={"DB Endpoints"} onClose={handleClose} />
      <div>
        <select id="db-endpoints" name="endpoint" onChange={handleChange}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input readOnly id="db-text" value="/db/" size="4" />
        <input type="text" name="path" onChange={handleChange} />
      </div>
      <div>
        {fieldList}
      </div>
      <Submit />
    </form>
  );
  return <CenterForm form={form} />;
}

export default DBForm;