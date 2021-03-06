const ut = require("./_utils");

module.exports.get = async (event) => {
  const count = await ut.get(event.pathParameters.id);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: count
  };
};

module.exports.add = async (event) => {
  const count = await ut.add(event.pathParameters.id);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: count
  };
};

module.exports.remove = async (event) => {
  const count = await ut.remove(event.pathParameters.id);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: count
  };
};
