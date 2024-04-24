//source: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default capitalize;