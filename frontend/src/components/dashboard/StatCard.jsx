const StatCard = ({ title, value, icon: Icon, color = '#4CAF50', subtext }) => {
    return (
        <div className="stat-card" style={{ borderLeftColor: color }}>
            <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
                {Icon && <Icon />}
            </div>
            <div className="stat-content">
                <h3 className="stat-value">{value}</h3>
                <p className="stat-title">{title}</p>
                {subtext && <span className="stat-subtext">{subtext}</span>}
            </div>
        </div>
    )
}

export default StatCard
