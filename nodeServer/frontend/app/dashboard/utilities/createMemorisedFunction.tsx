/**
 *
 * @param regularFunction original function that need to create a memorised version
 * @param comparingFunction function used for comparing the old return value and new return value
 * @returns if the old return value is the same is new return value compared by the comparingFunction, return the old one, other wise return the new one and memorise the new one for next comparision.
 */
export function createMemorisedFunction<InputValue, ReturnValue>(regularFunction: (state: InputValue) => ReturnValue, comparingFunction: (lastReturnValue: ReturnValue, newReturnValue: ReturnValue) => boolean) {
    let lastReturnValue: undefined | ReturnValue = undefined;
    return function memorisedFunction(inputValue: InputValue): ReturnValue {
        const newReturnValue = regularFunction(inputValue);
        if (lastReturnValue === undefined || !comparingFunction(lastReturnValue, newReturnValue)) {
            // console.log('memorised function updated return value')
            lastReturnValue = newReturnValue;
        } else {
            // do nothing
            // console.log('memorised function use the previous return value')
        }
        return lastReturnValue;
    };
}
/**
 *
 * @param arr1
 * @param arr2
 * @returns if arr1.lenght === arr2.length and all the element are the same, return true; otherwise return false
 */
export function comparingArray<Element>(arr1: Element[], arr2: Element[]) {
    if (arr1.length !== arr2.length) { return false; }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}
export function createArrayComparator<Element>(isElementEqualComparator: (element1: Element, element2: Element) => boolean = (a, b) => a === b) {
    return function comparingArray(arr1: Element[], arr2: Element[]) {
        if (arr1.length !== arr2.length) { return false; }
        for (let i = 0; i < arr1.length; i++) {
            if (isElementEqualComparator(arr1[i], arr2[i]) === false) {
                return false;
            }
        }
        return true;
    }
}

/**
 * 
 * @param set1 
 * @param set2 
 * @returns true if two two sets share same elements
 * reference: Shah, A. M. (2015, June 30). Answer to ‘comparing ECMA6 sets for equality’. Stack Overflow. https://stackoverflow.com/a/31129384
 */
export function comparingSet<Element>(set1: Set<Element>, set2: Set<Element>) {
    return set1.size === set2.size && Array.from(set1.values()).every((x) => set2.has(x))
}

