const Loader = ({ size = 'medium', fullScreen = false }) => {
    const sizeClass = `loader-${size}`

    if (fullScreen) {
        return (
            <div className="loader-overlay">
                <div className={`loader ${sizeClass}`}>
                    <div className="loader-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`loader ${sizeClass}`}>
            <div className="loader-spinner"></div>
        </div>
    )
}

export default Loader
