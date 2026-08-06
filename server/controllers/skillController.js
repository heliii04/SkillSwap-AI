import Skill from "../models/Skill.js";

const sanitizeTags = (tags = []) => {
    return [
        ...new Set(
            tags
                .map((tag) =>
                    String(tag)
                        .trim()
                        .toLowerCase()
                )
                .filter(Boolean)
        ),
    ];
};

const createNormalizedTitle = (title) => {
    return title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
};

const formatSkill = (skill) => ({
    id: skill._id,
    title: skill.title,
    type: skill.type,
    category: skill.category,

    level: skill.level,
    description: skill.description,

    yearsOfExperience:
        skill.yearsOfExperience,

    teachingMode:
        skill.teachingMode,

    currentLevel:
        skill.currentLevel,

    targetLevel:
        skill.targetLevel,

    learningGoal:
        skill.learningGoal,

    priority:
        skill.priority,

    preferredLearningMode:
        skill.preferredLearningMode,

    availability: {
        days:
            skill.availability?.days ||
            [],

        timeSlot:
            skill.availability
                ?.timeSlot ||
            "flexible",
    },

    tags: skill.tags || [],

    isActive:
        skill.isActive,

    createdAt:
        skill.createdAt,

    updatedAt:
        skill.updatedAt,
});

export const getMyTeachSkills = async (
    req,
    res,
    next
) => {
    try {
        const skills = await Skill.find({
            owner: req.user._id,
            type: "teach",
        }).sort({
            createdAt: -1,
        }).lean();

        return res.status(200).json({
            success: true,
            message:
                "Teaching skills retrieved successfully",
            data: {
                skills:
                    skills.map(formatSkill),
                count: skills.length,
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const createTeachSkill = async (
    req,
    res,
    next
) => {
    try {
        const normalizedTitle =
            createNormalizedTitle(
                req.body.title
            );

        const existingSkill =
            await Skill.findOne({
                owner: req.user._id,
                type: "teach",
                normalizedTitle,
            });

        if (existingSkill) {
            return res.status(409).json({
                success: false,
                message:
                    "You have already added this teaching skill",
            });
        }

        const skill =
            await Skill.create({
                owner: req.user._id,
                type: "teach",

                title:
                    req.body.title.trim(),

                normalizedTitle,

                category:
                    req.body.category,

                level:
                    req.body.level,

                description:
                    req.body.description.trim(),

                yearsOfExperience:
                    req.body
                        .yearsOfExperience,

                teachingMode:
                    req.body.teachingMode,

                availability:
                    req.body.availability,

                tags: sanitizeTags(
                    req.body.tags
                ),

                isActive:
                    req.body.isActive,
            });

        return res.status(201).json({
            success: true,
            message:
                "Teaching skill added successfully",
            data: {
                skill:
                    formatSkill(skill),
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "You have already added this teaching skill",
            });
        }

        return next(error);
    }
};

export const updateTeachSkill = async (
    req,
    res,
    next
) => {
    try {
        const {
            skillId,
        } = req.params;

        const skill =
            await Skill.findOne({
                _id: skillId,
                owner: req.user._id,
                type: "teach",
            });

        if (!skill) {
            return res.status(404).json({
                success: false,
                message:
                    "Teaching skill was not found",
            });
        }

        const normalizedTitle =
            createNormalizedTitle(
                req.body.title
            );

        const duplicateSkill =
            await Skill.findOne({
                owner: req.user._id,
                type: "teach",
                normalizedTitle,
                _id: {
                    $ne: skill._id,
                },
            });

        if (duplicateSkill) {
            return res.status(409).json({
                success: false,
                message:
                    "You already have another teaching skill with this title",
            });
        }

        skill.title =
            req.body.title.trim();

        skill.normalizedTitle =
            normalizedTitle;

        skill.category =
            req.body.category;

        skill.level =
            req.body.level;

        skill.description =
            req.body.description.trim();

        skill.yearsOfExperience =
            req.body.yearsOfExperience;

        skill.teachingMode =
            req.body.teachingMode;

        skill.availability =
            req.body.availability;

        skill.tags = sanitizeTags(
            req.body.tags
        );

        skill.isActive =
            req.body.isActive;

        await skill.save();

        return res.status(200).json({
            success: true,
            message:
                "Teaching skill updated successfully",
            data: {
                skill:
                    formatSkill(skill),
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "You already have another teaching skill with this title",
            });
        }

        return next(error);
    }
};

export const deleteTeachSkill = async (
    req,
    res,
    next
) => {
    try {
        const deletedSkill =
            await Skill.findOneAndDelete({
                _id: req.params.skillId,
                owner: req.user._id,
                type: "teach",
            });

        if (!deletedSkill) {
            return res.status(404).json({
                success: false,
                message:
                    "Teaching skill was not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Teaching skill deleted successfully",
        });
    } catch (error) {
        return next(error);
    }
};

export const getMyLearnSkills = async (
    req,
    res,
    next
) => {
    try {
        const skills = await Skill.find({
            owner: req.user._id,
            type: "learn",
        }).sort({
            priority: -1,
            createdAt: -1,
        }).lean();

        return res.status(200).json({
            success: true,
            message:
                "Learning skills retrieved successfully",
            data: {
                skills:
                    skills.map(formatSkill),

                count:
                    skills.length,
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const createLearnSkill = async (
    req,
    res,
    next
) => {
    try {
        const normalizedTitle =
            createNormalizedTitle(
                req.body.title
            );

        const existingSkill =
            await Skill.findOne({
                owner: req.user._id,
                type: "learn",
                normalizedTitle,
            });

        if (existingSkill) {
            return res.status(409).json({
                success: false,
                message:
                    "You have already added this learning skill",
            });
        }

        const skill =
            await Skill.create({
                owner: req.user._id,
                type: "learn",

                title:
                    req.body.title.trim(),

                normalizedTitle,

                category:
                    req.body.category,

                currentLevel:
                    req.body.currentLevel,

                targetLevel:
                    req.body.targetLevel,

                learningGoal:
                    req.body.learningGoal.trim(),

                priority:
                    req.body.priority,

                preferredLearningMode:
                    req.body
                        .preferredLearningMode,

                availability:
                    req.body.availability,

                tags: sanitizeTags(
                    req.body.tags
                ),

                isActive:
                    req.body.isActive,
            });

        return res.status(201).json({
            success: true,
            message:
                "Learning skill added successfully",
            data: {
                skill:
                    formatSkill(skill),
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "You have already added this learning skill",
            });
        }

        return next(error);
    }
};

export const updateLearnSkill = async (
    req,
    res,
    next
) => {
    try {
        const skill =
            await Skill.findOne({
                _id: req.params.skillId,
                owner: req.user._id,
                type: "learn",
            });

        if (!skill) {
            return res.status(404).json({
                success: false,
                message:
                    "Learning skill was not found",
            });
        }

        const normalizedTitle =
            createNormalizedTitle(
                req.body.title
            );

        const duplicateSkill =
            await Skill.findOne({
                owner: req.user._id,
                type: "learn",
                normalizedTitle,

                _id: {
                    $ne: skill._id,
                },
            });

        if (duplicateSkill) {
            return res.status(409).json({
                success: false,
                message:
                    "You already have another learning skill with this title",
            });
        }

        skill.title =
            req.body.title.trim();

        skill.normalizedTitle =
            normalizedTitle;

        skill.category =
            req.body.category;

        skill.currentLevel =
            req.body.currentLevel;

        skill.targetLevel =
            req.body.targetLevel;

        skill.learningGoal =
            req.body.learningGoal.trim();

        skill.priority =
            req.body.priority;

        skill.preferredLearningMode =
            req.body
                .preferredLearningMode;

        skill.availability =
            req.body.availability;

        skill.tags = sanitizeTags(
            req.body.tags
        );

        skill.isActive =
            req.body.isActive;

        await skill.save();

        return res.status(200).json({
            success: true,
            message:
                "Learning skill updated successfully",
            data: {
                skill:
                    formatSkill(skill),
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "You already have another learning skill with this title",
            });
        }

        return next(error);
    }
};

export const deleteLearnSkill = async (
    req,
    res,
    next
) => {
    try {
        const deletedSkill =
            await Skill.findOneAndDelete({
                _id: req.params.skillId,
                owner: req.user._id,
                type: "learn",
            });

        if (!deletedSkill) {
            return res.status(404).json({
                success: false,
                message:
                    "Learning skill was not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Learning skill deleted successfully",
        });
    } catch (error) {
        return next(error);
    }
};

export const getBrowseSkills = async (req, res, next) => {
    try {
        const query = {
            type: "teach",
            isActive: true,
        };
        if (req.user?._id && req.user._id !== "static_admin_id") {
            query.owner = { $ne: req.user._id };
        }

        const skills = await Skill.find(query).populate("owner", "name avatar location rating reviews");

        console.log("Found teach skills for browse:", skills.length);

        const allLearnSkills = await Skill.find({
            type: "learn",
            isActive: true,
            owner: { $in: skills.map((s) => s.owner?._id).filter(Boolean) }
        }).lean();

        const capitalize = (s) => {
            if (!s) return "";
            return s.charAt(0).toUpperCase() + s.slice(1);
        };

        const formattedSkills = skills.map((skill) => {
            const ownerWants = allLearnSkills
                .filter((s) => s.owner.toString() === skill.owner?._id?.toString())
                .map((s) => s.title)
                .join(", ") || "Anything";

            const teacherName = skill.owner?.name || "Unknown";
            const initials = teacherName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

            return {
                id: skill._id,
                title: skill.title,
                category: capitalize(skill.category) || "Other",
                description: skill.description || "",
                teacher: {
                    name: teacherName,
                    avatar: initials,
                },
                teaches: skill.title,
                wantsToLearn: ownerWants,
                level: capitalize(skill.level) || "Beginner",
                mode: capitalize(skill.teachingMode) || "Online",
                location: skill.owner?.location?.city || "Unknown",
                rating: skill.owner?.rating || 5.0,
                reviews: skill.owner?.reviews || 0,
                learners: Math.floor(Math.random() * 100) + 10,
                availability: capitalize(skill.availability?.timeSlot) || "Flexible",
                tags: skill.tags || [],
                userId: skill.owner?._id,
            };
        });

        return res.status(200).json({
            success: true,
            data: formattedSkills,
        });
    } catch (error) {
        return next(error);
    }
};