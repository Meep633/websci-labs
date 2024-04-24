import './form.css';

import {useState} from 'react';

function Header({heading, onClose}) {
  return (
    <div className="d-flex justify-content-between mb-1">
      <h4>{heading}</h4>
      <button className="btn-close" type="button" onClick={onClose}></button>
    </div>
  );
}

// props: id, label, type, defaultValue, readOnly, onChange
function Field({id, name, label, type, defaultValue, readOnly, onChange}) {
  let input = readOnly 
    ? <input 
        id={id} 
        className="form-control-plaintext col" 
        name={name} 
        type={type} 
        defaultValue={defaultValue} 
        onChange={onChange} 
        readOnly
      /> 
    : <input 
        id={id} 
        className="form-control col" 
        name={name} 
        type={type} 
        defaultValue={defaultValue} 
        onChange={onChange}
      />;
  
  return (
    <div className="form-group row mb-1">
      <label htmlFor={id} className="col-form-label col-4">{label}</label>
      {input}
    </div>
  );
}

function Submit() {
  return (
    <button type="submit" className="btn btn-primary">Submit</button>
  );
}

// props: id, heading, onSubmit, refresh, fields = [{id, label, type, defaultValue, readOnly},...]
// props.onSubmit is expected to take in an object with the form's input values and do something with them
// onSubmit = (inputs) => {...}
function Form({id, heading, onSubmit, onClose, refresh, fields}) {
  let originalInputs = {};
  for (let i = 0; i < fields.length; i++) {
    originalInputs[fields[i].name] = fields[i].defaultValue;
  }
  const [inputs, setInputs] = useState(originalInputs);
  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    if (!refresh) e.preventDefault();
    onSubmit(inputs);
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

  return (
    <form id={id} className="text-bg-light p-3" onSubmit={handleSubmit}>
      <Header heading={heading} onClose={onClose} />
      {fieldList}
      <Submit />
    </form>
  );
}

export default Form;
export {Header, Field, Submit};