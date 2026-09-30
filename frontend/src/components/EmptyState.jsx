import Icon from './Icon.jsx';
import styles from './MenuUi.module.css';

export default function EmptyState({ title, children, negative = false, icon = 'search', action }) {
    return <div className={styles.emptyState}>
        <span className={`${styles.emptyIcon} ${negative ? styles.emptyIconNegative : ''}`}><Icon name={icon} large /></span>
        <h2 className={`${styles.emptyTitle} heading2 bold`}>{title}</h2>
        {children && <div className={`${styles.emptyText} body2-reading`}>{children}</div>}
        {action}
    </div>;
}
