import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'

export function Theme({ }) {
    const [theme, setTheme] = useState('dark');
    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);
    return (
        <>
            {theme == "light" && <FontAwesomeIcon title="dark mode" className="colorToggle pointer horizontal-padding" onClick={() => setTheme('dark')} icon={faMoon} />}
            {theme == "dark" && <FontAwesomeIcon title="light mode" className="colorToggle pointer horizontal-padding" onClick={() => setTheme('light')} icon={faSun} />}
        </>
    )
}
export default Theme
