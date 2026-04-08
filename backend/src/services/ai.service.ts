import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function scanClothing(imageBase64: string): Promise<Record<string, unknown>> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `Analyze this clothing item photo. Return ONLY a JSON object with no additional text:
{
  "category": "TOP|BOTTOM|DRESS|JACKET|SHOES|ACCESSORY",
  "primary_color": "string",
  "secondary_colors": ["string"],
  "material_guess": "string",
  "occasion_tags": ["CASUAL|WORK|EVENING|SPORT"],
  "season_tags": ["SUMMER|WINTER|ALL"],
  "style_tags": ["string"]
}`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI');
  }

  return JSON.parse(textBlock.text);
}

export async function generateOutfits(
  wardrobe: Array<Record<string, unknown>>,
  weather: Record<string, unknown> | undefined,
  occasion: string | undefined,
  styleProfile: Record<string, unknown> | undefined
): Promise<Array<Record<string, unknown>>> {
  const wardrobeSummary = wardrobe.map((item) => ({
    id: item.id,
    category: item.category,
    colors: item.colors,
    material: item.material,
    season: item.season,
    occasion: item.occasion,
    brand: item.brand,
  }));

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are a personal stylist. Given these wardrobe items: ${JSON.stringify(wardrobeSummary)}.
Weather: ${JSON.stringify(weather || 'not specified')}.
Occasion: ${occasion || 'not specified'}.
Style: ${JSON.stringify(styleProfile || 'not specified')}.

Suggest 3 outfits using ONLY items from the wardrobe. Return ONLY JSON with no additional text:
[{"name": "string", "items": ["item_ids"], "reasoning": "string", "score": 0-100}]`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI');
  }

  return JSON.parse(textBlock.text);
}

export async function analyzeStyleDNA(
  wardrobeStats: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Analyze this wardrobe data and create a style DNA profile. Wardrobe stats: ${JSON.stringify(wardrobeStats)}.

Return ONLY JSON with no additional text:
{
  "style_archetype": "string (e.g. Classic, Bohemian, Minimalist, Streetwear, etc.)",
  "dominant_colors": ["string"],
  "style_score": {
    "classic": 0-100,
    "trendy": 0-100,
    "casual": 0-100,
    "formal": 0-100,
    "sporty": 0-100
  },
  "wardrobe_gaps": ["string - missing item suggestions"],
  "personality_traits": ["string"],
  "recommendations": ["string"]
}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI');
  }

  return JSON.parse(textBlock.text);
}
