
import React from "react"
const Button = (props) => {
    const { type, className, id, title, onClick, icon, buttonName, variant, disabled, children } = props
    return (
        <button
            className={`${variant ?? 'user-btn'} ${className ?? ""}`}
            id={id ?? ''}
            type={type ?? 'button'}
            onClick={onClick}
            title={title ?? ''}
            disabled={disabled ?? disabled}
        >
            {icon ? <div className={`${icon} ${buttonName ? '' : 'mr-0'}`}></div> : ''}
            {children}
            {buttonName ?? ''}

        </button>
    )
}
export default Button