import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import * as aiService from '../services/ai.service';

export async function scanClothing(req: Request, res: Response): Promise<void> {
  try {
    const { image_base64 } = req.body;

    if (!image_base64) {
      res.status(400).json({ success: false, error: 'Image requise' });
      return;
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(503).json({
        success: false,
        error: 'AI_NOT_CONFIGURED',
        message:
          "L'analyse IA n'est pas configurée sur ce serveur. Vous pouvez continuer sans l'IA et saisir les informations manuellement.",
      });
      return;
    }

    const tags = await aiService.scanClothing(image_base64);
    res.json({ success: true, data: tags });
  } catch (error) {
    console.error('AI scanClothing error:', error);
    const err = error as { status?: number; message?: string };

    // Map known Anthropic SDK error shapes to actionable user messages
    if (err.status === 401) {
      res.status(503).json({
        success: false,
        error: 'AI_AUTH_FAILED',
        message: "Clé API Anthropic invalide. Contactez l'administrateur.",
      });
      return;
    }
    if (err.status === 429) {
      res.status(429).json({
        success: false,
        error: 'AI_RATE_LIMITED',
        message: "Trop de requêtes vers l'IA. Patientez quelques secondes puis réessayez.",
      });
      return;
    }
    if (err.status === 529 || err.status === 503) {
      res.status(503).json({
        success: false,
        error: 'AI_OVERLOADED',
        message: "Le service IA est surchargé. Réessayez dans un instant.",
      });
      return;
    }
    if (err.message?.includes('Could not process image') || err.message?.includes('image')) {
      res.status(400).json({
        success: false,
        error: 'AI_BAD_IMAGE',
        message: "L'IA n'a pas pu lire cette image. Essayez une photo plus claire ou plus petite.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'AI_FAILED',
      message: err.message || "Erreur lors de l'analyse IA",
    });
  }
}

export async function generateOutfits(req: Request, res: Response): Promise<void> {
  try {
    const { weather, occasion, style_profile } = req.body;

    const wardrobe = await prisma.clothingItem.findMany({
      where: { user_id: req.user!.userId },
    });

    if (wardrobe.length === 0) {
      res.status(400).json({ success: false, error: 'Votre dressing est vide' });
      return;
    }

    const suggestions = await aiService.generateOutfits(
      wardrobe,
      weather,
      occasion,
      style_profile
    );

    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la génération de tenues' });
  }
}

export async function analyzeStyle(req: Request, res: Response): Promise<void> {
  try {
    const wardrobe = await prisma.clothingItem.findMany({
      where: { user_id: req.user!.userId },
    });

    if (wardrobe.length === 0) {
      res.status(400).json({ success: false, error: 'Votre dressing est vide' });
      return;
    }

    const stats = {
      total: wardrobe.length,
      categories: {} as Record<string, number>,
      colors: {} as Record<string, number>,
      occasions: {} as Record<string, number>,
      seasons: {} as Record<string, number>,
      brands: {} as Record<string, number>,
      neverWorn: wardrobe.filter((i) => i.wear_count === 0).length,
    };

    for (const item of wardrobe) {
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
      stats.occasions[item.occasion] = (stats.occasions[item.occasion] || 0) + 1;
      stats.seasons[item.season] = (stats.seasons[item.season] || 0) + 1;
      if (item.brand) stats.brands[item.brand] = (stats.brands[item.brand] || 0) + 1;
      for (const color of item.colors) {
        stats.colors[color] = (stats.colors[color] || 0) + 1;
      }
    }

    const result = await aiService.analyzeStyle(stats);

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { style_profile: result as any },
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('analyzeStyle error:', error);
    res.status(500).json({ success: false, error: "Erreur lors de l'analyse de style" });
  }
}

export async function analyzeStyleDNA(req: Request, res: Response): Promise<void> {
  try {
    const wardrobe = await prisma.clothingItem.findMany({
      where: { user_id: req.user!.userId },
    });

    if (wardrobe.length === 0) {
      res.status(400).json({ success: false, error: 'Votre dressing est vide' });
      return;
    }

    // Build wardrobe stats
    const stats = {
      totalItems: wardrobe.length,
      categories: {} as Record<string, number>,
      colors: {} as Record<string, number>,
      seasons: {} as Record<string, number>,
      occasions: {} as Record<string, number>,
      brands: {} as Record<string, number>,
      avgWearCount: wardrobe.reduce((sum, item) => sum + item.wear_count, 0) / wardrobe.length,
      neverWorn: wardrobe.filter((item) => item.wear_count === 0).length,
    };

    for (const item of wardrobe) {
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
      stats.seasons[item.season] = (stats.seasons[item.season] || 0) + 1;
      stats.occasions[item.occasion] = (stats.occasions[item.occasion] || 0) + 1;
      if (item.brand) {
        stats.brands[item.brand] = (stats.brands[item.brand] || 0) + 1;
      }
      for (const color of item.colors) {
        stats.colors[color] = (stats.colors[color] || 0) + 1;
      }
    }

    const styleDNA = await aiService.analyzeStyleDNA(stats);

    // Save to user profile
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { style_profile: styleDNA as any },
    });

    res.json({ success: true, data: styleDNA });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de l\'analyse de style' });
  }
}
