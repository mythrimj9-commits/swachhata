import { STATUS_CONFIG } from '../../utils/constants'

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.submitted

    return (
        <span
            className="status-badge"
            style={{
                backgroundColor: config.bg,
                color: config.color,
                border: `1px solid ${config.color}`
            }}
        >
            {config.label}
        </span>
    )
}

export default StatusBadge
