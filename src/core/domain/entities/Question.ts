export interface Answer {
    id: string;
    text: string;
    isCorrect: boolean;
}

export class Question {
    private constructor(
        readonly id: string,
        readonly text: string,
        readonly answers: Answer[]
    ) {
        if (!text || text.trim().length === 0) {
            throw new Error("Texto da pergunta não pode estar vazio");
        }
        if (answers.length !== 4) {
            throw new Error("A pergunta deve ter exatamente 4 respostas");
        }
        const correctAnswers = answers.filter(a => a.isCorrect);
        if (correctAnswers.length !== 1) {
            throw new Error("A pergunta deve ter exatamente 1 resposta correta");
        }
    }

    static create(
        id: string,
        text: string,
        answers: Answer[]
    ): Question {
        return new Question(id, text, answers);
    }

    isCorrectAnswer(answerId: string): boolean {
        const answer = this.answers.find(a => a.id === answerId);
        return answer?.isCorrect ?? false;
    }

    getCorrectAnswer(): Answer | undefined {
        return this.answers.find(a => a.isCorrect);
    }
}
