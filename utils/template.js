
exports.templateUtils = {
    formatTimestamp: (timestamp) => {
        const date = new Date(timestamp);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = ("0" + date.getMinutes()).slice(-2);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Handle midnight (0 hours)
        const formattedDateTime = `${day} ${month}, ${year} ${hours}:${minutes} ${ampm}`;
        return formattedDateTime;
    },
    formatAmount: (number) => {
        number = Number(number) ? number : '0';
        // Convert number to fixed 2 decimal places
        const formattedNumber = Number(number).toFixed(2);

        // Add commas for thousands separator
        const parts = formattedNumber.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        // Combine parts with decimal point
        return "₦" + parts.join(".");
    }
};