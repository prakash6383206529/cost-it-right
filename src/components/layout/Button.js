
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


/**
* @Compoent Button
* @description 
Props:
1. type (string, optional): Specifies the type of button (button, submit, reset). Defaults to 'button'.
2. className (string, optional): Additional CSS classes to be added to the button element.
3. id (string, optional): The HTML id attribute for the button element.
4. title (string, optional): The title attribute for the button element, used for tooltip or additional information.
5. onClick (function, required): The click event handler for the button.
6. icon (string, optional): CSS class or icon name for an icon element to be displayed on the button.
7. buttonName (string, optional): Text to be displayed on the button.
8. variant (string, optional): CSS class or variant name to customize the button's appearance IF YOU WANT TO CANCEL BUTTON PLEASE PASS THE "cancel-btn" PROP.
9. disabled (boolean, optional): Specifies if the button is disabled or not. Defaults to false.
10. children (React node, optional): Additional content to be rendered inside the button.
*/