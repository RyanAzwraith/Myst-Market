


function ToggleComponent(props:{
    state: boolean,
    onChild: React.ReactNode,
    offChild: React.ReactNode
}): React.ReactNode {
    if (props.state) return props.onChild  
    else return props.offChild
}

export { ToggleComponent }