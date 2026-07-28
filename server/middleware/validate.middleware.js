import { ApiError } from "../utils/ApiError.js";

export function validate(schema) {
    return function validationMiddleware(
        req,
        _res,
        next
    ) {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) {
            const errors =
                result.error.issues.map(
                    (issue) => ({
                        field:
                            issue.path
                                .filter(
                                    (part) =>
                                        part !==
                                            "body" &&
                                        part !==
                                            "params" &&
                                        part !==
                                            "query"
                                )
                                .join(".") ||
                            "request",

                        message:
                            issue.message,
                    })
                );

            return next(
                new ApiError(
                    422,
                    "Request validation failed.",
                    errors,
                    "VALIDATION_ERROR"
                )
            );
        }

        if (result.data.body) {
            req.body =
                result.data.body;
        }

        if (result.data.params) {
            req.params =
                result.data.params;
        }

        /*
         * Express 5 me req.query read-only hota hai.
         * Isliye req.query ko directly assign nahi karna.
         *
         * Validated query ko alag property me store karenge.
         */
        req.validatedQuery =
            result.data.query ?? req.query;

        next();
    };
}

export const validateRequest = validate;