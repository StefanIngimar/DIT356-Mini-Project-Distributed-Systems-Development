import {
    createClinics,
    createDentistsForClinic,
    getDentistsPerClinic,
} from "./api.js";
import {
    appointmentBodyGenerator,
    dentistClinicGenerator,
} from "./generators.js";
import { runStressTest } from "./runner.js";
import { SETTINGS } from "./settings.js";

async function main() {
    let total_num_requests = 100;
    let clients = 10;

    process.argv.slice(2).forEach((arg) => {
        const [key, value] = arg.split("=");
        if (key === "--requests") {
            total_num_requests = parseInt(value, 10);
        } else if (key === "--clients") {
            clients = parseInt(value, 10);
        }
    });

    console.log("Creating clinics\n");
    const clinics = await createClinics(SETTINGS.CLINICS_TO_ADD);
    const clinicIds = clinics.map((clinic) => clinic.id);

    console.log("Creating dentists for clinics");
    await createDentistsForClinic(clinics, SETTINGS.DENTISTS_TO_ADD);

    console.log("\nGettings dentists per clinic");
    const dentistsPerClinic = await getDentistsPerClinic(clinicIds);

    const generateAppointment = appointmentBodyGenerator(
        SETTINGS.START_DATE,
        SETTINGS.START_TIME,
        SETTINGS.END_TIME,
        60,
    );
    const generateClinicDentistPair = dentistClinicGenerator(dentistsPerClinic);

    console.log("\nRunning stress test");
    console.log(
        `Total Requests: ${total_num_requests} with clients: ${clients}\n`,
    );
    await runStressTest(
        total_num_requests,
        clients,
        generateAppointment,
        generateClinicDentistPair,
    );
}

main().catch((error) => {
    console.error("Error while running main:", error);
});
