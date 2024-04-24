import fields from './nbaFields.js';
const inputFields = [...fields].filter((field) => field.id !== "nba-name" && field.id !== "nba-season");

//make a form to allow user to change the x and y axes of the graph (dropdowns)
function DataVisForm({setX, setXAxisName, setY, setYAxisName}) {
  const handleChange = (e) => {
    if (e.target.name === "x-axis") {
      setX(e.target.value);
      for (let i = 0; i < inputFields.length; i++) {
        if (inputFields[i].name === e.target.value) {
          setXAxisName(inputFields[i].label);
          break;
        }
      }
    } else {
      setY(e.target.value);
      for (let i = 0; i < inputFields.length; i++) {
        if (inputFields[i].name === e.target.value) {
          setYAxisName(inputFields[i].label);
          break;
        }
      }
    }
  };

  return (
    <form>
      <div>
        <label htmlFor="x-axis" className="me-2 mb-1">X Axis:</label>
        <select name="x-axis" onChange={handleChange}>
          {
            inputFields.map((field) => {
              return field.name === "ppg"
              ?
              <option key={field.name} selected value={field.name}>{field.label}</option>
              :
              <option key={field.name} value={field.name}>{field.label}</option>
            })
          }
        </select>
      </div>
      <div>
        <label htmlFor="y-axis" className="me-2 mb-1">Y Axis:</label>
        <select name="y-axis" onChange={handleChange}>
        {
            inputFields.map((field) => {
              return field.name === "fg_pct"
              ?
              <option key={field.name} selected value={field.name}>{field.label}</option>
              :
              <option key={field.name} value={field.name}>{field.label}</option>
            })
          }
        </select>
      </div>
    </form>
  );
}

export default DataVisForm;