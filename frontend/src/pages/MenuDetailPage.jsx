import { useCallback, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { fetchMenu, removeMenu } from '../api/menu.js';
import { toMessage } from '../api/client.js';
import useResource from '../hooks/useResource.js';
import Feedback from '../components/Feedback.jsx';
import DeleteDialog from '../components/DeleteDialog.jsx';
import Icon from '../components/Icon.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Notice from '../components/Notice.jsx';
import styles from '../components/MenuUi.module.css';

export default function MenuDetailPage() {
    const { menuCode } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const load = useCallback(signal => fetchMenu(menuCode, signal), [menuCode]);
    const resource = useResource(load, menuCode);
    const [confirm, setConfirm] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const deleteButton = useRef(null);
    async function remove() {
        if (busy) return;
        setBusy(true);
        setError(null);
        try {
            await removeMenu(menuCode);
            navigate('/', { replace: true, state: { message: '메뉴를 삭제했습니다.' } });
        } catch (e) {
            setError(toMessage(e));
        } finally {
            setBusy(false);
        }
    }
    return <section className={`${styles.page} ${styles.pageNarrow}`} aria-labelledby="detail-title">
        <div className={`${styles.pageHeader} ${styles.pageHeaderBottom}`}>
            <div className={styles.pageHeaderText}><Link className={`${styles.backLink} label1 medium`} to="/"><Icon name="back" />메뉴 목록으로</Link>
                <h1 id="detail-title" className={`${styles.pageTitle} title3 bold`}>메뉴 상세</h1></div>
            {resource.data && <div className={`${styles.pageActions} ${styles.pageActionsStack}`}>
                <Link className={`${styles.btn} ${styles.btnSecondary} label1 bold`} to={'/menus/' + menuCode + '/edit'}><Icon name="edit" />수정</Link>
                <button ref={deleteButton} type="button" className={`${styles.btn} ${styles.btnDanger} label1 bold`} onClick={() => { setError(null); setConfirm(true); }}><Icon name="trash" />삭제</button>
            </div>}
        </div>
        {location.state?.message && <Notice key={location.key} title={location.state.message} dismissible />}
        <Feedback {...resource}>
            {resource.data && <article className={styles.panel}>
                <dl className={styles.specList}>
                    <div className={`${styles.specItem} ${styles.specItemWide}`}><dt className={`${styles.specLabel} label1 medium`}>메뉴 이름</dt>
                        <dd className={`${styles.specValue} title3 bold`}>{resource.data.menuName}</dd></div>
                    <div className={styles.specItem}><dt className={`${styles.specLabel} label1 medium`}>가격</dt>
                        <dd className={`${styles.specValue} heading2 bold`}>{resource.data.menuPrice.toLocaleString('ko-KR')}원</dd></div>
                    <div className={styles.specItem}><dt className={`${styles.specLabel} label1 medium`}>분류</dt>
                        <dd className={`${styles.specValue} body1`}>{resource.data.categoryName}</dd></div>
                    <div className={styles.specItem}><dt className={`${styles.specLabel} label1 medium`}>주문 상태</dt>
                        <dd className={styles.specValue}><StatusBadge status={resource.data.orderableStatus} /></dd></div>
                    <div className={styles.specItem}><dt className={`${styles.specLabel} label1 medium`}>메뉴 번호</dt>
                        <dd className={`${styles.specValue} body1`}>{resource.data.menuCode}</dd></div>
                </dl>
                {confirm && <DeleteDialog menu={resource.data} busy={busy} error={error} returnFocusRef={deleteButton}
                    onCancel={() => setConfirm(false)} onConfirm={remove} />}
            </article>}
        </Feedback>
    </section>;
}
