import { fakerSV as faker } from '../utils/faker-9.3.0.js';

export function generateClinicMockData() {
    return {
        name: faker.company.name(),
        description: faker.lorem.words(), 
        address: {
            street: faker.location.streetAddress(),
            city: 'Göteborg',
            postal_code: faker.location.zipCode(),
            country: 'Sverige',
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude()
        },
        contact: {
            email: faker.internet.email(),
            phone_number: faker.phone.number()
        }
    };
}