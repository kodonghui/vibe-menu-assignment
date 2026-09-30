import Icon from './Icon.jsx';
import styles from './MenuUi.module.css';

export default function StatusBadge({ status }) {
    const available = status === 'Y';
    return <span className={`${styles.badge} ${available ? styles.badgePositive : styles.badgeNegative} label2 bold`}>
        <Icon name={available ? 'check' : 'ban'} small />
        {available ? '주문 가능' : '주문 불가'}
    </span>;
}
