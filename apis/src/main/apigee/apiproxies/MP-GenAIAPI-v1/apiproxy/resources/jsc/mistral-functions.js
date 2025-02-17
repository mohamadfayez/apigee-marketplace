var mistralResponse = JSON.parse(response.content);
var responseText = "";
var model = context.getVariable("genai.model");

if (mistralResponse["usage"]) {
  context.setVariable("genai.promptTokenCount", mistralResponse["usage"].prompt_tokens);
  context.setVariable("genai.responseTokenCount", mistralResponse["usage"].completion_tokens);
  context.setVariable("genai.totalTokenCount", mistralResponse["usage"].total_tokens);
}

if (mistralResponse["choices"] && mistralResponse["choices"].length > 0) {
  responseText = mistralResponse["choices"][0]["message"]["content"];
}

context.setVariable("response.content", JSON.stringify({

  "prompt": context.getVariable("genai.prompt"),
  "response": responseText,
  "model": model,
  "usage": {
    "prompt_tokens": context.getVariable("genai.promptTokenCount"),
    "completion_tokens": context.getVariable("genai.responseTokenCount"),
    "total_tokens": context.getVariable("genai.totalTokenCount")
  }
}));
