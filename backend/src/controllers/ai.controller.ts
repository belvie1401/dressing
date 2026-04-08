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

    const tags = await aiService.scanClothing(image_base64);
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de l\'analyse IA' });
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
