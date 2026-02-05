export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const clientKey = req.headers["x-api-key"];
  const SERVER_KEY = process.env.INTERNAL_API_KEY;

  if (!clientKey || clientKey !== SERVER_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  res.json({
    status: "success",
    message: "API key validated"
  });
}