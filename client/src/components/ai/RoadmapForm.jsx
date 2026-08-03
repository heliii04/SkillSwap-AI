import { useState } from "react";
import { generateRoadmap } from "../../api/aiApi";
import { FiCpu } from "react-icons/fi";
import { toast } from "react-toastify";

export default function RoadmapForm({ onRoadmapGenerated }) {
    const [formData, setFormData] = useState({
        skill: "",
        currentLevel: "Beginner",
        targetLevel: "Job-ready",
        availableTime: "1 hour daily",
        duration: "4 weeks",
        learningStyle: "Project based"
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.skill.trim()) {
            toast.error("Please enter a skill to learn");
            return;
        }

        setIsLoading(true);
        try {
            const res = await generateRoadmap(formData);
            if (res.success && res.data?.roadmap) {
                toast.success("Roadmap generated successfully!");
                onRoadmapGenerated(res.data.roadmap);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to generate roadmap");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 flex-grow h-full min-h-0 flex flex-col">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">What do you want to learn?</label>
                    <input
                        type="text"
                        name="skill"
                        value={formData.skill}
                        onChange={handleChange}
                        placeholder="e.g. React, Python, Data Science"
                        className="w-full bg-[#111111] text-white rounded-md px-4 py-2 focus:outline-none border border-white/10 focus:ring-1 focus:ring-orange-500"
                        disabled={isLoading}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Current Level</label>
                        <select name="currentLevel" value={formData.currentLevel} onChange={handleChange} className="w-full bg-[#111111] text-white rounded-md px-4 py-2 focus:outline-none border border-white/10" disabled={isLoading}>
                            <option>Absolute Beginner</option>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Target Level</label>
                        <select name="targetLevel" value={formData.targetLevel} onChange={handleChange} className="w-full bg-[#111111] text-white rounded-md px-4 py-2 focus:outline-none border border-white/10" disabled={isLoading}>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                            <option>Job-ready</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Available Time</label>
                        <input type="text" name="availableTime" value={formData.availableTime} onChange={handleChange} className="w-full bg-[#111111] text-white rounded-md px-4 py-2 focus:outline-none border border-white/10" disabled={isLoading} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Duration</label>
                        <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="w-full bg-[#111111] text-white rounded-md px-4 py-2 focus:outline-none border border-white/10" disabled={isLoading} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Learning Style</label>
                    <select name="learningStyle" value={formData.learningStyle} onChange={handleChange} className="w-full bg-[#111111] text-white rounded-md px-4 py-2 focus:outline-none border border-white/10" disabled={isLoading}>
                        <option>Project based</option>
                        <option>Theory first</option>
                        <option>Interactive coding</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 mt-4 flex justify-center items-center gap-2"
                >
                    {isLoading ? "Generating..." : "Generate Roadmap"}
                </button>
            </form>
        </div>
    );
}

