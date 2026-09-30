import { Link } from 'react-router';
import Icon from './Icon.jsx';
import EmptyState from './EmptyState.jsx';
import styles from './MenuUi.module.css';

export default function Feedback({ loading, error, errorStatus, retry, variant = 'detail', children }) {
    if (loading) return <div className={styles.loading} aria-busy="true">
        <p className={`${styles.loadingText} label1 medium`} role="status"><Icon name="spinner" spin />
            {variant === 'list' ? '메뉴 목록을 불러오는 중입니다…' : variant === 'form' ? '입력 정보를 불러오는 중입니다…' : '메뉴 정보를 불러오는 중입니다…'}</p>
        {variant === 'list' ? <div className={styles.menuGrid} aria-hidden="true">{Array.from({ length: 6 }, (_, index) =>
            <div key={index} className={styles.menuCard}><div className={`${styles.skeleton} ${styles.skeletonChip}`} />
                <div className={`${styles.skeleton} ${styles.skeletonTitle}`} /><div className={`${styles.skeleton} ${styles.skeletonPrice}`} />
                <div className={`${styles.skeleton} ${styles.skeletonFoot}`} /></div>)}</div>
            : <div className={`${styles.panel} ${styles.skeletonPanel}`} aria-hidden="true"><div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
                <div className={`${styles.skeleton} ${styles.skeletonFoot}`} /><div className={`${styles.skeleton} ${styles.skeletonTitle}`} /></div>}
    </div>;
    if (error) {
        const missing = errorStatus === 404;
        return <div role="alert"><EmptyState negative icon={missing ? 'search' : 'alert'}
            title={missing ? '메뉴를 찾을 수 없습니다' : '서버에 연결하거나 요청을 처리하지 못했습니다'}
            action={<div className={styles.stateActions}>
                {!missing && retry && <button type="button" className={`${styles.btn} ${styles.btnPrimary} label1 bold`} onClick={retry}><Icon name="refresh" />다시 시도</button>}
                <Link className={`${styles.btn} ${styles.btnSecondary} label1 bold`} to="/">메뉴 목록으로</Link>
            </div>}>
            <p>{missing ? '삭제되었거나 존재하지 않는 메뉴입니다. 목록에서 다른 메뉴를 선택해 주세요.' : error}</p>
        </EmptyState></div>;
    }
    return children;
}
