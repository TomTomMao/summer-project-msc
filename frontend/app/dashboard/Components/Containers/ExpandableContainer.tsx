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
            <button style={{position: 'absolute', top:'5px', left:'5px'}} onClick={() => handleSetExpand(!isExpand)}>{isExpand ? '_' : '+'}</button>
            {children}
        </div>
    )
}
