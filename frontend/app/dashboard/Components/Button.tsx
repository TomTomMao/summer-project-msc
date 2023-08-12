import { MouseEventHandler } from "react";

export function Button({ onClick, available, children }: { onClick: MouseEventHandler<HTMLButtonElement> | undefined; available: boolean | undefined; children: any | undefined; }) {

    return <button className={available ? "hoverableButton" : "inavailableButton"} onClick={onClick} disabled={!available}>{children}</button>;
}
