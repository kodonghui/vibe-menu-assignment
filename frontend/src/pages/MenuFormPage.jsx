import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { createMenu, fetchMenu, updateMenu } from '../api/menu.js';
import { fetchCategories, onlyChildren } from '../api/category.js';
import { toMessage } from '../api/client.js';
import useResource from '../hooks/useResource.js';
import Feedback from '../components/Feedback.jsx';
import Icon from '../components/Icon.jsx';
import Notice from '../components/Notice.jsx';
import EmptyState from '../components/EmptyState.jsx';
import styles from '../components/MenuUi.module.css';

const loadCategories = signal => fetchCategories(signal);
export default function MenuFormPage() {
    const { menuCode } = useParams();
    return <MenuForm key={menuCode || 'new'} menuCode={menuCode} />;
}

function MenuForm({ menuCode }) {
    const [busy, setBusy] = useState(false);
    const categories = useResource(loadCategories, 'categories');
    const load = useCallback(signal => menuCode ? fetchMenu(menuCode, signal) : Promise.resolve({
        menuName: '', menuPrice: '', categoryCode: '', orderableStatus: 'Y',
    }), [menuCode]);
    const resource = useResource(load, menuCode || 'new');
    const back = menuCode ? '/menus/' + menuCode : '/';
    return <section className={`${styles.page} ${styles.pageNarrow}`} aria-labelledby="form-title">
        <div className={styles.pageHeader}><div className={styles.pageHeaderText}>
            <Link className={`${styles.backLink} label1 medium ${busy ? styles.disabledLink : ''}`} to={back}
                aria-disabled={busy || undefined} tabIndex={busy ? -1 : undefined} onClick={event => { if (busy) event.preventDefault(); }}>
                <Icon name="back" />{menuCode ? '메뉴 상세로' : '메뉴 목록으로'}</Link>
            <h1 id="form-title" className={`${styles.pageTitle} title3 bold`}>{menuCode ? '메뉴 수정' : '메뉴 등록'}</h1>
        </div></div>
        <Feedback loading={categories.loading || resource.loading} error={categories.error || resource.error}
            errorStatus={resource.errorStatus} variant="form"
            retry={() => { categories.retry(); resource.retry(); }}>
            {resource.data && categories.data && <MenuEditor key={menuCode || 'new'} menuCode={menuCode}
                initial={resource.data} categories={onlyChildren(categories.data)} busy={busy} setBusy={setBusy} />}
        </Feedback>
    </section>;
}
function MenuEditor({ menuCode, initial, categories, busy, setBusy }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        menuName: initial.menuName,
        menuPrice: String(initial.menuPrice),
        categoryCode: String(initial.categoryCode),
        orderableStatus: initial.orderableStatus,
    });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);
    const [missing, setMissing] = useState(false);
    const failure = useRef(null);
    const pending = useRef(false);
    const active = useRef(false);
    useEffect(() => {
        active.current = true;
        return () => { active.current = false; };
    }, []);
    const groups = [...new Set(categories.map(category => category.refCategoryName))];
    function change(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }
    async function submit(event) {
        event.preventDefault();
        if (pending.current) return;
        const next = {};
        if (!form.menuName.trim()) next.menuName = '메뉴 이름을 입력해 주세요.';
        else if (form.menuName.trim().length > 100) next.menuName = '메뉴 이름은 100자 이내로 입력해 주세요.';
        if (!/^\d+$/.test(form.menuPrice) || Number(form.menuPrice) > 2147483647) next.menuPrice = '가격은 0 이상의 정수로 입력해 주세요.';
        if (!categories.some(c => String(c.categoryCode) === form.categoryCode)) next.categoryCode = '카테고리를 선택해 주세요.';
        setErrors(next);
        if (Object.keys(next).length) {
            event.currentTarget.elements.namedItem(Object.keys(next)[0])?.focus();
            return;
        }
        pending.current = true;
        setBusy(true);
        setError(null);
        try {
            const payload = { menuName: form.menuName.trim(), menuPrice: Number(form.menuPrice),
                categoryCode: Number(form.categoryCode), orderableStatus: form.orderableStatus };
            const saved = menuCode ? await updateMenu(menuCode, payload) : await createMenu(payload);
            if (!active.current) return;
            navigate('/menus/' + saved.menuCode, { replace: true, state: { message: menuCode ? '메뉴를 수정했습니다.' : '메뉴를 등록했습니다.' } });
        } catch (e) {
            if (!active.current) return;
            if (e.response?.status === 404 && menuCode) setMissing(true);
            else {
                setError({ message: toMessage(e), uncertain: !e.response });
                requestAnimationFrame(() => { if (active.current) failure.current?.focus(); });
            }
        } finally {
            pending.current = false;
            if (active.current) setBusy(false);
        }
    }
    if (missing) return <div role="alert"><EmptyState negative title="메뉴를 찾을 수 없습니다"
        action={<Link className={`${styles.btn} ${styles.btnSecondary} label1 bold`} to="/">메뉴 목록으로</Link>}>
        <p>편집 중 메뉴가 삭제되었거나 존재하지 않습니다. 목록에서 메뉴를 확인해 주세요.</p>
    </EmptyState></div>;
    const cancel = menuCode ? '/menus/' + menuCode : '/';
    return <form noValidate onSubmit={submit} className={`${styles.panel} ${styles.formCard}`} aria-busy={busy}>
        {error && <div ref={failure} tabIndex="-1" className={styles.formFailure}><Notice negative title={error.uncertain ? '저장 결과를 확인하지 못했습니다' : '메뉴를 저장하지 못했습니다'}>
            <p>{error.message}</p>
            {error.uncertain && <p>응답을 받지 못했지만 이미 저장되었을 수 있습니다. 다시 저장하기 전에 <Link to="/">메뉴 목록에서 확인해 주세요.</Link></p>}
        </Notice></div>}
        <fieldset disabled={busy} className={styles.formFieldset}>
            <legend className={styles.srOnly}>메뉴 정보</legend>
            <div className={styles.field}>
                <label className={`${styles.fieldLabel} label1 bold`} htmlFor="menu-name">메뉴 이름 <span className={`${styles.fieldRequired} label2 medium`}>필수</span></label>
                <div className={styles.control}><input id="menu-name" className={`${styles.input} body1`} name="menuName" value={form.menuName} onChange={change} maxLength="100"
                    aria-invalid={!!errors.menuName} aria-describedby={errors.menuName ? 'name-error name-help' : 'name-help'} required /></div>
                <div className={`${styles.fieldMeta} label2`}><p id="name-help">100자 이내로 입력합니다.</p><span className={`${styles.counter} caption1`}>{form.menuName.length} / 100</span></div>
                {errors.menuName && <p id="name-error" role="alert" className={`${styles.fieldError} label2 medium`}><Icon name="alert" small />{errors.menuName}</p>}
            </div>
            <div className={styles.field}>
                <label className={`${styles.fieldLabel} label1 bold`} htmlFor="menu-price">가격 <span className={`${styles.fieldRequired} label2 medium`}>필수</span></label>
                <div className={styles.control}><input id="menu-price" className={`${styles.input} ${styles.hasSuffix} body1`} name="menuPrice" value={form.menuPrice} onChange={change} type="number" min="0" max="2147483647" step="1"
                    aria-invalid={!!errors.menuPrice} aria-describedby={errors.menuPrice ? 'price-error price-help' : 'price-help'} required /><span className={`${styles.suffix} label2`}>원</span></div>
                <p id="price-help" className={`${styles.muted} label2`}>0 이상의 정수로 입력합니다.</p>
                {errors.menuPrice && <p id="price-error" role="alert" className={`${styles.fieldError} label2 medium`}><Icon name="alert" small />{errors.menuPrice}</p>}
            </div>
            <div className={styles.field}>
                <label className={`${styles.fieldLabel} label1 bold`} htmlFor="menu-category">하위 카테고리 <span className={`${styles.fieldRequired} label2 medium`}>필수</span></label>
                <div className={styles.control}><select id="menu-category" className={`${styles.input} ${styles.select} body1`} name="categoryCode" value={form.categoryCode} onChange={change}
                    aria-invalid={!!errors.categoryCode} aria-describedby={errors.categoryCode ? 'category-error' : undefined} required>
                    <option value="">하위 카테고리를 선택하세요</option>
                    {groups.map(group => <optgroup key={group} label={group}>{categories.filter(category => category.refCategoryName === group).map(category =>
                        <option key={category.categoryCode} value={category.categoryCode}>{category.categoryName}</option>)}</optgroup>)}
                </select><Icon name="chevron" className={styles.selectChevron} /></div>
                {errors.categoryCode && <p id="category-error" role="alert" className={`${styles.fieldError} label2 medium`}><Icon name="alert" small />{errors.categoryCode}</p>}
            </div>
            <fieldset className={styles.formFieldset}>
                <legend className={`${styles.fieldLabel} label1 bold`}>주문 상태 <span className={`${styles.fieldRequired} label2 medium`}>필수</span></legend>
                <div className={styles.choiceGroup}>{[{ value: 'Y', label: '주문 가능' }, { value: 'N', label: '주문 불가' }].map(option =>
                    <label key={option.value} className={styles.choice}>
                        <input type="radio" name="orderableStatus" value={option.value} checked={form.orderableStatus === option.value} onChange={change} required />
                        <span className={`${styles.choiceBox} body1`}><span className={styles.radioMark} aria-hidden="true" />{option.label}</span>
                    </label>)}</div>
            </fieldset>
        </fieldset>
        <div className={styles.formActions}>
            <Link className={`${styles.btn} ${styles.btnSecondary} label1 bold ${busy ? styles.disabledLink : ''}`} to={cancel}
                aria-disabled={busy || undefined} tabIndex={busy ? -1 : undefined} onClick={event => { if (busy) event.preventDefault(); }}>취소</Link>
            <button className={`${styles.btn} ${styles.btnPrimary} label1 bold`} disabled={busy} type="submit" aria-busy={busy}>
                {busy && <Icon name="spinner" spin />}{busy ? '저장 중…' : '저장'}</button>
        </div>
    </form>;
}
