import { appointmentConfig } from "@/config/appointments";

export function getAvailableSlots(dateString: string) {
    if (!dateString) return [];
    // Append time to ensure local date parsing
    const selectedDate = new Date(dateString + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();

    if (!appointmentConfig.businessDays.includes(dayOfWeek)) {
        return [];
    }

    // Check if the selected date is today
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    // Minutes from current time + buffer
    const bufferMinutes = isToday ? (now.getHours() * 60 + now.getMinutes() + (appointmentConfig.minimumLeadTimeMinutes || 0)) : 0;

    const slots: string[] = [];

    appointmentConfig.timeRanges.forEach(range => {
        const rangeStartMinutes = parseTime(range.start);
        const rangeEndMinutes = parseTime(range.end);

        // Start from either the block start or the buffered current time, whichever is later
        let current = Math.max(rangeStartMinutes, bufferMinutes);

        // Align current time to next slot boundary if it was buffered
        if (current > rangeStartMinutes) {
            const offset = (current - rangeStartMinutes) % appointmentConfig.slotDurationMinutes;
            if (offset > 0) {
                current += (appointmentConfig.slotDurationMinutes - offset);
            }
        }

        while (current < rangeEndMinutes) {
            slots.push(formatTime(current));
            current += appointmentConfig.slotDurationMinutes;
        }
    });

    return slots;
}

function parseTime(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatTime(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function isDateDisabled(date: Date) {
    const dayOfWeek = date.getDay();
    if (!appointmentConfig.businessDays.includes(dayOfWeek)) {
        return true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
        return true;
    }

    if (!appointmentConfig.allowSameDayFutureBlocks && date.toDateString() === today.toDateString()) {
        return true;
    }

    // Even if same-day is allowed, if all slots for today are within the lead time buffer, disable today
    if (date.toDateString() === today.toDateString()) {
        const availableToday = getAvailableSlots(date.toISOString().split('T')[0]);
        if (availableToday.length === 0) {
            return true;
        }
    }

    return false;
}

export function getMinDate() {
    const today = new Date();

    if (!appointmentConfig.allowSameDayFutureBlocks) {
        today.setDate(today.getDate() + 1);
    } else {
        // If same-day is allowed, but no slots are available today (due to buffer), set min date to tomorrow
        const availableToday = getAvailableSlots(today.toISOString().split('T')[0]);
        if (availableToday.length === 0) {
            today.setDate(today.getDate() + 1);
        }
    }

    return today.toISOString().split('T')[0];
}
