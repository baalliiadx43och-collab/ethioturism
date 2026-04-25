const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function sendMessageToGemini(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || `API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.message) return data.message;

    throw new Error("Invalid response from AI API");
  } catch (error) {
    console.error("AI API call failed:", error);
    throw error;
  }
}
