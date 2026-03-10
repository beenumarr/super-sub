export function formatToThousands(value: number | string, decimals: number = 2): string {
    const num = parseFloat(value as string);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function convetToGB(value: number | string) {
    const gbValue = Math.max(0, Number(value)) / 1024;
    return parseFloat(gbValue.toFixed(1));
}

export function formatDate(dateString: string, minimal = false) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: minimal ? undefined : '2-digit',
        minute: minimal ? undefined : '2-digit',
        hour12: true,
    });
}

export function formatDateForHuman(dateString: string, future = false) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (date.getTime() - now.getTime()) / 1000; // in seconds (future: positive, past: negative)

    if (isNaN(date.getTime())) return '';

    if (future) {
        if (diff > 0) {
            if (diff < 60) {
                return 'in a few seconds';
            } else if (diff < 3600) {
                const mins = Math.floor(diff / 60);
                return `in ${mins} minute${mins !== 1 ? 's' : ''}`;
            } else if (diff < 86400) {
                const hours = Math.floor(diff / 3600);
                return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
            } else if (diff < 2592000) {
                const days = Math.floor(diff / 86400);
                return `in ${days} day${days !== 1 ? 's' : ''}`;
            } else if (diff < 31536000) {
                const months = Math.floor(diff / 2592000);
                return `in ${months} month${months !== 1 ? 's' : ''}`;
            } else {
                const years = Math.floor(diff / 31536000);
                return `in ${years} year${years !== 1 ? 's' : ''}`;
            }
        } else {
            return 'overdue';
        }
    } else {
        const pastDiff = -diff;
        if (pastDiff < 60) {
            return 'just now';
        } else if (pastDiff < 3600) {
            const mins = Math.floor(pastDiff / 60);
            return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
        } else if (pastDiff < 86400) {
            const hours = Math.floor(pastDiff / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (pastDiff < 2592000) {
            const days = Math.floor(pastDiff / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        } else if (pastDiff < 31536000) {
            const months = Math.floor(pastDiff / 2592000);
            return `${months} month${months !== 1 ? 's' : ''} ago`;
        } else {
            const years = Math.floor(pastDiff / 31536000);
            return `${years} year${years !== 1 ? 's' : ''} ago`;
        }
    }
}

export const applyMonnifyCharges = (amount: number, charges: string) => {
    let totalCharge: number = 0;

    if (charges) {
        const charge = charges?.split(' ');

        const chargeType = charge[1];
        const chargeAmount = Number(charge[0]);

        if (chargeType === '%') {
            totalCharge = (amount * chargeAmount) / 100;
        } else if (chargeType === 'N') {
            totalCharge = chargeAmount;
        }
    }

    return totalCharge;
};
