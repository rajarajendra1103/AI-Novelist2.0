import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export const generateAIResponse = async (prompt, systemInstruction = null, responseSchema = null) => {
  const modelId = import.meta.env.VITE_BEDROCK_MODEL_ID || "us.amazon.nova-lite-v1:0";

  const messages = [
    {
      role: "user",
      content: [{ text: prompt }],
    },
  ];

  const system = systemInstruction ? [{ text: systemInstruction }] : undefined;

  if (responseSchema) {
    messages[messages.length - 1].content[0].text += "\n\nIMPORTANT: Return ONLY a valid JSON object.";
  }

  const command = new ConverseCommand({
    modelId,
    messages,
    system,
    inferenceConfig: {
      maxTokens: 4096,
      temperature: 0.7,
    },
  });

  try {
    console.log(`[AWS Bedrock] Requesting ${modelId}...`);
    const response = await client.send(command);
    const text = response.output.message.content[0].text;

    if (responseSchema) {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse JSON from Bedrock:", text);
        throw new Error("AI returned invalid JSON.");
      }
    }

    return text;
  } catch (err) {
    console.error("AWS Bedrock Error:", err);
    throw new Error(err.message || "Failed to generate AI response.");
  }
};
