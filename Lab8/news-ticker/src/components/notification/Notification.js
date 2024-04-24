import './notification.css';

function Notification({heading, body, show, success, updateNotification}) {
  const handleClose = () => {
    updateNotification(<></>);
  };

  let showClass = show ? "show" : "hide";
  let colorClass = success ? "text-bg-success" : "text-bg-danger";
  return (
    <div id="noti" className={"toast position-fixed bottom-0 end-0 " + showClass + " " + colorClass}>
      <div className="toast-header d-flex justify-content-between">
        <h5 id="noti-header">{heading}</h5>
        <button type="button" className="btn-close" onClick={handleClose}></button>
      </div>
      <div className="toast-body">
        <pre id="noti-body">{body}</pre>
      </div>
    </div>
  );
}

export default Notification;