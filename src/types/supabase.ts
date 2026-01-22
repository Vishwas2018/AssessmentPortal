// Auto-generated types for Supabase database
// These match the tables created in SUPABASE_SETUP.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          year_level: number | null;
          school_name: string | null;
          parent_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          year_level?: number | null;
          school_name?: string | null;
          parent_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          year_level?: number | null;
          school_name?: string | null;
          parent_email?: string | null;
          updated_at?: string;
        };
      };
      exams: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          exam_type: "NAPLAN" | "ICAS";
          subject: string;
          year_level: number;
          duration_minutes: number;
          total_questions: number;
          difficulty: "Easy" | "Medium" | "Hard" | null;
          is_free: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          exam_type: "NAPLAN" | "ICAS";
          subject: string;
          year_level: number;
          duration_minutes?: number;
          total_questions: number;
          difficulty?: "Easy" | "Medium" | "Hard" | null;
          is_free?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          exam_type?: "NAPLAN" | "ICAS";
          subject?: string;
          year_level?: number;
          duration_minutes?: number;
          total_questions?: number;
          difficulty?: "Easy" | "Medium" | "Hard" | null;
          is_free?: boolean;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          exam_id: string;
          question_number: number;
          question_text: string;
          question_type:
            | "multiple_choice"
            | "true_false"
            | "short_answer"
            | "drag_drop";
          options: Json | null;
          correct_answer: string;
          explanation: string | null;
          points: number;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          question_number: number;
          question_text: string;
          question_type:
            | "multiple_choice"
            | "true_false"
            | "short_answer"
            | "drag_drop";
          options?: Json | null;
          correct_answer: string;
          explanation?: string | null;
          points?: number;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          exam_id?: string;
          question_number?: number;
          question_text?: string;
          question_type?:
            | "multiple_choice"
            | "true_false"
            | "short_answer"
            | "drag_drop";
          options?: Json | null;
          correct_answer?: string;
          explanation?: string | null;
          points?: number;
          image_url?: string | null;
        };
      };
      exam_attempts: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          started_at: string;
          completed_at: string | null;
          time_spent_seconds: number | null;
          score: number | null;
          total_points: number | null;
          percentage: number | null;
          status: "in_progress" | "completed" | "abandoned";
          answers: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          started_at?: string;
          completed_at?: string | null;
          time_spent_seconds?: number | null;
          score?: number | null;
          total_points?: number | null;
          percentage?: number | null;
          status?: "in_progress" | "completed" | "abandoned";
          answers?: Json | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          exam_id?: string;
          completed_at?: string | null;
          time_spent_seconds?: number | null;
          score?: number | null;
          total_points?: number | null;
          percentage?: number | null;
          status?: "in_progress" | "completed" | "abandoned";
          answers?: Json | null;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          exam_type: string;
          total_attempts: number;
          total_questions_answered: number;
          correct_answers: number;
          average_score: number | null;
          best_score: number | null;
          total_time_spent_seconds: number;
          last_activity_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          exam_type: string;
          total_attempts?: number;
          total_questions_answered?: number;
          correct_answers?: number;
          average_score?: number | null;
          best_score?: number | null;
          total_time_spent_seconds?: number;
          last_activity_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          subject?: string;
          exam_type?: string;
          total_attempts?: number;
          total_questions_answered?: number;
          correct_answers?: number;
          average_score?: number | null;
          best_score?: number | null;
          total_time_spent_seconds?: number;
          last_activity_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          category: "streak" | "score" | "completion" | "special" | null;
          requirement_type: string;
          requirement_value: number;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          category?: "streak" | "score" | "completion" | "special" | null;
          requirement_type: string;
          requirement_value: number;
          points?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          icon?: string | null;
          category?: "streak" | "score" | "completion" | "special" | null;
          requirement_type?: string;
          requirement_value?: number;
          points?: number;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: {
          user_id?: string;
          achievement_id?: string;
          earned_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types for common use
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type Exam = Database["public"]["Tables"]["exams"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type ExamAttempt = Database["public"]["Tables"]["exam_attempts"]["Row"];
export type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];
export type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
export type UserAchievement =
  Database["public"]["Tables"]["user_achievements"]["Row"];

// Insert types
export type NewUserProfile =
  Database["public"]["Tables"]["user_profiles"]["Insert"];
export type NewExamAttempt =
  Database["public"]["Tables"]["exam_attempts"]["Insert"];
export type NewUserProgress =
  Database["public"]["Tables"]["user_progress"]["Insert"];

// Update types
export type UpdateUserProfile =
  Database["public"]["Tables"]["user_profiles"]["Update"];
export type UpdateExamAttempt =
  Database["public"]["Tables"]["exam_attempts"]["Update"];
