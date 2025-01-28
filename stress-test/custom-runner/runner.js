import { createAppointment } from "./api.js";
import { calculateMedian } from "./analytics.js";

export async function runStressTest(
    total_number_of_requests,
    clients,
    appointmentGenerator,
    clinicDentistGenerator,
) {
    let successCount = 0;
    let failureCount = 0;
    let responseTimes = [];

    const activePromises = new Set();
    const results = [];
    const delayMs = 50;

    for (let i = 0; i < total_number_of_requests; i++) {
        const { dentistId, clinicId } = clinicDentistGenerator.next().value;

        const promise = createAppointment(
            appointmentGenerator,
            dentistId,
            clinicId,
        )
            .then((result) => {
                results.push(result);
                return result;
            })
            .catch((error) => {
                results.push({ success: false, error });
            });

        activePromises.add(promise);

        if (activePromises.size >= clients) {
            const finishedPromise = await Promise.race(activePromises);
            activePromises.delete(finishedPromise);
        }

        if (i % 5 === 0) {
            console.log(`\tProcessing requests: ${activePromises.size}`);
        }

        // await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    await Promise.all(activePromises);

    results.forEach((result) => {
        if (result.success) {
            responseTimes.push(result.duration);
            successCount += 1;
        } else {
            failureCount += 1;
        }
    });

    const totalResponseTime = responseTimes.reduce(
        (acc, responseTime) => (acc += responseTime),
        0,
    );
    const averageResponseTime =
        responseTimes.length > 0 ? totalResponseTime / responseTimes.length : 0;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    const medianResponseTime = calculateMedian(responseTimes);
    const successRate =
        successCount > 0 ? (successCount / total_number_of_requests) * 100 : 0;

    console.log(`\nTotal Requests: ${total_number_of_requests}`);
    console.log(`Successful Requests: ${successCount}`);
    console.log(`Failed Requests: ${failureCount}`);
    console.log(`Success rate: ${successRate.toFixed(2)}%`);
    console.log(`Average response time: ${averageResponseTime.toFixed(2)} ms`);
    console.log(`Median response time: ${medianResponseTime.toFixed(2)} ms`);
    console.log(`Min response time: ${minResponseTime.toFixed(2)} ms`);
    console.log(`Max response time: ${maxResponseTime.toFixed(2)} ms`);
}
