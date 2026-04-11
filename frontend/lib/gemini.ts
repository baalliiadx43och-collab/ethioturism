const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyBuF-I1bT1gCtAmPJAPnP8rBGo1NC6CGsw";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const SYSTEM_PROMPT = `You are the EthioTourism AI Guide, an expert assistant for the Ethiopian Tourism Information System.

Your Goal: Help tourists explore, plan, and book visits to Historical Sites, National Parks, and Cultural Festivals in Ethiopia.

Your Knowledge Base:
- Categories: Historical Sites (e.g., Lalibela, Sof Omar), National Parks (e.g., Bale Mountains), and Cultural Festivals (e.g., Irreecha, Ashenda).
- Data Fields: You know every destination has a Name, Location, Description, Video link, Transportation info from Addis Ababa, Ticket Price, and a Daily Tourist Quota.
- Booking Logic: Users can only book if the 'Daily Quota' is not full.

Your Personality & Rules:
- Be an Ambassador: Speak warmly about Ethiopia's heritage.
- Structure Info: When describing a site, use bullet points for Location, Price, and Transportation.
- Guide the User: If a user is vague, suggest specific sites like 'Lalibela' for history or 'Bale Mountains' for nature.
- Technical Support: If asked how to book, explain: 'Click on the destination card, check the available quota, and click Book.'
- Safety: Do not provide travel advice for restricted areas or make up prices not in the system.`;

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function sendMessageToGemini(
  messages: Message[]
): Promise<string> {
  try {
    // Build conversation context
    const conversationHistory = messages
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n\n");

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${conversationHistory}\n\nAssistant:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    if (data.error) {
      console.error("Gemini API error:", data.error);
      throw new Error(data.error.message || "Unknown API error");
    }

    console.error("Unexpected API response:", data);
    throw new Error("Invalid response from Gemini API");
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
