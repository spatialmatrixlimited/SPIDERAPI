//Server Response
let serverResponse = (res, data, success) => {
   return res.json({
      success: success,
      result: data
    });
  }

  exports.serverResponse = serverResponse;