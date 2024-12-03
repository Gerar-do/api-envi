// infrastructure/services/PerspectiveService.ts
import axios from 'axios';

// Interfaces para la respuesta de la API
interface AttributeScore {
 spanScores: Array<{
   begin: number;
   end: number;
   score: { value: number };
 }>;
 summaryScore: {
   value: number;
 };
}

interface PerspectiveResponse {
 attributeScores: {
   TOXICITY?: AttributeScore;
   SEVERE_TOXICITY?: AttributeScore;
   INSULT?: AttributeScore;
   PROFANITY?: AttributeScore;
   THREAT?: AttributeScore;
 };
}

export class PerspectiveService {
 private readonly API_KEY = 'AIzaSyAhP9S9VhkPYT1U7UgORL8Ro2-eKiKOi9Q';
 private readonly API_URL = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';

 async analyzeComment(text: string) {
   try {
     const response = await axios.post<PerspectiveResponse>(
       `${this.API_URL}?key=${this.API_KEY}`,
       {
         comment: { text },
         languages: ['es'],
         requestedAttributes: {
           TOXICITY: {},
           SEVERE_TOXICITY: {},
           INSULT: {},
           PROFANITY: {},
           THREAT: {}
         }
       }
     );

     return response.data.attributeScores;
   } catch (error) {
     console.error('Error en Perspective API:', error);
     throw error;
   }
 }

 isToxic(scores: PerspectiveResponse['attributeScores']) {
   const THRESHOLD = 0.7;
   
   const checkScore = (attribute: AttributeScore | undefined) => {
       return attribute?.summaryScore?.value ?? 0;
   };

   return (
       checkScore(scores.TOXICITY) > THRESHOLD ||
       checkScore(scores.SEVERE_TOXICITY) > THRESHOLD ||
       checkScore(scores.INSULT) > THRESHOLD ||
       checkScore(scores.PROFANITY) > THRESHOLD ||
       checkScore(scores.THREAT) > THRESHOLD
   );
 }

 // Método adicional para obtener detalles de la toxicidad
 getToxicityDetails(scores: PerspectiveResponse['attributeScores']) {
   return {
     toxicity: scores.TOXICITY?.summaryScore?.value ?? 0,
     severeToxicity: scores.SEVERE_TOXICITY?.summaryScore?.value ?? 0,
     insult: scores.INSULT?.summaryScore?.value ?? 0,
     profanity: scores.PROFANITY?.summaryScore?.value ?? 0,
     threat: scores.THREAT?.summaryScore?.value ?? 0
   };
 }
}