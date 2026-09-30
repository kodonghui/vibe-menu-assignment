import { useState } from 'react';
import Icon from './Icon.jsx';
import styles from './MenuUi.module.css';

export default function Notice({ title, children, negative = false, dismissible = false }) {
    const [visible, setVisible] = useState(true);
    if (!visible) return null;
    return <div className={`${styles.alert} ${negative ? styles.alertNegative : styles.alertPositive}`}
        role={negative ? 'alert' : 'status'}>
        <Icon name={negative ? 'alert' : 'check'} />
        <div className={styles.alertBody}>
            <p className="label1 bold">{title}</p>
            {children && <div className="label2">{children}</div>}
        </div>
        {dismissible && <button type="button" className={`${styles.btn} ${styles.btnIcon} ${styles.alertClose}`}
            aria-label="성공 알림 닫기" onClick={() => setVisible(false)}><Icon name="close" /></button>}
    </div>;
}
