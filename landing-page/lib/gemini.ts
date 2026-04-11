const API_BASE_URL = "http://localhost:5000/api/v1";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function sendMessageToGemini(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.message) {
      return data.message;
    }

    throw new Error("Invalid API response");
  } catch (error) {
    console.error("AI API call failed:", error);
    throw error;
  }
}
