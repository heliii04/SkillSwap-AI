import express from "express";

import {
    acceptSwapRequest,
    cancelSwapRequest,
    createSwapRequest,
    getReceivedSwapRequests,
    getSentSwapRequests,
    getSwapRequestById,
    rejectSwapRequest,
} from "../controllers/swapRequestController.js";

import {
    createSwapRequestSchema,
    getSwapRequestsSchema,
    swapRequestIdParamSchema,
} from "../validators/swapRequest.validator.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { swapRequestLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.use(requireAuth);

/*
|--------------------------------------------------------------------------
| Create request
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    swapRequestLimiter,
    validateRequest(
        createSwapRequestSchema
    ),
    createSwapRequest
);

/*
|--------------------------------------------------------------------------
| Request lists
|--------------------------------------------------------------------------
*/

router.get(
    "/sent",
    validateRequest(
        getSwapRequestsSchema
    ),
    getSentSwapRequests
);

router.get(
    "/received",
    validateRequest(
        getSwapRequestsSchema
    ),
    getReceivedSwapRequests
);

/*
|--------------------------------------------------------------------------
| Single request
|--------------------------------------------------------------------------
*/

router.get(
    "/:requestId",
    validateRequest(
        swapRequestIdParamSchema
    ),
    getSwapRequestById
);

/*
|--------------------------------------------------------------------------
| Request actions
|--------------------------------------------------------------------------
*/

router.patch(
    "/:requestId/accept",
    validateRequest(
        swapRequestIdParamSchema
    ),
    acceptSwapRequest
);

router.patch(
    "/:requestId/reject",
    validateRequest(
        swapRequestIdParamSchema
    ),
    rejectSwapRequest
);

router.patch(
    "/:requestId/cancel",
    validateRequest(
        swapRequestIdParamSchema
    ),
    cancelSwapRequest
);

export default router;