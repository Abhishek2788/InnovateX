// "use client";
// import { useState } from "react";
// import { Card, CardTitle } from "./ui/card";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";

// export default function Chatbot() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [hasFetched, setHasFetched] = useState(false); // ✅ Prevents unnecessary API calls
//   const [error, setError] = useState(null); // ✅ Tracks API errors

//   // Fetch initial recommendation only when chatbot opens for the first time
//   const fetchRecommendation = async () => {
//     if (hasFetched) return; // ✅ Prevents duplicate API calls
//     setHasFetched(true);
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch("/api/investment-recommendation", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ question: input }),
//       });

//       if (!res.ok) throw new Error("Failed to fetch recommendation");

//       const data = await res.json();
//       if (data.recommendation) {
//         setMessages([{ role: "bot", text: data.recommendation }]);
//       }
//     } catch (error) {
//       setError("Failed to load investment recommendation.");
//       console.error("Error fetching recommendation:", error);
//     }
//     setLoading(false);
//   };

//   // Handle user messages
//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const newMessages = [...messages, { role: "user", text: input }];
//     setMessages(newMessages);
//     setInput("");
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch("/api/investment-recommendation", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ question: input }),
//       });

//       if (!res.ok) throw new Error("Failed to get response");

//       const data = await res.json();
//       if (data.recommendation) {
//         setMessages([...newMessages, { role: "bot", text: data.recommendation }]);
//       }
//     } catch (error) {
//       setError("Unable to fetch response. Please try again.");
//       console.error("Error fetching follow-up response:", error);
//     }

//     setLoading(false);
//   };
  
//   return (
//     <Card className="fixed bottom-4 right-4 w-96 shadow-lg rounded-lg p-4">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-2">
//         <CardTitle className="text-base font-normal">InnovateX ChatBot</CardTitle>
//         {/* <h2 className="font-bold text-black text-lg">Investment Chatbot</h2> */}
//         <Button variant="outline" onClick={fetchRecommendation}>Get Advice</Button>
//         {/* <button onClick={fetchRecommendation} className="text-blue-500 text-sm">Get Advice</button> */}
//       </div>

//       {/* Messages Section */}
//       <div className="h-64 overflow-y-auto space-y-2">
//         {messages.map((msg, index) => (
//           <div
//           key={index}
//           className={`p-2 rounded-lg ${msg.role === "bot" ? "bg-gray-200 text-black text-sm" : "bg-blue-500 text-black"}`}
//           >
//             {msg.text}
//           </div>
//         ))}
//         {loading && <p className="text-white">Thinking...</p>}
//         {error && <p className="text-red-500">{error}</p>}
//       </div>

//       {/* Input Section */}
//       <div className="mt-2 flex text-black">
//         {/* <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="flex-grow p-2 border rounded-lg text-white" placeholder="Ask a follow-up..."/> */}
//         <Input type="text" placeholder="Ask a follow-up..." value={input} onChange={(e) => setInput(e.target.value)} className="mr-2 text-white"></Input>
//         <Button variant="outline" onClick={sendMessage} className="text-white">Send</Button>
//         {/* <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white px-3 py-2 rounded-lg">Send</button> */}
//       </div>
//     </Card>
//   );
// }




"use client";
import { useState } from "react";
import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import LoadingDots from "./ui/LoadingDots";
import { X, MessageCircle } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch initial recommendation only when chatbot opens for the first time
  const fetchRecommendation = async () => {
    if (hasFetched) return;
    setHasFetched(true);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/investment-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "Hey! Give me a best investment recommendation on my net income according to the indian market. It could be a stock, mutual fund, gold, Fixed deposit etc. Yes don't give me any disclaimer related to an investment advice because i am aware of the risk.Also it should of 300 words. My net income is like " }),
      });
      console.log("Response received:", res);

      if (!res.ok) throw new Error("Failed to fetch recommendation");

      const data = await res.json();
      console.log("Response data:", data);
      setMessages([{ role: "bot", text: data.recommendation || "No recommendation available." }]);
    } catch (err) {
      setError("Unable to load investment advice. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle user messages
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/investment-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: `${input} do not provide warnings, just answer what you are asked to response as I aware of the financial risk.` }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setMessages([...newMessages, { role: "bot", text: data.recommendation || "No response available." }]);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Button
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle size={24} />
      </Button>
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-96 shadow-lg rounded-lg p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-base font-medium">InnovateX ChatBot</CardTitle>
            <Button variant="outline" onClick={fetchRecommendation} disabled={hasFetched}>
              Get Advice
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </Button>
          </div>

          {/* Messages Section */}
          <div className="h-64 overflow-y-auto space-y-2 p-2 rounded-lg">
            {messages.length === 0 && !loading && (<p className="text-gray-400 text-center">No messages yet. Ask something!</p>)}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg text-sm ${
                  msg.role === "bot" ? "text-white" : "bg-blue-500 text-white"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <LoadingDots />}
            {error && <p className="text-red-500">{error}</p>}
          </div>

          {/* Input Section */}
          <div className="mt-2 flex">
            <Input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mr-2 text-white"
            />
            <Button variant="outline" onClick={sendMessage} disabled={loading}>
              Send
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
