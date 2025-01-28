const apiUrl = 'http://localhost:3000/api/v1';

export const appConfig = {
    baseUrl: apiUrl, 
    usersUrl: `${apiUrl}/users`, 
    clinicsUrl: `${apiUrl}/clinics`,
    appointmentsUrl: `${apiUrl}/appointments`,
    bookingsUrl: `${apiUrl}/bookings`,
    params: {
        headers: {
          'Content-Type': 'application/json',
        },
    },
}