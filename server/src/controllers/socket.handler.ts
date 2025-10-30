import { Socket, Server } from "socket.io";
import { trimjobs } from "../Queue/queue"
import logger from "../utils/logger";

const MAX_GLOBAL_TRIM_MINUTES = 15;
const MAX_EXPRESS_LANE_SECONDS = 300;

export const handlesocketevents = (io: Server) => {

    io.on("connection", (socket) => {

        const user = (socket.request as any).user;

        if (!user) {
            logger.warn(`Unauthorized socket connection attempt rejected: ${socket.id}`);
            socket.emit('auth-error', { message: 'Authentication required.' });
            socket.disconnect(true);
            return;
        }

        logger.info("new user connected");

        socket.on("start-trim", async (jobdata:
            {
                url: string;
                formatId: string;
                startTime: number;
                endTime: number;
            }) => {


            logger.info(`Received 'start-trim' job from ${socket.id}`);
            try {
                const { url, formatId, startTime, endTime } = jobdata;
                const duration = endTime - startTime;

                if (duration > (MAX_GLOBAL_TRIM_MINUTES * 60)) {
                    logger.warn(`Job from ${socket.id} rejected: Trim duration (${duration}s) exceeds global limit.`);
                    socket.emit('job-failed', {
                        error: `Trim duration is too long. Clips must be ${MAX_GLOBAL_TRIM_MINUTES} minutes or less.`
                    });
                    return;
                }

                const jobPayload = { ...jobdata, socketId: socket.id };

                if (duration <= MAX_EXPRESS_LANE_SECONDS) {
                    const job = await trimjobs.add('trim-job', jobPayload, {
                        priority: 1
                    });
                    logger.info(`Job ${job.id} (High Priority) added to queue for ${socket.id}`);
                    socket.emit('job-queued', { jobId: job.id, priority: 'high' });

                } else {

                    const job = await trimjobs.add('trim-job', jobPayload, {
                        priority: 2
                    });
                    logger.info(`Job ${job.id} (Low Priority) added to queue for ${socket.id}`);
                    socket.emit('job-queued', { jobId: job.id, priority: 'low' });
                }


            }
            catch (err: any) {
                logger.error(`Error processing 'start-trim' for ${socket.id}:`, err);
                socket.emit('job-failed', {
                    error: 'An unexpected error occurred on the server.'
                });
            }


        });
        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.id}`);
        });
    });

}