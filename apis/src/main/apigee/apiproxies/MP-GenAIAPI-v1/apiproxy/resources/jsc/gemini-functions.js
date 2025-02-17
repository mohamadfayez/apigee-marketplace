
var geminiResponse = JSON.parse(response.content);
var questionResponse = "";
var model = context.getVariable("genai.model");

if (geminiResponse["usageMetadata"]) {
  context.setVariable("genai.promptTokenCount", geminiResponse["usageMetadata"].promptTokenCount);
  context.setVariable("genai.responseTokenCount", geminiResponse["usageMetadata"].candidatesTokenCount);
  context.setVariable("genai.totalTokenCount", geminiResponse["usageMetadata"].totalTokenCount);
}

if (geminiResponse["candidates"] && geminiResponse["candidates"].length > 0 && geminiResponse["candidates"][0]["content"]["parts"] && geminiResponse["candidates"][0]["content"]["parts"].length > 0) {
  questionResponse = geminiResponse["candidates"][0]["content"]["parts"][0]["text"];
}

context.setVariable("response.content", JSON.stringify({

  "prompt": context.getVariable("genai.prompt"),
  "response": questionResponse,
  "model": model,
  "usage": {
    "prompt_tokens": context.getVariable("genai.promptTokenCount"),
    "completion_tokens": context.getVariable("genai.responseTokenCount"),
    "total_tokens": context.getVariable("genai.totalTokenCount")
  }
}));

function convertResponse(dataResponseObject) {
  var result = "";

  for (i = 0; i < dataResponseObject.length; i++) {
    result += dataResponseObject[i]["candidates"][0]["content"]["parts"][0]["text"];
  }

  return result;
}

// this is to only export the function if in node
if (typeof exports !== 'undefined') {
  exports.convertResponse = convertResponse;
}