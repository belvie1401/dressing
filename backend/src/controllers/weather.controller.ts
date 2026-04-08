import { Request, Response } from 'express';
import * as weatherService from '../services/weather.service';

export async function getCurrentWeather(req: Request, res: Response): Promise<void> {
  try {
    const { city } = req.query;

    if (!city) {
      res.status(400).json({ success: false, error: 'Ville requise' });
      return;
    }

    const weather = await weatherService.getCurrentWeather(city as string);
    res.json({ success: true, data: weather });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération de la météo' });
  }
}

export async function getForecast(req: Request, res: Response): Promise<void> {
  try {
    const { city } = req.query;

    if (!city) {
      res.status(400).json({ success: false, error: 'Ville requise' });
      return;
    }

    const forecast = await weatherService.getForecast(city as string);
    res.json({ success: true, data: forecast });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des prévisions' });
  }
}
