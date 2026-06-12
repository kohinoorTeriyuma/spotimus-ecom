import { GoogleGenAI } from "@google/genai";
import { Product } from "../models/Product";
import { Request, Response } from "express";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const KNOWLEDGE_BASE_FAQ = `
AURA STORE POLICIES & INFORMATION:

1. Returns & Exchanges:
- 30-Day Policy: We offer a 30-day, stress-free return policy.
- Condition: Items must be unused, in their original packaging, and in the same pristine condition they were received.
- Cost: Returns and exchanges are completely free! We cover any return shipment fees.

2. Shipping & Deliveries:
- Cost: Standard shipping is 100% free with no minimum purchase requirement!
- Delivery Time: Swift local delivery typically arrives within 2-5 business days.
- Tracking: Full package tracking is sent automatically upon dispatch.

3. Secure Checkout & Simulated Orders:
- Cart & Basket: Adding products to your Cart prepares them for purchase.
- Placing Orders: Navigate to your Basket page and click "Secure Checkout" to process.
- Stock Adjustments: Upon successful purchase, our shop simulation automatically decrements the product stock.
- Success Page: A beautiful overlay will confirm your successful order.

4. User Authentication & JWT Sessions:
- Security: User accounts are protected using JSON Web Tokens (JWT) and secure password hashing.
- Active Sessions: Tokens are safely preserved in browser local storage.
- Admin Panel: If logged in as an administrator, you get privileged access to add, edit, and delete items from the storefront.
- How to Test Admin: To test adding, editing, or deleting items, you can create a normal user, register, and if admin mode is toggled, manage items seamlessly.

5. Aura Brand & Identity:
- Slogan: "Ethical Living, Curated for You."
- Visual Aesthetic: We focus on clean typography, natural warm tones (olive green, sand, stone, ink), and elegant layouts.
- Technology Stack: Modern full-stack architecture powered by React, Vite, Node.js, Express, and MongoDB (with a zero-configuration JSON fallback).
`;

export const handleChatMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { messages, message } = req.body;
    
    // Validate request
    if (!message && (!messages || !Array.isArray(messages))) {
      return res.status(400).json({ error: "Please provide a 'message' or 'messages' array." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        reply: "Hello! I am Aura, your curated lifestyle assistant. It looks like `GEMINI_API_KEY` is not set in the Secrets, so I'm replying in fallback mode. I'd love to let you know that shipping is completely free for all items in our curated catalog, and we offer a hassle-free, 30-day return policy. Let me know if you would like help browsing, registering, or checking out!",
        isFallback: true
      });
    }

    // Initialize Gemini Client
    const ai = getGeminiClient();

    // Retrieve active products from database in real-time
    let productsList: any[] = [];
    try {
      productsList = await Product.find({});
    } catch (e) {
      console.warn("Could not retrieve products for chatbot context:", e);
    }

    const formattedProducts = productsList.map(p => 
      `- ${p.title} || Category: ${p.category} || Price: $${p.price.toFixed(2)} || Stock Level: ${p.stock <= 0 ? "OUT OF STOCK" : `${p.stock} units remaining`}\n  Description: ${p.description}`
    ).join("\n\n");

    const systemInstruction = `You are "Aura", the serene, helpful digital assistant for the Aura Curated minimal e-commerce storefront.
Your goal is to friendly, elegantly, and concisely assist users with questions about shipping, returns, how our app's mock checkout system works, user registration, administrative functions, or specific products currently in our storefront.

${KNOWLEDGE_BASE_FAQ}

CURRENT REAL-TIME STOREFRONT PRODUCTS (RETRIEVED FROM THE LIVE DATABASE):
${formattedProducts || "No products currently available in the active catalog."}

STRICT DIRECTIVES:
1. Ground your answers truthfully and directly in the store policies and active products listed above.
2. If asked about what items are available, recommend products from the live database above! Cite details such as category, stock status, and price accurately. Always mention a couple of relevant active items.
3. Keep your tone serene, minimal, highly professional, warm, and natural. Use bulleted lists where helpful. Avoid rambling.
4. Do not make up mock products that are not present in the live database above! If the database is empty or doesn't list a matching item, kindly recommend something else we do have or say we don't have it currently.
5. If asked general user questions ("How do I return?", "What is the shipping cost?", "How do I checkout?"), answer explicitly according to the Aura Store Policies knowledge base.
6. Refuse politely to answer queries completely unrelated to shopping, e-commerce, or the Aura storefront. Keep focus on the store!`;

    // Prepare contents array for multi-turn chat
    let contentsArray: any[] = [];

    if (messages && Array.isArray(messages) && messages.length > 0) {
      // Map incoming messages to the proper structure:
      // Each message should have role "user" or "model", and parts [{ text: ... }]
      contentsArray = messages.map((m: any) => {
        const role = m.role === "assistant" || m.role === "model" ? "model" : "user";
        return {
          role,
          parts: [{ text: m.content || m.text || "" }]
        };
      });
      
      // If the last message in history is not matching the current query, append the current message
      const lastMsg = messages[messages.length - 1];
      if (message && lastMsg && (lastMsg.content !== message && lastMsg.text !== message)) {
        contentsArray.push({
          role: "user",
          parts: [{ text: message }]
        });
      }
    } else {
      contentsArray = [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ];
    }

    // Call Gemini! Basic Text Q&A -> "gemini-3.5-flash"
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentsArray,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I apologize, but I could not formulate an answer right now. Please try again.";

    return res.json({
      reply: replyText
    });
  } catch (error: any) {
    console.error("Chatbot API Error:", error);
    return res.status(500).json({
      error: "Internal server error during assistant lookup.",
      details: error.message
    });
  }
};
