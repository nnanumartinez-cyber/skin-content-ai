module.exports = async function handler(req, res) {
  try {
    const { prompt } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      return res.status(500).json(data);
    }

    return res.status(200).json({
      result:
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sin respuesta",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
};
