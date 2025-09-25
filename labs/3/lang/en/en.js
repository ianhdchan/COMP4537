exports.helloDate = (host, name, date) => {
  if (name && date) {
    return `Hello ${name}, What a beautiful day. Server current date and time is ${date}`;
  } else {
    return `Please change url to Example: https://${host}/getDate/?name=Bob`;
  }
};
