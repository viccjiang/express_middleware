function handleSuccess (res, data) {
  res.send({
    "status": "success",
    "posts": data
  })
  res.end();
}
module.exports = handleSuccess;