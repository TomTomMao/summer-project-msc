// the constant from： JavaScript JS month names arrays. (n.d.). Gist. Retrieved 7 July 2023, from https://gist.github.com/seripap/9eb809268eb8026abd9f
export const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];




/**
 * given the year number and month number, return the number of days in the month.
 * @param year the year number, year must >=2015 and <=2022
 * @param month the month number, between 1 to 12
 */
export function getNumberOfDaysInMonth(year: number, month: number): number {
    if (year < 2015 || year > 2022) {
        throw new Error(`Invalid year number. Year must be between 2015 and 2022, but given ${year}`);
    }

    if (month < 1 || month > 12) {
        throw new Error(`Invalid month number. Month must be between 1 and 12, but given ${month}`);
    }

    const monthWith31Days = [1, 3, 5, 7, 8, 10, 12]
    const monthWith30Days = [4, 6, 9, 11]
    if (monthWith31Days.includes(month)) {
        return 31;
    } else if (monthWith30Days.includes(month)) {
        return 30;
    } else {
        if (year === 2016 || year === 2020) {
            return 29;
        } else {
            return 28;
        }
    }
}