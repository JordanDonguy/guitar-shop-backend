function parseFullName(fullName) {
  if (!fullName) return { first_name: '', last_name: '' };

  const nameParts = fullName.trim().split(' ');

  if (nameParts.length === 1) {
    return {
      first_name: nameParts[0],
      last_name: ''
    };
  }

  return {
    first_name: nameParts[0],
    last_name: nameParts.slice(1).join(' ')
  };
}

module.exports = parseFullName;
