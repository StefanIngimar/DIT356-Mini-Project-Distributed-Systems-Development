import { fakerSV as faker } from '../utils/faker-9.3.0.js';

export function generateAppointmentMockData(dentist) {
    const fDate = faker.date.future();
    const tokens = fDate.toISOString().split('T');
    const futureDate = tokens[0];
    const startTime = tokens[1].substring(0, 5);
    const endTime = new Date(fDate.getTime() + (60*60*1000)).toISOString().split('T')[1].substring(0, 5);
 
    return {
        dentistId: dentist.id,
        clinicId: dentist.clinicId,
        date: futureDate,
        start_time: startTime,
        end_time: endTime,
        status: 'FREE',
    };
}