var recObj = JSON.parse(context.getVariable("data.mock"));
var resultObj;
var entityId = context.getVariable("entityId");

if (entityId) {
  if (recObj) {
    for (i=0; i<recObj.length;i++) {
      var propNames = Object.keys(recObj[i]);
      for (n=0; n<propNames.length; n++) {
        if (recObj[i][propNames[n]] == entityId) {
          // found object, return
          resultObj = recObj[i];
          break;
        }
      }

      if (resultObj) break;
    }
  }

  if (resultObj) {
    context.setVariable("data.mock", JSON.stringify(resultObj));
  } else {
    context.setVariable("data.mock", "");
    context.proxyResponse.status.code = 404;
    context.proxyResponse.status.message = "Not found."
  }
}