// Personality analysis utilities
import { SpotifyTrack } from './spotify';

export interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface PersonalityInsights {
  traits: PersonalityTraits;
  summary: string;
  strengths: string[];
  preferences: string[];
  compatibilityFactors: string[];
}

// Analyze personality from Spotify tracks
export const analyzeFromTracks = (tracks: SpotifyTrack[]): PersonalityInsights => {
  if (!tracks.length) {
    return getDefaultPersonality();
  }
  
  const features = tracks
    .filter(track => track.audio_features)
    .map(track => track.audio_features!);
  
  if (!features.length) {
    return getDefaultPersonality();
  }
  
  // Calculate average audio features
  const avgFeatures = {
    danceability: features.reduce((sum, f) => sum + f.danceability, 0) / features.length,
    energy: features.reduce((sum, f) => sum + f.energy, 0) / features.length,
    valence: features.reduce((sum, f) => sum + f.valence, 0) / features.length,
    acousticness: features.reduce((sum, f) => sum + f.acousticness, 0) / features.length,
    instrumentalness: features.reduce((sum, f) => sum + f.instrumentalness, 0) / features.length,
    tempo: features.reduce((sum, f) => sum + f.tempo, 0) / features.length
  };
  
  // Map audio features to Big Five personality traits
  const traits: PersonalityTraits = {
    // Openness: variety in music, experimental sounds, complex compositions
    openness: Math.min(1, (avgFeatures.instrumentalness * 0.4 + 
                           (1 - avgFeatures.acousticness) * 0.3 + 
                           (avgFeatures.tempo > 120 ? 0.3 : 0.1))),
    
    // Conscientiousness: structured music, consistent patterns
    conscientiousness: Math.min(1, (avgFeatures.acousticness * 0.4 + 
                                   (avgFeatures.tempo < 140 ? 0.3 : 0.1) + 
                                   (1 - avgFeatures.energy) * 0.3)),
    
    // Extraversion: high energy, danceable, positive music
    extraversion: Math.min(1, (avgFeatures.energy * 0.4 + 
                              avgFeatures.danceability * 0.3 + 
                              avgFeatures.valence * 0.3)),
    
    // Agreeableness: positive, harmonious music
    agreeableness: Math.min(1, (avgFeatures.valence * 0.5 + 
                               avgFeatures.acousticness * 0.3 + 
                               (1 - avgFeatures.energy) * 0.2)),
    
    // Neuroticism: low valence, high energy variability
    neuroticism: Math.min(1, ((1 - avgFeatures.valence) * 0.6 + 
                             avgFeatures.energy * 0.4))
  };
  
  // Generate insights based on traits
  const insights = generateInsights(traits, avgFeatures);
  
  return insights;
};

// Generate personality insights from traits
const generateInsights = (traits: PersonalityTraits, musicFeatures: any): PersonalityInsights => {
  const strengths: string[] = [];
  const preferences: string[] = [];
  const compatibilityFactors: string[] = [];
  
  // Determine strengths based on high traits
  if (traits.openness > 0.7) {
    strengths.push('Creative and open-minded');
    preferences.push('Experimental activities');
    compatibilityFactors.push('Appreciates creativity and new experiences');
  }
  
  if (traits.conscientiousness > 0.7) {
    strengths.push('Organized and reliable');
    preferences.push('Structured activities');
    compatibilityFactors.push('Values planning and consistency');
  }
  
  if (traits.extraversion > 0.7) {
    strengths.push('Outgoing and energetic');
    preferences.push('Social gatherings');
    compatibilityFactors.push('Enjoys group activities and meeting new people');
  }
  
  if (traits.agreeableness > 0.7) {
    strengths.push('Cooperative and empathetic');
    preferences.push('Collaborative activities');
    compatibilityFactors.push('Values harmony and teamwork');
  }
  
  // Add music-specific insights
  if (musicFeatures.danceability > 0.6) {
    preferences.push('Dancing and movement');
    compatibilityFactors.push('Enjoys rhythmic and physical activities');
  }
  
  if (musicFeatures.energy > 0.7) {
    preferences.push('High-energy activities');
    compatibilityFactors.push('Thrives in dynamic environments');
  }
  
  if (musicFeatures.valence > 0.6) {
    strengths.push('Positive and optimistic');
    compatibilityFactors.push('Brings positive energy to groups');
  }
  
  if (musicFeatures.acousticness > 0.5) {
    preferences.push('Intimate and acoustic settings');
    compatibilityFactors.push('Appreciates authentic and organic experiences');
  }
  
  // Generate summary
  const dominantTrait = Object.entries(traits).reduce((a, b) => 
    traits[a[0] as keyof PersonalityTraits] > traits[b[0] as keyof PersonalityTraits] ? a : b
  )[0];
  
  const summary = generateSummary(dominantTrait, traits);
  
  return {
    traits,
    summary,
    strengths: strengths.length ? strengths : ['Adaptable and well-rounded'],
    preferences: preferences.length ? preferences : ['Varied activities'],
    compatibilityFactors: compatibilityFactors.length ? compatibilityFactors : ['Open to different experiences']
  };
};

// Generate personality summary
const generateSummary = (dominantTrait: string, traits: PersonalityTraits): string => {
  const summaries = {
    openness: "You're creative and curious, always seeking new experiences and ideas. Your music taste reflects an appreciation for innovation and artistic expression.",
    conscientiousness: "You're organized and thoughtful, preferring structure and reliability. Your music choices show a preference for well-crafted and timeless pieces.",
    extraversion: "You're outgoing and energetic, thriving in social situations. Your music taste leans toward upbeat and engaging tracks that bring people together.",
    agreeableness: "You're cooperative and empathetic, valuing harmony in relationships. Your music reflects a preference for positive and emotionally resonant content.",
    neuroticism: "You're emotionally sensitive and introspective, with a deep appreciation for music that reflects complex emotions and experiences."
  };
  
  return summaries[dominantTrait as keyof typeof summaries] || 
         "You have a well-balanced personality with diverse interests and preferences.";
};

// Default personality for when no data is available
const getDefaultPersonality = (): PersonalityInsights => {
  return {
    traits: {
      openness: 0.6,
      conscientiousness: 0.6,
      extraversion: 0.6,
      agreeableness: 0.7,
      neuroticism: 0.4
    },
    summary: "You have a balanced and adaptable personality, open to new experiences while maintaining stability in relationships.",
    strengths: ['Adaptable', 'Balanced', 'Open-minded'],
    preferences: ['Varied activities', 'Social interaction', 'Learning experiences'],
    compatibilityFactors: ['Flexible and easy-going', 'Good communication skills', 'Enjoys diverse experiences']
  };
};

// Analyze personality from text (for ChatGPT data)
export const analyzeFromText = (textData: string): PersonalityInsights => {
  // This would analyze text patterns, word choice, topics, etc.
  console.log('Analyzing personality from text data...');
  
  // In a real implementation, this would use NLP to analyze:
  // - Vocabulary complexity (openness)
  // - Sentence structure (conscientiousness) 
  // - Emotional language (neuroticism)
  // - Social references (extraversion)
  // - Cooperative language (agreeableness)
  
  // For now, return default personality insights
  return getDefaultPersonality();
};

// Calculate compatibility between two personality profiles
export const calculateCompatibility = (person1: PersonalityTraits, person2: PersonalityTraits): number => {
  // Calculate similarity across all traits
  const similarities = Object.keys(person1).map(trait => {
    const diff = Math.abs(person1[trait as keyof PersonalityTraits] - person2[trait as keyof PersonalityTraits]);
    return 1 - diff; // Convert difference to similarity
  });
  
  // Weight certain traits more heavily for friendship compatibility
  const weights = {
    openness: 0.2,
    conscientiousness: 0.15,
    extraversion: 0.25,
    agreeableness: 0.3,
    neuroticism: 0.1
  };
  
  const weightedSimilarity = Object.keys(weights).reduce((sum, trait, index) => {
    return sum + (similarities[index] * weights[trait as keyof typeof weights]);
  }, 0);
  
  return Math.max(0, Math.min(1, weightedSimilarity));
};

// Generate compatibility explanation
export const explainCompatibility = (person1: PersonalityTraits, person2: PersonalityTraits): string => {
  const compatibility = calculateCompatibility(person1, person2);
  
  if (compatibility > 0.8) {
    return "You have very similar personalities and are likely to get along great! You share similar approaches to life and social situations.";
  } else if (compatibility > 0.6) {
    return "You have complementary personalities that could work well together. Your differences might actually strengthen your friendship.";
  } else if (compatibility > 0.4) {
    return "You have some personality differences, but with mutual understanding, you could develop a meaningful friendship.";
  } else {
    return "You have quite different personalities, which could lead to interesting perspectives and growth opportunities in your friendship.";
  }
};