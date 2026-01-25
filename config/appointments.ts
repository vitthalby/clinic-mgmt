export const appointmentConfig = {
    slotDurationMinutes: 30,
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    businessDays: [1, 2, 3, 4, 5, 6],
    timeRanges: [
        { start: '10:00', end: '13:00' },
        { start: '18:30', end: '21:30' }
    ],
    // If true, you can only book for tomorrow onwards.
    // If false, you can book for today but only in future blocks.
    allowSameDayFutureBlocks: true,
    minimumLeadTimeMinutes: 240, // 4 hours buffer
}
