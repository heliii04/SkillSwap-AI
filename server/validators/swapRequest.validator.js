import { z } from "zod";

const objectIdSchema = z
    .string({
        required_error: "ID is required",
    })
    .trim()
    .regex(
        /^[a-f\d]{24}$/i,
        "Invalid MongoDB ObjectId"
    );

export const createSwapRequestSchema =
    z.object({
        body: z
            .object({
                receiverId:
                    objectIdSchema,

                senderSkillId:
                    objectIdSchema,

                receiverSkillId:
                    objectIdSchema,

                message: z
                    .string()
                    .trim()
                    .max(
                        500,
                        "Message cannot exceed 500 characters"
                    )
                    .optional()
                    .default(""),
            })
            .strict(),

        params: z
            .object({})
            .optional(),

        query: z
            .object({})
            .optional(),
    });

export const swapRequestIdParamSchema =
    z.object({
        params: z
            .object({
                requestId:
                    objectIdSchema,
            })
            .strict(),

        body: z
            .object({})
            .optional(),

        query: z
            .object({})
            .optional(),
    });

export const getSwapRequestsSchema =
    z.object({
        query: z
            .object({
                status: z
                    .enum([
                        "pending",
                        "accepted",
                        "rejected",
                        "cancelled",
                        "expired",
                    ])
                    .optional(),

                page: z
                    .coerce
                    .number()
                    .int()
                    .min(1)
                    .default(1),

                limit: z
                    .coerce
                    .number()
                    .int()
                    .min(1)
                    .max(50)
                    .default(10),
            })
            .strict(),

        body: z
            .object({})
            .optional(),

        params: z
            .object({})
            .optional(),
    });
