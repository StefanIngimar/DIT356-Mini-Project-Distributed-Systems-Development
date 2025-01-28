export const mockMarkers = [
    {
        id: 1,
        name: "Joe Doe Clinic",
        description: "Joe Doe Clinic - Best clinic",
        clinic_logo:
            "https://marketplace.canva.com/EAE0QFHTdtk/1/0/1600w/canva-blue-modern-dental-teeth-logo-design-template-QF5Likrva4o.jpg",
        contact: {
            id: 1,
            email: "joeDoe@clinic.com",
            phone_number: "11223344",
        },
        address: {
            id: 1,
            street: "Joe Doe Street",
            city: "Gothenburg",
            postal_code: "21345",
            country: "Sweden",
            latitude: 57.70887,
            longitude: 11.97456,
        },
        availability_status: "high",
        dentists: [
            {
                id: 1,
                first_name: "Joe",
                last_name: "Doe",
                specialization: "Best Dentist",
                years_of_experiance: 5,
                image_url:
                    "https://cdn-icons-png.flaticon.com/512/3467/3467830.png",
                contact: {
                    email: "joeDoe@email.com",
                    phone_number: "44332211",
                },
                timeSlots: [
                    {
                        day_of_week: "2024-12-05",
                        start_time: "9:00",
                        end_time: "10:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-12-05",
                        start_time: "10:15",
                        end_time: "11:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-12-05",
                        start_time: "11:15",
                        end_time: "12:00",
                        status: "booked",
                    },
                    {
                        day_of_week: "2024-12-05",
                        start_time: "12:15",
                        end_time: "13:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-12-05",
                        start_time: "13:15",
                        end_time: "14:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-12-05",
                        start_time: "14:15",
                        end_time: "15:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-12-05",
                        start_time: "15:15",
                        end_time: "16:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-12-06",
                        start_time: "9:00",
                        end_time: "10:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-12-07",
                        start_time: "9:00",
                        end_time: "10:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-12-11",
                        start_time: "9:00",
                        end_time: "10:00",
                        status: "free",
                    },
                ],
            },
            {
                id: 2,
                first_name: "Jane",
                last_name: "Doe",
                specialization: "Also A Very Good Dentist",
                years_of_experiance: 7,
                image_url:
                    "https://cdn0.iconfinder.com/data/icons/job-female-version-set-2-flat/128/profession_job_avatar_occupation_female-62-512.png",
                contact: {
                    email: "janeDoe@email.com",
                    phone_number: "55667788",
                },
                timeSlots: [
                    {
                        day_of_week: "2024-11-29",
                        start_time: "9:00",
                        end_time: "10:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-11-29",
                        start_time: "10:15",
                        end_time: "11:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-11-29",
                        start_time: "11:15",
                        end_time: "12:00",
                        status: "booked",
                    },
                    {
                        day_of_week: "2024-11-29",
                        start_time: "12:15",
                        end_time: "13:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-11-29",
                        start_time: "13:15",
                        end_time: "14:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-11-30",
                        start_time: "9:00",
                        end_time: "10:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-11-31",
                        start_time: "9:00",
                        end_time: "10:00",
                        status: "free",
                    },
                    {
                        day_of_week: "2024-12-11",
                        start_time: "9:00",
                        end_time: "10:00",
                        status: "free",
                    },
                ],
            },
        ],
    },
];
