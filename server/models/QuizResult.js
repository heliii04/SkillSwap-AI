import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        topic: {
            type: String,
            required: true,
            trim: true,
        },
        score: {
            type: Number,
            required: true,
        },
        totalQuestions: {
            type: Number,
            required: true,
        },
        percentage: {
            type: Number,
            required: true,
        },
        quizData: [
            {
                question: String,
                options: [String],
                correctAnswer: String,
                explanation: String,
            },
        ],
        userAnswers: {
            type: Map,
            of: String,
            default: {},
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

quizResultSchema.index({ user: 1, createdAt: -1 });

const QuizResult =
    mongoose.models.QuizResult ||
    mongoose.model("QuizResult", quizResultSchema);

export default QuizResult;
