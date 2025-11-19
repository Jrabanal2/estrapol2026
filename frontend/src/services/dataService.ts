// Importaciones de JSON
import topicsData from '../data/topics.json';
import questionsData from '../data/questions.json';

export interface Topic {
  _id: string;
  name: string;
  short_name: string;
}

export interface Question {
  _id: string;
  topic_id: string;
  question_text: string;
  options: string[];
  correct_option: string;
  location?: string;
}

class DataService {
  private topics: Topic[] = topicsData;
  private questions: Question[] = questionsData;

  // Métodos para Topics
  async getTopics(): Promise<Topic[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.topics), 100); // Simular async
    });
  }

  async getTopicById(id: string): Promise<Topic | undefined> {
    return this.topics.find(topic => topic._id === id);
  }

  // Métodos para Questions
  async getQuestions(): Promise<Question[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.questions), 100);
    });
  }

  async getQuestionsByTopic(topicId: string): Promise<Question[]> {
    const topicQuestions = this.questions.filter(question => question.topic_id === topicId);
    return new Promise((resolve) => {
      setTimeout(() => resolve(topicQuestions), 100);
    });
  }

  async getRandomQuestionsByTopic(topicId: string, count: number): Promise<Question[]> {
    const topicQuestions = this.questions.filter(q => q.topic_id === topicId);
    const shuffled = [...topicQuestions].sort(() => 0.5 - Math.random());
    return new Promise((resolve) => {
      setTimeout(() => resolve(shuffled.slice(0, count)), 100);
    });
  }

  async getQuestionsCountByTopic(topicId: string): Promise<number> {
    const count = this.questions.filter(question => question.topic_id === topicId).length;
    return new Promise((resolve) => {
      setTimeout(() => resolve(count), 100);
    });
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    return this.questions.find(question => question._id === id);
  }

  // Método para obtener distribución SIECOPOL
  getSiecopolDistribution() {
    const TOPICS_ORDER = [
      'topic_01', 'topic_02', 'topic_03', 'topic_04', 'topic_05',
      'topic_06', 'topic_07', 'topic_08', 'topic_09', 'topic_10',
      'topic_11', 'topic_12', 'topic_13', 'topic_14', 'topic_15',
      'topic_16', 'topic_17', 'topic_18', 'topic_19', 'topic_20',
      'topic_21', 'topic_22'
    ];

    const QUESTIONS_PER_TOPIC = {
      'topic_01': 7, 'topic_02': 1, 'topic_03': 6, 'topic_04': 7, 'topic_05': 3,
      'topic_06': 8, 'topic_07': 3, 'topic_08': 4, 'topic_09': 3, 'topic_10': 8,
      'topic_11': 11, 'topic_12': 11, 'topic_13': 3, 'topic_14': 3, 'topic_15': 3,
      'topic_16': 3, 'topic_17': 2, 'topic_18': 2, 'topic_19': 3, 'topic_20': 2,
      'topic_21': 5, 'topic_22': 2
    };

    return { TOPICS_ORDER, QUESTIONS_PER_TOPIC };
  }
}

export default new DataService();