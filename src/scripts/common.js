window.doRestCall = async function ({
  url = undefined,
  method = undefined,
  body = undefined,
  contentType = undefined,
  resultAsJson = false
}) {

  const headers = {
    'Accept': 'application/json',
    ...contentType ? {'Content-Type': contentType} : {}
  };

  const result = await fetch(
    url,
    {
      method,
      headers,
      ...body ? {body} : {}
    }
  );

  if (resultAsJson) {
    return result.json();
  }

  return result;
};
