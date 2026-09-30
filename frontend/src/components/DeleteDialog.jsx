import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import Notice from './Notice.jsx';
import styles from './MenuUi.module.css';

export default function DeleteDialog({ menu, busy, error, onCancel, onConfirm, returnFocusRef }) {
    const dialog = useRef(null);
    useEffect(() => {
        const element = dialog.current;
        const returnTarget = returnFocusRef?.current;
        element.showModal();
        return () => {
            element.close();
            if (returnTarget?.isConnected) returnTarget.focus();
        };
    }, [returnFocusRef]);
    useEffect(() => {
        if (busy) dialog.current.focus();
    }, [busy]);
    function trapTab(event) {
        if (event.key !== 'Tab') return;
        const element = dialog.current;
        const controls = [...element.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')];
        if (!controls.length) {
            event.preventDefault();
            element.focus();
            return;
        }
        const first = controls[0];
        const last = controls.at(-1);
        const active = document.activeElement;
        if (event.shiftKey && (active === first || !controls.includes(active))) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && (active === last || !controls.includes(active))) {
            event.preventDefault();
            first.focus();
        }
    }
    return <dialog ref={dialog} tabIndex="-1" onKeyDown={trapTab} className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description"
        onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }}>
        <h2 id="delete-title" className="heading1 bold">‘{menu.menuName}’ 메뉴를 삭제할까요?</h2>
        <div className={styles.dialogText} id="delete-description">
            <p className="body2-reading">삭제하면 목록에서 사라지고 되돌릴 수 없습니다.</p>
            <p className={`${styles.muted} label2`}>메뉴 번호 {menu.menuCode} · {menu.menuPrice.toLocaleString('ko-KR')}원 · {menu.categoryName}</p>
        </div>
        {error && <Notice negative title="삭제 결과를 확인하지 못했습니다">{error} 응답이 없으면 이미 삭제되었을 수 있습니다. 목록에서 메뉴 상태를 확인해 주세요.</Notice>}
        <div className={styles.dialogActions}>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary} label1 bold`} onClick={onCancel} disabled={busy} autoFocus>취소</button>
            <button type="button" className={`${styles.btn} ${styles.btnDangerSolid} label1 bold`} onClick={onConfirm} disabled={busy} aria-busy={busy}>
                <Icon name={busy ? 'spinner' : 'trash'} spin={busy} />{busy ? '삭제 중…' : error ? '다시 삭제' : '삭제 확인'}
            </button>
        </div>
    </dialog>;
}
