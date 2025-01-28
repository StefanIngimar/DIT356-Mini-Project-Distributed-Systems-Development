import { fakerSV as faker } from '../utils/faker-9.3.0.js';
import { randomIntBetween } from '../utils/k6-utils-1.2.0.js';

export function generateDentistMockData() {
    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        specialization: 'Dentist',
        years_of_experiance: randomIntBetween(1, 25),
        contact: {
            email: faker.internet.email(),
            phone_number: faker.phone.number()
        }
    };
}