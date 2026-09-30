import { useCallback } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { fetchAllMenus, fetchMenuPage, searchMenusOverPrice } from '../api/menu.js';
import { fetchCategories, onlyChildren } from '../api/category.js';
import useResource from '../hooks/useResource.js';
import Feedback from '../components/Feedback.jsx';
import Icon from '../components/Icon.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Notice from '../components/Notice.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import styles from '../components/MenuUi.module.css';

const PAGE_SIZE = 12;
const loadCategories = signal => fetchCategories(signal);

export default function MenuListPage() {
    const [params, setParams] = useSearchParams();
    const location = useLocation();
    const keyword = params.get('q') || '';
    const category = params.get('category') || '';
    const price = params.get('price') || '';
    const page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
    const filtering = keyword !== '' || category !== '' || price !== '';
    const categories = useResource(loadCategories, 'categories');
    const load = useCallback(async signal => {
        if (!filtering) return fetchMenuPage({ page, size: PAGE_SIZE }, signal);
        let source;
        let overallTotal;
        if (price === '') {
            source = await fetchAllMenus(signal);
            overallTotal = source.length;
        } else {
            const [overPrice, overall] = await Promise.all([
                searchMenusOverPrice(Number(price), signal), fetchMenuPage({ page: 1, size: 1 }, signal),
            ]);
            source = overPrice;
            overallTotal = overall.totalElements;
        }
        const filtered = source.filter(menu => menu.menuName.toLowerCase().includes(keyword.trim().toLowerCase())
            && (!category || String(menu.categoryCode) === category));
        return {
            menus: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
            totalElements: filtered.length,
            totalPages: Math.ceil(filtered.length / PAGE_SIZE),
            overallTotal,
        };
    }, [filtering, page, price, keyword, category]);
    const resource = useResource(load, params.toString());

    function filter(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const next = new URLSearchParams();
        for (const name of ['q', 'category', 'price']) {
            const value = String(form.get(name) || '').trim();
            if (value) next.set(name, value);
        }
        next.set('page', '1');
        setParams(next);
    }
    function movePage(number) {
        const next = new URLSearchParams(params);
        next.set('page', String(number));
        setParams(next);
    }

    const condition = [keyword && `이름 ‘${keyword}’`, category && (categories.data || []).find(c => String(c.categoryCode) === category)?.categoryName,
        price && `${Number(price).toLocaleString('ko-KR')}원 초과`].filter(Boolean).join(' · ');
    const reset = () => setParams({ page: '1' });
    const outsidePage = resource.data && resource.data.totalElements > 0 && page > resource.data.totalPages;

    return <section className={styles.page} aria-labelledby="list-title">
        <div className={styles.pageHeader}>
            <div className={styles.pageHeaderText}><h1 id="list-title" className={`${styles.pageTitle} title3 bold`}>메뉴 목록</h1></div>
            <div className={styles.pageActions}><Link className={`${styles.btn} ${styles.btnPrimary} label1 bold`} to="/menus/new"><Icon name="plus" />메뉴 등록</Link></div>
        </div>
        {location.state?.message && <Notice key={location.key} title={location.state.message} dismissible />}
        <form key={params.toString()} onSubmit={filter} className={`${styles.panel} ${styles.filterPanel}`} role="search" aria-label="메뉴 찾기">
            <div className={`${styles.field} ${styles.fieldSearch}`}>
                <label className={`${styles.fieldLabel} label1 bold`} htmlFor="menu-keyword">이름 검색</label>
                <div className={styles.control}><Icon name="search" className={styles.controlIcon} />
                    <input id="menu-keyword" className={`${styles.input} ${styles.hasIcon} body1`} name="q" type="search" defaultValue={keyword} placeholder="메뉴 이름을 입력하세요" />
                </div>
            </div>
            <div className={styles.field}>
                <label className={`${styles.fieldLabel} label1 bold`} htmlFor="menu-category-filter">하위 카테고리</label>
                <div className={styles.control}><select key={categories.loading ? 'loading' : 'ready'} id="menu-category-filter" className={`${styles.input} ${styles.select} body1`} name="category" defaultValue={category}
                    disabled={categories.loading || !!categories.error}>
                    <option value="">전체 카테고리</option>
                    {onlyChildren(categories.data || []).map(item => <option key={item.categoryCode} value={item.categoryCode}>{item.categoryName}</option>)}
                </select><Icon name="chevron" className={styles.selectChevron} /></div>
            </div>
            <div className={styles.field}>
                <label className={`${styles.fieldLabel} label1 bold`} htmlFor="menu-price-filter">기준 가격 초과</label>
                <div className={styles.control}><input id="menu-price-filter" className={`${styles.input} ${styles.hasSuffixLg} body1`} name="price" type="number" min="0" max="2147483647" step="1"
                    defaultValue={price} placeholder="예: 5000" /><span className={`${styles.suffix} label2`}>원 초과</span></div>
            </div>
            <div className={styles.filterActions}><button type="button" className={`${styles.btn} ${styles.btnSecondary} label1 bold`} onClick={reset}>필터 초기화</button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary} label1 bold`}><Icon name="search" />검색</button></div>
        </form>
        {categories.error && <Notice negative title="카테고리를 불러오지 못했습니다">{categories.error} <button type="button" className={`${styles.btn} ${styles.btnText} label1 bold`} onClick={categories.retry}>카테고리 다시 시도</button></Notice>}
        <Feedback {...resource} variant="list">
            {resource.data && <>
                <div className={styles.resultBar} aria-live="polite"><div className={`${styles.resultText} label1`}>
                    <p>{filtering ? '조건에 맞는 메뉴' : '전체'} <strong className="label1 bold">{resource.data.totalElements}</strong>개</p>
                    {filtering && <><span className={styles.muted}>전체 {resource.data.overallTotal}개 중</span>
                        <button type="button" className={`${styles.btn} ${styles.btnText} label1 bold`} onClick={reset}>필터 초기화</button></>}
                </div>{resource.data.totalPages > 0 && <span className={`${styles.muted} label1 medium`}>{page} / {resource.data.totalPages} 페이지</span>}</div>
                {resource.data.menus.length === 0
                    ? <EmptyState icon={filtering ? 'search' : 'menu'} title={outsidePage ? '이 페이지에 메뉴가 없습니다' : filtering ? '조건에 맞는 메뉴가 없습니다' : page > 1 ? '이 페이지에 메뉴가 없습니다' : '등록된 메뉴가 없습니다'}
                        action={outsidePage ? <button type="button" className={`${styles.btn} ${styles.btnSecondary} label1 bold`} onClick={() => movePage(1)}>첫 페이지로 이동</button>
                            : filtering ? <button type="button" className={`${styles.btn} ${styles.btnSecondary} label1 bold`} onClick={reset}>필터 초기화</button>
                            : page > 1 ? <button type="button" className={`${styles.btn} ${styles.btnSecondary} label1 bold`} onClick={() => movePage(1)}>첫 페이지로 이동</button>
                                : <Link className={`${styles.btn} ${styles.btnPrimary} label1 bold`} to="/menus/new"><Icon name="plus" />첫 메뉴 등록</Link>}>
                        <p>{outsidePage ? '조건에 맞는 메뉴는 있지만 현재 페이지가 범위를 벗어났습니다. 검색 조건을 유지한 채 첫 페이지로 이동해 주세요.'
                            : filtering ? `${condition} 조건으로 찾은 메뉴가 없어요. 검색어를 줄이거나 조건을 바꿔 보세요.`
                            : page > 1 ? '메뉴가 삭제되어 페이지가 비었을 수 있습니다. 첫 페이지에서 확인해 주세요.' : '첫 메뉴를 등록해 목록을 만들어 보세요.'}</p></EmptyState>
                    : <ul className={styles.menuGrid}>{resource.data.menus.map(menu => <li key={menu.menuCode}>
                        <Link to={'/menus/' + menu.menuCode} className={styles.menuCard} aria-label={`${menu.menuName}, ${menu.menuPrice.toLocaleString('ko-KR')}원, 상세 보기`}>
                            <div className={styles.menuCardTop}><span className={`${styles.chip} label2 medium`}>{menu.categoryName}</span><StatusBadge status={menu.orderableStatus} /></div>
                            <h2 className={`${styles.menuName} headline1 bold`}>{menu.menuName}</h2>
                            <p className={`${styles.menuPrice} heading2 bold`}>{menu.menuPrice.toLocaleString('ko-KR')}원</p>
                            <div className={`${styles.menuCardFoot} caption1`}><span>메뉴 번호 {menu.menuCode}</span><Icon name="right" small /></div>
                        </Link></li>)}</ul>}
                <Pagination page={page} totalPages={resource.data.totalPages} onChange={movePage} />
            </>}
        </Feedback>
    </section>;
}
