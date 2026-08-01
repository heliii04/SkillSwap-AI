import express from "express";

import {
    changeMyPassword,
    getMyProfile,
    updateMyProfile,
    getUserProfileById,
    getAllProfiles,
} from "../controllers/profileController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

import { validateRequest } from "../middleware/validate.middleware.js";

import { changePasswordSchema, updateProfileSchema } from "../validators/profile.validator.js";

const router = express.Router();

router.use(requireAuth);

router
    .route("/me")
    .get(getMyProfile)
    .patch(
        validateRequest(
            updateProfileSchema
        ),
        updateMyProfile
    );

    router.patch(
    "/change-password",
    validateRequest(
        changePasswordSchema
    ),
    changeMyPassword
);

router.get("/all", getAllProfiles);

router.get("/user/:id", getUserProfileById);

export default router;