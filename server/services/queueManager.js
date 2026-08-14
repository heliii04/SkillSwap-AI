import logger from "../utils/logger.js";
import { sendVerificationOtpEmail } from "./email.service.js";
import { sendEmail } from "../utils/sendEmail.js";

/*
|--------------------------------------------------------------------------
| Background Task Queue Manager
|--------------------------------------------------------------------------
|
| Offloads non-blocking asynchronous jobs (such as OTP emails, support emails,
| and Web Push notifications) from the Express HTTP request lifecycle.
| Provides retry logic with exponential backoff, worker concurrency limit,
| stats tracking, and clean process shutdown.
|
*/

export const JOB_TYPES = {
    SEND_OTP_EMAIL: "SEND_OTP_EMAIL",
    SEND_CONTACT_EMAIL: "SEND_CONTACT_EMAIL",
    SEND_WEB_PUSH_NOTIFICATION: "SEND_WEB_PUSH_NOTIFICATION",
};

class QueueManager {
    constructor() {
        this.queue = [];
        this.activeWorkers = 0;
        this.maxConcurrency = 5;
        this.maxRetries = 3;
        this.isProcessing = false;
        this.metrics = {
            totalEnqueued: 0,
            totalCompleted: 0,
            totalFailed: 0,
            totalRetried: 0,
        };
    }

    /**
     * Enqueue a background job for asynchronous execution
     * @param {string} type - Job type from JOB_TYPES
     * @param {object} payload - Job payload data
     * @param {object} options - Custom options (priority, retries)
     */
    enqueue(type, payload, options = {}) {
        const job = {
            id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            type,
            payload,
            retries: 0,
            maxRetries: options.maxRetries || this.maxRetries,
            enqueuedAt: new Date(),
        };

        this.queue.push(job);
        this.metrics.totalEnqueued += 1;

        console.log(`📥 [QUEUE ENQUEUED] Job ${job.id} (${type}) added to background queue. (Queue size: ${this.queue.length})`);

        setImmediate(() => this.processNext());

        return job.id;
    }

    /**
     * Trigger worker execution for pending jobs in the queue
     */
    async processNext() {
        if (this.activeWorkers >= this.maxConcurrency || this.queue.length === 0) {
            return;
        }

        const job = this.queue.shift();
        if (!job) return;

        this.activeWorkers += 1;
        const startTime = Date.now();

        try {
            console.log(`⚙️ [QUEUE PROCESSING] Running job ${job.id} (${job.type}) [Active workers: ${this.activeWorkers}/${this.maxConcurrency}]`);
            
            await this.executeJob(job);

            const duration = Date.now() - startTime;
            this.metrics.totalCompleted += 1;
            console.log(`✅ [QUEUE COMPLETED] Job ${job.id} (${job.type}) finished in ${duration}ms.`);
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ [QUEUE JOB ERROR] Job ${job.id} (${job.type}) failed after ${duration}ms: ${error.message}`);

            if (job.retries < job.maxRetries) {
                job.retries += 1;
                this.metrics.totalRetried += 1;
                const backoffMs = Math.pow(2, job.retries) * 1000; // 2s, 4s, 8s backoff

                console.warn(`🔄 [QUEUE RETRYING] Re-queuing job ${job.id} (${job.type}) attempt ${job.retries}/${job.maxRetries} in ${backoffMs}ms...`);
                
                setTimeout(() => {
                    this.queue.unshift(job); // High priority retry
                    this.processNext();
                }, backoffMs);
            } else {
                this.metrics.totalFailed += 1;
                console.error(`💀 [QUEUE JOB FAILED PERMANENTLY] Job ${job.id} (${job.type}) exhausted max retries (${job.maxRetries}).`);
            }
        } finally {
            this.activeWorkers -= 1;
            setImmediate(() => this.processNext());
        }
    }

    /**
     * Execute the job logic based on job type
     */
    async executeJob(job) {
        const { type, payload } = job;

        switch (type) {
            case JOB_TYPES.SEND_OTP_EMAIL: {
                const { name, email, otp } = payload;
                await sendVerificationOtpEmail({ name, email, otp });
                break;
            }

            case JOB_TYPES.SEND_CONTACT_EMAIL: {
                const { to, subject, html, text, replyTo } = payload;
                await sendEmail({ to, subject, html, text, replyTo });
                break;
            }

            case JOB_TYPES.SEND_WEB_PUSH_NOTIFICATION: {
                const { notificationId } = payload;
                await this.processWebPushNotification(notificationId);
                break;
            }

            default:
                throw new Error(`Unknown background job type: ${type}`);
        }
    }

    /**
     * Internal handler for background Web Push notification dispatching
     */
    async processWebPushNotification(notificationId) {
        const mongoose = (await import("mongoose")).default;
        const Notification = mongoose.models.Notification;
        if (!Notification) return;

        const doc = await Notification.findById(notificationId).populate("recipient");
        if (!doc) return;

        const env = process.env;
        const vapidPublicKey = env.VAPID_PUBLIC_KEY;
        const vapidPrivateKey = env.VAPID_PRIVATE_KEY;
        const vapidMailto = env.VAPID_MAILTO || "mailto:support@skillswap.ai";

        if (!vapidPublicKey || !vapidPrivateKey) {
            return;
        }

        const PushMessSubscription = mongoose.model("PushMessSubscription");
        const recipientId = doc.recipient?._id ? doc.recipient._id : doc.recipient;
        const subscriptions = await PushMessSubscription.find({ user: recipientId });
        if (subscriptions.length === 0) return;

        const webpush = (await import("web-push")).default;
        webpush.setVapidDetails(vapidMailto, vapidPublicKey, vapidPrivateKey);

        const pushPayload = JSON.stringify({
            title: doc.title,
            message: doc.message,
            link: doc.link,
        });

        const promises = subscriptions.map(async (sub) => {
            const pushSub = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth,
                },
            };
            try {
                await webpush.sendNotification(pushSub, pushPayload);
            } catch (err) {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    await PushMessSubscription.deleteOne({ _id: sub._id });
                } else {
                    console.error("Error sending web push to endpoint:", sub.endpoint, err.message);
                }
            }
        });

        await Promise.all(promises);
    }

    /**
     * Get current metrics of the queue
     */
    getMetrics() {
        return {
            pending: this.queue.length,
            activeWorkers: this.activeWorkers,
            maxConcurrency: this.maxConcurrency,
            ...this.metrics,
        };
    }

    /**
     * Gracefully wait for active workers to complete during server shutdown
     */
    async shutdown(timeoutMs = 5000) {
        console.log(`🛑 [QUEUE SHUTDOWN] Draining background queue (${this.queue.length} pending, ${this.activeWorkers} active)...`);
        
        const startTime = Date.now();
        while ((this.activeWorkers > 0 || this.queue.length > 0) && Date.now() - startTime < timeoutMs) {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        console.log(`✅ [QUEUE SHUTDOWN COMPLETE] Final stats:`, this.getMetrics());
    }
}

export const queueManager = new QueueManager();
export default queueManager;
