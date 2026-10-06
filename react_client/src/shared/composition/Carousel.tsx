import { 
    useState, 
    type ReactNode 
} from "react"
import { 
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@/shared/presentation/icon"
import { Row } from "../composition"


export {
    Carousel
}


function Carousel({
    content, limit = 3
    }: {
    content: ReactNode[], 
    limit?: number
} ) {
    const [offset, setOffset] = useState(0) 

    const shownContent = []
    for (let i = 0; i < Math.min(limit, content.length); i++) {
        shownContent.push(content[(offset + i) % content.length])
    }

    return (
    <Row 
    justify="center"
    children={ 
    <>
        <ChevronLeftIcon 
        onClick={() => 
            setOffset(o => (o + 1) % content.length)
        }/>

        {shownContent}

        <ChevronRightIcon
        onClick={() => 
            setOffset(o => (o - 1 + content.length) % content.length)
        }/>
    </> 
    } />
)}
