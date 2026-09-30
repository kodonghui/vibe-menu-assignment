import Icon from './Icon.jsx';
import styles from './MenuUi.module.css';

export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;
    const first = Math.max(1, Math.min(page - 2, totalPages - 4));
    const numbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) => first + index);
    const previous = <button type="button" className={styles.pageBtn} onClick={() => onChange(page - 1)}
        disabled={page <= 1} aria-label="이전 페이지"><Icon name="left" /></button>;
    const next = <button type="button" className={styles.pageBtn} onClick={() => onChange(page + 1)}
        disabled={page >= totalPages} aria-label="다음 페이지"><Icon name="right" /></button>;
    return <>
        <nav aria-label="페이지 이동" className={styles.pagination}>
            {previous}
            {first > 1 && <><button type="button" className={`${styles.pageBtn} label1 medium`} onClick={() => onChange(1)} aria-label="1 페이지">1</button>
                {first > 2 && <span className={styles.pageGap}>…</span>}</>}
            {numbers.map(number => <button type="button" key={number} className={`${styles.pageBtn} label1 ${number === page ? 'bold' : 'medium'}`}
                aria-label={`${number} 페이지`} aria-current={number === page ? 'page' : undefined} onClick={() => onChange(number)}>{number}</button>)}
            {numbers.at(-1) < totalPages && <>{numbers.at(-1) < totalPages - 1 && <span className={styles.pageGap}>…</span>}
                <button type="button" className={`${styles.pageBtn} label1 medium`} aria-label={`${totalPages} 페이지`} onClick={() => onChange(totalPages)}>{totalPages}</button></>}
            {next}
        </nav>
        <nav aria-label="모바일 페이지 이동" className={styles.paginationCompact}>
            {previous}<span className={`${styles.pageSummary} label1 medium`}>{page} / {totalPages} 페이지</span>{next}
        </nav>
    </>;
}
