import { useState } from "react"

export default function FolderableContainer({ children, label, initIsFolded }: { children: React.ReactNode, label: string, initIsFolded: boolean }) {
    const [isFolded, setIsFolded] = useState(initIsFolded);
    const handleToggleFold = () => {
        setIsFolded(!isFolded)
    }
    return (<><button className="mx-auto" style={{ width: '100%' }} onClick={handleToggleFold}>{isFolded ? 'show ' : 'hide '} {label}</button>{!isFolded && children}</>)

}