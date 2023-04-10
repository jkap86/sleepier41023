import React, { useState, useEffect } from "react";


const Select = ({
    options,
    selected
}) => {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false)


    return <>
        <p onClick={() => setIsDropdownVisible(prevState => !prevState)}>
            {options[0]}
        </p>
        <div>
            <ul>
                {
                    isDropdownVisible && options.length > 1 ?
                        options.map(option =>
                            <li key={option}>
                                {option}
                            </li>
                        )
                        : null
                }
            </ul>
        </div>
    </>
}

export default Select;