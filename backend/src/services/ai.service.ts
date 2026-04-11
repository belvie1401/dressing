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
            text: `Tu es un expert styliste. Analyse cette photo de vêtement et retourne UNIQUEMENT un objet JSON (aucun texte supplémentaire, aucun markdown) avec ce schéma exact :

{
  "name": "string (nom court et descriptif en français, max 4 mots, ex: 'Chemise blanche oversize', 'Jean slim noir', 'Bottines camel')",
  "category": "TOP|BOTTOM|DRESS|JACKET|SHOES|ACCESSORY",
  "primary_color": "string (UNE couleur en français parmi: Blanc, Noir, Gris, Beige, Marron, Rouge, Rose, Orange, Jaune, Vert, Bleu, Bleu marine, Violet, Camel, Kaki, Multicolore)",
  "colors": ["string (mêmes valeurs que primary_color, inclure primary_color en première position)"],
  "color_hexes": ["string (code hex #RRGGBB correspondant à chaque couleur)"],
  "material": "string (matière détectée en français, ex: Coton, Lin, Laine, Cuir, Jean, Soie, Polyester, Cachemire — une seule valeur)",
  "season": "SUMMER|WINTER|ALL (ALL = toutes saisons ou mi-saison)",
  "occasion": "CASUAL|WORK|EVENING|SPORT",
  "brand": "string ou null (marque visible sur l'étiquette/logo si identifiable, sinon null)",
  "style_tags": ["string (3-5 tags de style en français, ex: 'minimaliste', 'chic', 'décontracté')"],
  "confidence": 0
}

Règles strictes :
- "confidence" = nombre entre 0 et 100 représentant ta certitude globale
- Toujours choisir UNE seule valeur pour category/season/occasion
- "colors" doit contenir au minimum primary_color
- "color_hexes" doit avoir exactement la même longueur que "colors"
- Si tu ne peux pas identifier la marque avec certitude, mets null
- Réponds UNIQUEMENT avec le JSON, rien d'autre.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI');
  }

  // Strip potential markdown fences just in case
  const raw = textBlock.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(raw);
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
