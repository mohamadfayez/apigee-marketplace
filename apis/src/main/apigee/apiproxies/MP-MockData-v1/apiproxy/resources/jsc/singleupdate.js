var recObj = JSON.parse(context.getVariable("data.mock"));
var resultObj;
var requestObj;
if (context.proxyRequest.content) {
  requestObj = JSON.parse(context.proxyRequest.content);
}
var entityId = context.getVariable("entityId");

if (recObj && entityId) {
  for (i=0; i<recObj.length;i++) {
    var propNames = Object.keys(recObj[i]);
    for (n=0; n<propNames.length; n++) {
      if (recObj[i][propNames[n]] == entityId) {
        // found object, return
        resultObj = recObj[i];
        if (requestObj) {
          resultObj = requestObj;
          recObj[i] = requestObj;
        }
        break;
      }
    }

    if (resultObj) break;
  }
} else if (requestObj) {
  recObj = requestObj
}

if (recObj) {
  context.setVariable("data.mock", JSON.stringify(recObj));
}