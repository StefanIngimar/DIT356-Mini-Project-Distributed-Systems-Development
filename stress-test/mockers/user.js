import { fakerSV as faker } from '../utils/faker-9.3.0.js';

export function generateUserMockData() {
    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'patient'
    };
}