import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true }
);

const weekSchema = new mongoose.Schema(
    {
        weekNumber: {
            type: Number,
            required: true,
        },
        focus: {
            type: String,
            required: true,
            trim: true,
        },
        tasks: [taskSchema],
    },
    { _id: true }
);

const learningRoadmapSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        skill: {
            type: String,
            required: true,
            trim: true,
        },
        currentLevel: {
            type: String,
            required: true,
        },
        targetLevel: {
            type: String,
            required: true,
        },
        availableTime: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        learningStyle: {
            type: String,
            required: true,
        },
        weeks: [weekSchema],
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const LearningRoadmap = mongoose.model(
    "LearningRoadmap",
    learningRoadmapSchema
);

export default LearningRoadmap;
