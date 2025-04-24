export async function doRestCall({
  url = undefined,
  method = undefined,
  body = undefined,
  contentType = undefined,
  resultAsJson = false,
  failureResult = undefined
}) {

  const headers = {
    'Accept': 'application/json',
    ...contentType ? {'Content-Type': contentType} : {}
  };

  try {
    const result = await fetch(
      url,
      {
        method,
        headers,
        ...body ? {body} : {}
      }
    );

    if (result.ok) {
      if (resultAsJson) {
        return result.json();
      }
      return result;
    }
    throw new Error(result.status);
  }
  catch (error) {
    console.error('fetch() failed', error);
    return failureResult;
  }
}
