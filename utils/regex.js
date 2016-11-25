function convertStringToRegex(string) {
  const flags = string.replace(/.*\/([gimy]*)$/, '$1');
  const pattern = string.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
  try {
    const regex = new RegExp(pattern, flags);
    return regex;
  } catch (e) {
    // Invalid regex, treat as fuzzy literal
    return new RegExp(string);
  }
}

module.exports = {
  convertStringToRegex
}
