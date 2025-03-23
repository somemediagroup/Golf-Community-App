import supabase from "@/lib/supabase";

interface ScoreCard {
  id?: string;
  user_id: string;
  course_id: string;
  date_played: string;
  score: number;
  tee_color: string;
  holes_played: string;
  notes?: string;
  created_at?: string;
}

interface DetailedScoreCard extends ScoreCard {
  hole_scores?: HoleScore[];
}

interface HoleScore {
  hole_number: number;
  score: number;
  putts: number;
  fairway_hit: boolean | null;
  green_in_regulation: boolean;
  penalty_strokes: number;
}

interface ScoreStats {
  totalScore: number;
  scoreVsPar: string | number;
  totalPutts: number;
  fairwaysHit: string;
  fairwayPercentage: number;
  greensInRegulation: number;
  girPercentage: number;
  penalties: number;
  puttsPerHole: string;
}

const scoresAPI = {
  /**
   * Submit a basic score card
   */
  async submitScoreCard(scoreCard: ScoreCard): Promise<{ data: ScoreCard | null; error: any }> {
    try {
      // Format the data for insertion
      const scoreData = {
        user_id: scoreCard.user_id,
        course_id: scoreCard.course_id,
        date_played: scoreCard.date_played,
        score: scoreCard.score,
        tee_color: scoreCard.tee_color,
        holes_played: scoreCard.holes_played,
        notes: scoreCard.notes || null,
      };

      // Insert into the score_cards table
      const { data, error } = await supabase
        .from("score_cards")
        .insert(scoreData)
        .select()
        .single();

      if (error) {
        console.error("Error submitting score card:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Exception in submitScoreCard:", error);
      return { data: null, error };
    }
  },

  /**
   * Submit a detailed hole-by-hole score card
   */
  async submitDetailedScoreCard(
    scoreCard: DetailedScoreCard,
    stats: ScoreStats
  ): Promise<{ data: any | null; error: any }> {
    try {
      // Start a Supabase transaction
      const { data: scoreCardData, error: scoreCardError } = await supabase
        .from("score_cards")
        .insert({
          user_id: scoreCard.user_id,
          course_id: scoreCard.course_id,
          date_played: scoreCard.date_played,
          score: stats.totalScore, // Use calculated total score
          tee_color: scoreCard.tee_color,
          holes_played: scoreCard.holes_played,
          notes: scoreCard.notes || null,
          stats: stats, // Store statistics as JSON
        })
        .select()
        .single();

      if (scoreCardError) {
        console.error("Error submitting score card:", scoreCardError);
        return { data: null, error: scoreCardError };
      }

      // If we have hole-by-hole data, insert it
      if (scoreCard.hole_scores && scoreCard.hole_scores.length > 0) {
        const holeScores = scoreCard.hole_scores.map((holeScore) => ({
          score_card_id: scoreCardData.id,
          hole_number: holeScore.hole_number,
          score: holeScore.score,
          putts: holeScore.putts,
          fairway_hit: holeScore.fairway_hit,
          green_in_regulation: holeScore.green_in_regulation,
          penalty_strokes: holeScore.penalty_strokes,
        }));

        const { error: holeScoreError } = await supabase
          .from("hole_scores")
          .insert(holeScores);

        if (holeScoreError) {
          console.error("Error submitting hole scores:", holeScoreError);
          return { data: scoreCardData, error: holeScoreError };
        }
      }

      return { data: scoreCardData, error: null };
    } catch (error) {
      console.error("Exception in submitDetailedScoreCard:", error);
      return { data: null, error };
    }
  },

  /**
   * Get all score cards for a user
   */
  async getUserScoreCards(userId: string): Promise<{ data: ScoreCard[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("score_cards")
        .select("*")
        .eq("user_id", userId)
        .order("date_played", { ascending: false });

      if (error) {
        console.error("Error fetching user score cards:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Exception in getUserScoreCards:", error);
      return { data: null, error };
    }
  },

  /**
   * Get a specific score card with hole-by-hole details
   */
  async getScoreCardDetails(
    scoreCardId: string
  ): Promise<{ data: DetailedScoreCard | null; error: any }> {
    try {
      // Get the score card
      const { data: scoreCard, error: scoreCardError } = await supabase
        .from("score_cards")
        .select("*")
        .eq("id", scoreCardId)
        .single();

      if (scoreCardError) {
        console.error("Error fetching score card:", scoreCardError);
        return { data: null, error: scoreCardError };
      }

      // Get the hole scores
      const { data: holeScores, error: holeScoresError } = await supabase
        .from("hole_scores")
        .select("*")
        .eq("score_card_id", scoreCardId)
        .order("hole_number", { ascending: true });

      if (holeScoresError) {
        console.error("Error fetching hole scores:", holeScoresError);
        return { data: scoreCard, error: holeScoresError };
      }

      // Combine the data
      const detailedScoreCard: DetailedScoreCard = {
        ...scoreCard,
        hole_scores: holeScores,
      };

      return { data: detailedScoreCard, error: null };
    } catch (error) {
      console.error("Exception in getScoreCardDetails:", error);
      return { data: null, error };
    }
  },

  /**
   * Delete a score card and its hole scores
   */
  async deleteScoreCard(scoreCardId: string): Promise<{ success: boolean; error: any }> {
    try {
      // First delete related hole scores (assuming foreign key constraint)
      const { error: holeScoresError } = await supabase
        .from("hole_scores")
        .delete()
        .eq("score_card_id", scoreCardId);

      if (holeScoresError) {
        console.error("Error deleting hole scores:", holeScoresError);
        return { success: false, error: holeScoresError };
      }

      // Then delete the score card
      const { error: scoreCardError } = await supabase
        .from("score_cards")
        .delete()
        .eq("id", scoreCardId);

      if (scoreCardError) {
        console.error("Error deleting score card:", scoreCardError);
        return { success: false, error: scoreCardError };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Exception in deleteScoreCard:", error);
      return { success: false, error };
    }
  },
};

export default scoresAPI; 