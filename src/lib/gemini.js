export const generateAIResponse = async (prompt, apiKey, systemInstruction = null, responseSchema = null) => {
  if (!apiKey) {
    throw new Error("AI API Key is missing.");
  }

  // Using the Vite Proxy /api/ai -> https://openrouter.ai
  const endpoint = "/api/ai/api/v1/chat/completions";
  
  // High-performance model on OpenRouter
  const model = "google/gemini-2.0-flash-001"; 

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const payload = {
    model: model,
    messages: messages,
    temperature: 0.7,
    max_tokens: 4096,
    stream: false
  };

  if (responseSchema) {
    payload.response_format = { type: "json_object" };
    if (!prompt.toLowerCase().includes("json")) {
      messages[messages.length-1].content += "\n\nIMPORTANT: Return ONLY a valid JSON object.";
    }
  }

  console.log(`[OpenRouter] Requesting ${model}...`);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "http://localhost:5176",
      "X-OpenRouter-Title": "AI Novelist 2.0"
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: "OpenRouter API error." } }));
    throw new Error(err.error?.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  
  if (responseSchema) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text;
      return JSON.parse(cleanJson);
    } catch(e) {
      console.error("Failed to parse JSON from OpenRouter:", text);
      throw new Error("AI returned invalid JSON.");
    }
  }

  return text;
};
