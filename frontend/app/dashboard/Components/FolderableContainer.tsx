import { useState } from "react"

export default function FolderableContainer({ children, label }: { children: React.ReactNode, label: string }) {
    const [isFolded, setIsFolded] = useState(true);
    const handleToggleFold = () => {
        setIsFolded(!isFolded)
    }
    return (<><button className="mx-auto" style={{ width: '100%' }} onClick={handleToggleFold}>{isFolded ? 'show ' : 'hide '} {label}</button>{!isFolded && children}</>)

}