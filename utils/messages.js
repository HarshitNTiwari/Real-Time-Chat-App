import moment from "moment";

function formatMessage(username, text) {
  return {
    username, //username of the sender of the message
    text,
    time: moment().format("h:mm a"),
  };
}

export { formatMessage };
