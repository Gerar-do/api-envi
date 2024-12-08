// infrastructure/services/BetoAnalysisService.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface BetoLabel {
  label: 'NEG' | 'NEU' | 'POS';
  score: number;
}

export class BetoAnalysisService {
  private readonly API_URL = 'https://api-inference.huggingface.co/models/finiteautomata/beto-sentiment-analysis';
  private readonly API_KEY = process.env.HUGGINGFACE_API_KEY;
  private readonly TOXIC_THRESHOLD = 0.7;

  async analyzeText(text: string): Promise<{
    sentiment: number;
    toxicityScore: number;
  }> {
    if (!this.API_KEY) {
      console.error('Hugging Face API key no configurada');
      return this.getDefaultValues();
    }

    try {
      const response = await axios.post<BetoLabel[][]>(
        this.API_URL,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      if (!this.isValidResponse(response.data)) {
        console.error('Respuesta inválida de BETO:', response.data);
        return this.getDefaultValues();
      }

      // Obtener el resultado con mayor score
      const predictions = response.data[0];
      const result = predictions.reduce((max, current) => 
        current.score > max.score ? current : max
      );
      
      return {
        sentiment: this.mapSentiment(result.label, result.score),
        toxicityScore: this.calculateToxicity(result.label, result.score)
      };

    } catch (error) {
      if (error instanceof Error) {
        console.error('Error en análisis de BETO:', error.message);
      }
      return this.getDefaultValues();
    }
  }

  private isValidResponse(data: any): data is BetoLabel[][] {
    return Array.isArray(data) && 
           Array.isArray(data[0]) && 
           data[0].every(item => 
             typeof item === 'object' &&
             'label' in item &&
             'score' in item &&
             typeof item.score === 'number'
           );
  }

  private mapSentiment(label: string, score: number): number {
    switch (label) {
      case 'POS':
        return score > 0.8 ? 5 : 4;
      case 'NEU':
        return 3;
      case 'NEG':
        return score > 0.8 ? 1 : 2;
      default:
        return 3;
    }
  }

  private calculateToxicity(label: string, score: number): number {
    if (label === 'NEG') {
      return score;
    }
    return 0;
  }

  private getDefaultValues(): { sentiment: number; toxicityScore: number; } {
    return {
      sentiment: 3,
      toxicityScore: 0
    };
  }

  isToxic(toxicityScore: number): boolean {
    return Number(toxicityScore) > this.TOXIC_THRESHOLD;
  }
}