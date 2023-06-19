export default function CalendarControllerRow({ name, children }: { name: string; children: React.ReactNode; }) {
    return (<div className="flex flex-row bg-gray-100">
        <div className="basis-1/3 text-right pr-1">{name}</div>
        <div className="basis-2/3 bg-blue-100">
            {children}
        </div>
    </div>);
}
