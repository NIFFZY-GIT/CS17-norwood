// file: src/components/ChatbotWidget.tsx
'use client';

import Script from 'next/script';
import { useState, useEffect } from 'react';

// This is the data we expect from our API
interface ApiConfigData {
  userId: string;
  hash: string;
}

// This is the full config the Chatbase script needs
interface ChatbaseConfigData {
  chatbotId: string;
  userId: string;
  userHash: string; // The script expects the property to be named 'userHash'
}

// Extend the global Window interface for TypeScript
declare global {
  interface Window {
    chatbase?: {
      q?: unknown[];
      config?: ChatbaseConfigData;
      (...args: unknown[]): void;
    };
  }
}

const ChatbotWidget = () => {
  // Our state will hold the data exactly as it comes from the API
  const [apiConfig, setApiConfig] = useState<ApiConfigData | null>(null);

  useEffect(() => {
    const fetchSecureConfig = async () => {
      try {
        const response = await fetch('/api/chatbase-auth');
        if (!response.ok) return;
        const data: ApiConfigData = await response.json();
        setApiConfig(data);
      } catch (err) {
        console.error('Failed to fetch Chatbase secure config:', err);
      }
    };

    fetchSecureConfig();
  }, []);

  // Only render if we have successfully fetched the config from our API
  if (!apiConfig) {
    return null;
  }

  const chatbotId = "FNH1sEttjS9o79G4YAZDR";

  return (
    <Script id="chatbase-secure-loader" strategy="afterInteractive">
      {`
        if (!(window.chatbase && window.chatbase.q)) {
          
          window.chatbase = function(...args) {
            window.chatbase.q = window.chatbase.q || [];
            window.chatbase.q.push(args);
          };

          // Here we create the final config object for Chatbase,
          // mapping our API response to the expected property names.
          window.chatbase.config = {
            chatbotId: "${chatbotId}",
            userId: "${apiConfig.userId}",
            userHash: "${apiConfig.hash}", // THE FIX: Use apiConfig.hash for the userHash property
          };

          const script = document.createElement("script");
          script.src = "https://www.chatbase.co/embed.min.js";
          script.id = "${chatbotId}";
          script.defer = true;
          script.setAttribute('data-domain', 'www.chatbase.co');
          document.body.appendChild(script);
        }
      `}
    </Script>
  );
};

export default ChatbotWidget;