export function isNumber(value:string) {
    /**
     * check if a string is number like 
     * Return True if value only has numerical number
     * 
     * '011'->false
     * 
     * '1'->true
     * '1a'->false
     * '1.1'->true
     * ''-> false
     * 'abcd'->false
     * '-1'->true
     */
    if (String(parseInt(value))===value) {
        return true
    } else if (String(parseFloat(value))===value) {
        return true
    } else {return false}
}