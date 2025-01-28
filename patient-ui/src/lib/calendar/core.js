export function getToday() {
    const current = new Date();
    return new Date(current.setDate(current.getDate()));
}

export function getThreeDaysAhead(today) {
    const daysOfWeek = [];

    for (let i = 0; i < 4; i++) {
        const weekDay = new Date(today);
        weekDay.setDate(today.getDate() + i);
        daysOfWeek.push(weekDay.toISOString().split("T")[0]);
    }

    return daysOfWeek;
}
