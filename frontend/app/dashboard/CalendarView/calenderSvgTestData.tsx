import { ICalendarSvgData } from "./CalendarSvg/CalendarSvg";



export function getCalendarSvgTestData() {
    let calendarDataArrTest: ICalendarSvgData[] = [];
    let currentDate = new Date('2021/01/01')
    while (currentDate.getFullYear() == 2021) {
        // append calendarData in to calendarDataArrTest
        // update the currentDate by one day
        // random colour: https://css-tricks.com/snippets/javascript/random-hex-color/
        const calendarData: ICalendarSvgData = {
            date: new Date(currentDate),
            colour: '#' + Math.floor(Math.random() * 16777215).toString(16),
            size: Math.floor(Math.random() * 5),
            shape: 'rect',
            texture: 'default',
            id:String(currentDate.getFullYear()) + '/' + String(currentDate.getMonth()+1) + '/' + String(currentDate.getDate()) + '/hashnull' 
        }
        calendarDataArrTest.push(calendarData)
        currentDate.setDate(currentDate.getDate() + 1)
    }
    console.log(calendarDataArrTest)
    return calendarDataArrTest;
}