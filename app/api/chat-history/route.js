import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";


export default withIronSessionApiRoute(async function handler(req, res) {
  req.session.history = req.session.history || []; // Initialize if empty
  if (req.method === "POST") {
    const { message, response } = req.body;

    // Save chat messages in session
    req.session.history.push({ message, response });

    await req.session.save();
    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    // Retrieve chat history
    return res.status(200).json(req.session.history);
  }

  res.status(405).end(); // Method not allowed
}, sessionOptions);
