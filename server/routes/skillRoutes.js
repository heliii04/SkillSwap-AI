import express from "express";

import {
    createTeachSkill,
    deleteTeachSkill,
    getMyTeachSkills,
    updateTeachSkill,

    createLearnSkill,
    deleteLearnSkill,
    getMyLearnSkills,
    updateLearnSkill,
    getBrowseSkills,
} from "../controllers/skillController.js";

import { requireAuth, optionalAuth } from "../middleware/authMiddleware.js";

import { validateRequest } from "../middleware/validate.middleware.js";

import {
    createTeachSkillSchema,
    updateTeachSkillSchema,

    createLearnSkillSchema,
    updateLearnSkillSchema,

    skillIdParamSchema,
} from "../validators/skill.validator.js";

const router = express.Router();

router.get("/browse", optionalAuth, getBrowseSkills);

router.use(requireAuth);

/*
|--------------------------------------------------------------------------
| Teaching skills
|--------------------------------------------------------------------------
*/



router.get(
    "/teach",
    getMyTeachSkills
);

router.post(
    "/teach",
    validateRequest(
        createTeachSkillSchema
    ),
    createTeachSkill
);

router.patch(
    "/teach/:skillId",
    validateRequest(
        updateTeachSkillSchema
    ),
    updateTeachSkill
);

router.delete(
    "/teach/:skillId",
    validateRequest(
        skillIdParamSchema
    ),
    deleteTeachSkill
);

/*
|--------------------------------------------------------------------------
| Learning skills
|--------------------------------------------------------------------------
*/

router.get(
    "/learn",
    getMyLearnSkills
);

router.post(
    "/learn",
    validateRequest(
        createLearnSkillSchema
    ),
    createLearnSkill
);

router.patch(
    "/learn/:skillId",
    validateRequest(
        updateLearnSkillSchema
    ),
    updateLearnSkill
);

router.delete(
    "/learn/:skillId",
    validateRequest(
        skillIdParamSchema
    ),
    deleteLearnSkill
);

export default router;