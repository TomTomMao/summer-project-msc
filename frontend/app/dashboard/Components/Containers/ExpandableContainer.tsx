import { Button } from "@mui/material";
import React, { useState } from "react";

type ExpandableContainerProps = {
    children: React.ReactNode;
    onSetExpand: (nextIsExpand: boolean) => void;
    initStyle: React.CSSProperties;
    expandedStyle: React.CSSProperties;
};

/**
 * a container with a button, once user click the button, the container would float at the center of the screen
 * the size of the container should be determined by the element inside it
 * @param expandableContainerProps.children the element inside the container
 * @param expandableContainerProps.onSetExpand callback function for changing the children's appearence
 * @param expandableContainerProps.initStyle the style when the container is not expanded
 * @param expandableContainerProps.expandedStyle the style when the container is not expanded
 */
export default function ExpandableContainer(expandableContainerProps: ExpandableContainerProps): React.JSX.Element {
    const { children, onSetExpand, initStyle, expandedStyle } = expandableContainerProps
    const [isExpand, setIsExpand] = useState(false)
    function handleSetExpand(nextIsExpand: boolean) {
        setIsExpand(nextIsExpand);
        onSetExpand(nextIsExpand)
    }
    return (
        <div style={isExpand ? expandedStyle : initStyle}>
            <button style={{ position: 'absolute', top: '5px', left: '5px', zIndex: '998' }} onClick={() => handleSetExpand(!isExpand)}>{isExpand ? '_' : '+'}</button>
            {children}
        </div>
    )
}

type UseExpandableContainerProps = {
    onSetExpand: (nextIsExpand: boolean) => void;
};

export function useExpandableContainer(useExpandableContainerProps: UseExpandableContainerProps): {
    expandButton: React.JSX.Element, ExpandableContainer: ({ children }: {
        children: JSX.Element;
    }) => React.JSX.Element
} {
    const { onSetExpand } = useExpandableContainerProps
    const [isExpand, setIsExpand] = useState(false)
    function handleSetExpand(nextIsExpand: boolean) {
        setIsExpand(nextIsExpand);
        onSetExpand(nextIsExpand)
    }
    const expandButton = <Button size="small" variant="outlined" onClick={() => handleSetExpand(!isExpand)}>{isExpand ? '_' : '+'}</Button>
    const ExpandableContainer = ({ children }: { children: JSX.Element }) => <div style={isExpand ? expandedStyle : initStyle}>{children}</div>
    return { expandButton, ExpandableContainer }
}

const initStyle: React.CSSProperties = {
    position: 'relative',
}
const expandedStyle: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 999,
    border: '1px black solid',
    backgroundColor: 'white'
}