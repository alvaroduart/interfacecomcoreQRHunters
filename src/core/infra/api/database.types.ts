// Tipos do banco de dados Supabase
export interface Database {
  public: {
    Tables: {
      qrcodes: {
        Row: {
          id: string;
          code: string;
          location_name: string;
          latitude: number;
          longitude: number;
          description: string | null;
          question_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          location_name: string;
          latitude: number;
          longitude: number;
          description?: string | null;
          question_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          location_name?: string;
          latitude?: number;
          longitude?: number;
          description?: string | null;
          question_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          question_id: string;
          text: string;
          is_correct: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          text: string;
          is_correct: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          text?: string;
          is_correct?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      validations: {
        Row: {
          id: string;
          user_id: string;
          qrcode_id: string;
          answer_id: string;
          user_latitude: number;
          user_longitude: number;
          distance_meters: number;
          status: 'acertou' | 'errou';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          qrcode_id: string;
          answer_id: string;
          user_latitude: number;
          user_longitude: number;
          distance_meters: number;
          status: 'acertou' | 'errou';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          qrcode_id?: string;
          answer_id?: string;
          user_latitude?: number;
          user_longitude?: number;
          distance_meters?: number;
          status?: 'acertou' | 'errou';
          created_at?: string;
        };
      };
    };
  };
}
