import { faker } from "@faker-js/faker";

export function generateClinicMockData() {
    return {
        name: faker.company.name(),
        description: faker.lorem.words(),
        address: {
            street: faker.location.street(),
            city: "Gothenburg",
            postal_code: faker.location.zipCode(),
            country: "Sweden",
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
        },
        contact: {
            email: faker.internet.email(),
            phone_number: faker.phone.number(),
        },
    };
}

export function generateDentistMockData() {
    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        password: "admin",
        specialization: "Dentist",
        years_of_experiance: 5,
        contact: {
            email: faker.internet.email(),
            phone_number: faker.phone.number(),
        },
    };
}

/*
This will generate appointment body following the constraints
that there can only be one appointment for a single clininc and dentist pair
at the same date, start time, and end time.

By specifying the startTime and endTime it is possible to dictate how many
appointments can be created during a single day.
*/
export function* appointmentBodyGenerator(
    startDate,
    startTime,
    endTime,
    appointmentDuration,
) {
    const dentistClinicConstraints = {};
    let currentDate = new Date(`${startDate}T${startTime}:00-00:00`);

    while (true) {
        const payload = (dentistId, clinicId) => {
            const dentistClinicConstraint = `${dentistId}:${clinicId}`;
            if (!dentistClinicConstraints[dentistClinicConstraint]) {
                dentistClinicConstraints[dentistClinicConstraint] = [];
            }

            let isUnique = false;
            let appointmentBody;
            while (!isUnique) {
                const endDateTime = new Date(
                    `${currentDate.toISOString().split("T")[0]}T${endTime}:00-00:00`,
                );
                if (currentDate >= endDateTime) {
                    currentDate.setDate(currentDate.getDate() + 1);
                    const timeSplit = startTime.split(":");
                    currentDate.setUTCHours(timeSplit[0], timeSplit[1]);
                }

                const appointmentStartTime = currentDate;
                const appointmentEndTime = new Date(
                    currentDate.getTime() + appointmentDuration * 60000,
                );

                appointmentBody = {
                    dentistId,
                    clinicId,
                    date: appointmentStartTime.toISOString().split("T")[0],
                    start_time: appointmentStartTime
                        .toISOString()
                        .split("T")[1]
                        .split(".")[0],
                    end_time: appointmentEndTime
                        .toISOString()
                        .split("T")[1]
                        .split(".")[0],
                    status: "FREE",
                };

                const exists = dentistClinicConstraints[
                    dentistClinicConstraint
                ].some((entry) => {
                    entry.date == appointmentBody.date &&
                        entry.start_time == appointmentBody.start_time &&
                        entry.end_time == appointmentBody.end_time;
                });

                currentDate = appointmentEndTime;
                if (!exists) {
                    dentistClinicConstraints[dentistClinicConstraint].push(
                        appointmentBody,
                    );
                    isUnique = true;
                }
            }

            return appointmentBody;
        };

        yield payload;
    }
}

/*
This expects data in the following format where keys are clinic IDs
and values are lists of dentist data.

const dentistsPerClinic = {
    aabb: [
        { id: "dentist_aa" },
        { id: "dentist_bb" },
        { id: "dentist_cc" },
    ],
    ccdd: [
        { id: "dentist_dd" },
        { id: "dentist_ee" },
        { id: "dentist_ff" },
    ],
};
*/
export function* dentistClinicGenerator(dentistsPerClinic) {
    const clinicIds = Object.keys(dentistsPerClinic);

    while (true) {
        const payload = () => {
            let randomDentist = null;
            let clinicId = null;
            // Do this to make sure that the selected random dentists exists
            while (!randomDentist) {
                const randomClinicIdx = Math.floor(
                    Math.random() * clinicIds.length,
                );
                clinicId = clinicIds[randomClinicIdx];
                const clinicDentists = dentistsPerClinic[clinicId];

                const randomDentistIdx = Math.floor(
                    Math.random() * clinicDentists.length,
                );
                randomDentist = clinicDentists[randomDentistIdx];
            }

            return {
                clinicId: clinicId,
                dentistId: randomDentist.id,
            };
        };

        yield payload();
    }
}
