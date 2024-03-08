import { useState } from "react"

export default function FolderableContainer({ children, label, initIsFolded }: { children: React.ReactNode, label: string, initIsFolded: boolean }) {
    const [isFolded, setIsFolded] = useState(initIsFolded);
    const handleToggleFold = () => {
        setIsFolded(!isFolded)
    }
    return (<><button className="mx-auto" style={{ width: '100%' }} onClick={handleToggleFold}>{isFolded ? 'Show ' : 'Hide '} {label}</button>{!isFolded && children}</>)

}

export function FolderableContainerInTable({ children, label, initIsFolded, colSpan }: { children: React.ReactNode, label: string, initIsFolded: boolean, colSpan: number }) {
    const [isFolded, setIsFolded] = useState(initIsFolded);
    const handleToggleFold = () => {
        setIsFolded(!isFolded)
    }
    return (
        <>
            <tr>
                <td colSpan={colSpan}>
                    <button className="mx-auto" style={{ width: '100%' }} onClick={handleToggleFold}>{isFolded ? 'Show ' : 'Hide '} {label}
                    </button>
                </td>
            </tr>
            {!isFolded && children}
        </>)

}