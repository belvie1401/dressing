import Anthropic from '@anthropic-ai/sdk';
import Replicate from 'replicate';
import { v2 as cloudinary } from 'cloudinary';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Startup checks
if (!process.env.REPLICATE_API_TOKEN) {
  console.warn('WARNING: REPLICATE_API_TOKEN not set — virtual try-on will be unavailable');
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('WARNING: ANTHROPIC_API_KEY not set — AI features will be unavailable');
}

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

/**
 * Virtual try-on via Replicate's IDM-VTON model.
 *
 * Takes a person photo + a garment photo and returns a Cloudinary-hosted URL
 * of the synthesized image. Throws on Replicate / Cloudinary failure with a
 * user-readable French message — caller surfaces it via res.status(500).
 */
export async function virtualTryOn(
  personImageUrl: string,
  garmentImageUrl: string,
  garmentDescription: string,
): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error('Essayage virtuel non configuré (REPLICATE_API_TOKEN manquant)');
  }

  const replicate = new Replicate({ auth: token });

  let output: unknown;
  try {
    output = await replicate.run(
      'cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f',
      {
        input: {
          human_img: personImageUrl,
          garm_img: garmentImageUrl,
          garment_des: garmentDescription,
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 30,
          seed: 42,
        },
      },
    );
  } catch (err) {
    console.error('Replicate IDM-VTON error:', err);
    throw new Error('Essayage virtuel indisponible');
  }

  // The Replicate JS client may return either a string URL or a ReadableStream
  // wrapper depending on version. Normalize to a string URL.
  let resultUrl: string | null = null;
  if (typeof output === 'string') {
    resultUrl = output;
  } else if (Array.isArray(output) && output.length > 0) {
    const first = output[0];
    if (typeof first === 'string') {
      resultUrl = first;
    } else if (first && typeof (first as { url?: () => URL }).url === 'function') {
      try {
        resultUrl = (first as { url: () => URL }).url().toString();
      } catch {
        // ignore
      }
    }
  } else if (output && typeof (output as { url?: () => URL }).url === 'function') {
    try {
      resultUrl = (output as { url: () => URL }).url().toString();
    } catch {
      // ignore
    }
  }

  if (!resultUrl) {
    throw new Error('Essayage virtuel : aucune image générée');
  }

  // Persist the generated image to Cloudinary so the temporary Replicate URL
  // (which expires after ~1h) doesn't break our cached `try_on_url` field.
  const cloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'placeholder';

  if (cloudinaryConfigured) {
    try {
      const uploaded = await cloudinary.uploader.upload(resultUrl, {
        folder: 'lien/tryon',
        resource_type: 'image',
      });
      return uploaded.secure_url;
    } catch (err) {
      console.error('Cloudinary tryon upload error:', err);
      // Fall back to the raw Replicate URL — it works for now, just not
      // permanently. Better than a 500 to the user.
      return resultUrl;
    }
  }

  return resultUrl;
}

/**
 * analyzeStyle — returns the "Style DNA card" shape used by the profile page.
 * Returns:
 *   { dominant_style, style_tags, color_palette, strengths, suggestions, capsule_score }
 */
export async function analyzeStyle(
  wardrobeStats: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Analyze this wardrobe data and return a style DNA card as JSON.
Wardrobe stats: ${JSON.stringify(wardrobeStats)}

Return ONLY valid JSON with no additional text or markdown:
{
  "dominant_style": "string (e.g. Minimaliste, Bohème, Classic, Streetwear, Chic Casual)",
  "style_tags": ["string (3-6 short style tags in French, e.g. 'épuré', 'intemporel', 'polyvalent')"],
  "color_palette": ["string (top 4 colors in French, e.g. 'Noir', 'Blanc', 'Camel', 'Bleu marine')"],
  "strengths": ["string (2-4 wardrobe strengths in French, e.g. 'Bonne base de basiques', 'Palette cohérente')"],
  "suggestions": ["string (2-4 improvement suggestions in French, e.g. 'Ajouter une pièce couleur')"],
  "capsule_score": 0
}
capsule_score is 0-100 reflecting how close the wardrobe is to a cohesive capsule wardrobe.`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI');
  }

  const raw = textBlock.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(raw);
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
