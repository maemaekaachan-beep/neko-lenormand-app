module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cardName, cardNumber, keywords, question, spreadLabel } = req.body;

  if (!cardName) {
    return res.status(400).json({ error: 'cardName is required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `あなたはルノルマンカードの占い師です。猫タロットならぬ「ねこルノルマン」として、茶とら猫の視点で優しく温かみのあるリーディングをしてください。

引いたカード: ${cardNumber}番「${cardName}」
キーワード: ${keywords}
${question ? `質問: ${question}` : ''}

以下の形式で日本語でリーディングしてください。記号は使わずプレーンテキストで書いてください：
カードのメッセージ（2〜3文）
今日のアドバイス（1〜2文）
ねこからひとこと（猫らしい短いメッセージ）

絵文字を適度に使い、読みやすく温かい文章でお願いします。`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ reading: text });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
