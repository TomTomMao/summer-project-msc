import { MouseEventHandler } from "react";
import { Button as MUIButton, ButtonProps as MUIButtonProps } from "@mui/material"; // reference: https://mui.com/material-ui
// interface ButtonProps { onClick: MouseEventHandler<HTMLButtonElement> | undefined; available: boolean | undefined; children: any | undefined} 
interface ButtonProps extends MUIButtonProps {
    available?: boolean;
}
export function Button({ available, ...rest }: ButtonProps) {

    // return <button className={available ? "hoverableButton" : "inavailableButton"} onClick={onClick} disabled={!available}>{children}</button>;
    return <MUIButton {...rest} disabled={!available}>{rest.children}</MUIButton>;
}
