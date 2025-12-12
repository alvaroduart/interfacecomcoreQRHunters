import * as SQLite from 'expo-sqlite';

/**
 * Gerenciador do banco de dados SQLite local
 * Espelha a estrutura do Supabase para funcionar como cache offline
 */
export class SQLiteDatabase {
  private static instance: SQLiteDatabase;
  private database: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  public static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = new SQLiteDatabase();
    }
    return SQLiteDatabase.instance;
  }

  /**
   * Inicializa o banco de dados SQLite
   */
  async init(): Promise<void> {
    try {
      console.log('[SQLiteDatabase] Inicializando banco de dados...');
      
      this.database = await SQLite.openDatabaseAsync('qrhunters_cache.db');
      
      await this.createTables();
      
      console.log('[SQLiteDatabase] Banco de dados inicializado com sucesso');
    } catch (error) {
      console.error('[SQLiteDatabase] Erro ao inicializar banco:', error);
      throw error;
    }
  }

  /**
   * Cria as tabelas espelhando o schema do Supabase
   */
  private async createTables(): Promise<void> {
    if (!this.database) {
      throw new Error('Database não inicializado');
    }

    await this.database.execAsync(`
      -- Tabela de perguntas
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de respostas
      CREATE TABLE IF NOT EXISTS answers (
        id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL,
        text TEXT NOT NULL,
        is_correct INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      );

      -- Tabela de QR codes
      CREATE TABLE IF NOT EXISTS qrcodes (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        location_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        description TEXT,
        question_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE RESTRICT
      );

      -- Tabela de validações
      CREATE TABLE IF NOT EXISTS validations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        qrcode_id TEXT NOT NULL,
        answer_id TEXT NOT NULL,
        user_latitude REAL NOT NULL,
        user_longitude REAL NOT NULL,
        distance_meters REAL NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('acertou', 'errou')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (qrcode_id) REFERENCES qrcodes(id) ON DELETE CASCADE,
        FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
      );

      -- Tabela de journeys (jornadas)
      CREATE TABLE IF NOT EXISTS journeys (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de pontos das jornadas
      CREATE TABLE IF NOT EXISTS journey_points (
        id TEXT PRIMARY KEY,
        journey_id TEXT NOT NULL,
        qrcode_id TEXT NOT NULL,
        sequence_order INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE,
        FOREIGN KEY (qrcode_id) REFERENCES qrcodes(id) ON DELETE CASCADE
      );

      -- Tabela de progresso do usuário nas jornadas
      CREATE TABLE IF NOT EXISTS user_journeys (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        journey_id TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('em_progresso', 'concluida')),
        current_point_index INTEGER DEFAULT 0,
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
      );

      -- Índices para melhor performance
      CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
      CREATE INDEX IF NOT EXISTS idx_qrcodes_code ON qrcodes(code);
      CREATE INDEX IF NOT EXISTS idx_qrcodes_question_id ON qrcodes(question_id);
      CREATE INDEX IF NOT EXISTS idx_validations_user_id ON validations(user_id);
      CREATE INDEX IF NOT EXISTS idx_validations_qrcode_id ON validations(qrcode_id);
      CREATE INDEX IF NOT EXISTS idx_journey_points_journey_id ON journey_points(journey_id);
      CREATE INDEX IF NOT EXISTS idx_user_journeys_user_id ON user_journeys(user_id);
    `);

    console.log('[SQLiteDatabase] Tabelas criadas com sucesso');
  }

  /**
   * Retorna a instância do banco de dados
   */
  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.database) {
      throw new Error('Database não inicializado. Chame init() primeiro.');
    }
    return this.database;
  }

  /**
   * Limpa todas as tabelas (útil para testes)
   */
  async clearAll(): Promise<void> {
    if (!this.database) {
      throw new Error('Database não inicializado');
    }

    await this.database.execAsync(`
      DELETE FROM user_journeys;
      DELETE FROM journey_points;
      DELETE FROM journeys;
      DELETE FROM validations;
      DELETE FROM qrcodes;
      DELETE FROM answers;
      DELETE FROM questions;
    `);

    console.log('[SQLiteDatabase] Todas as tabelas foram limpas');
  }
}
