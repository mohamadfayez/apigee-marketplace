var service_url = context.getVariable('storage_function_url');
var service_url_short = service_url.replace("https://", "");
print(service_url);
print(service_url_short);

context.setVariable('servicecallout.SC-GetSignedUrl.target.url', service_url);
context.setVariable('storage_function_url_short', service_url_short);
