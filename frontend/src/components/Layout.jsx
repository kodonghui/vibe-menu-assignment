import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import Icon from './Icon.jsx';
import styles from './MenuUi.module.css';

function initialTheme() {
    try {
        const saved = localStorage.getItem('vibe-menu-theme');
        if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* 저장 공간을 사용할 수 없더라도 테마 전환은 동작한다. */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function Layout() {
    const [theme, setTheme] = useState(initialTheme);
    const location = useLocation();
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        try { localStorage.setItem('vibe-menu-theme', theme); } catch { /* 선택 상태는 현재 화면에 유지된다. */ }
    }, [theme]);
    useEffect(() => {
        const label = location.pathname === '/' ? '메뉴 목록' : location.pathname === '/menus/new' ? '메뉴 등록'
            : location.pathname.endsWith('/edit') ? '메뉴 수정' : '메뉴 상세';
        document.title = label + ' · 메뉴 관리';
    }, [location.pathname]);
    return <div className={styles.appShell}>
        <a className={styles.skip} href="#main">본문으로 이동</a>
        <header className={styles.siteHeader}>
            <div className={styles.headerInner}>
                <NavLink className={styles.brand} to="/">
                    <span className={styles.brandMark}><Icon name="menu" /></span><span className="heading2 bold">메뉴 관리</span>
                </NavLink>
                <nav aria-label="주 메뉴" className={styles.nav}>
                    <NavLink className={`${styles.navLink} body2 medium`} to="/" end>메뉴 목록</NavLink>
                    <NavLink className={`${styles.navLink} body2 medium`} to="/menus/new">메뉴 등록</NavLink>
                </nav>
                <button type="button" className={`${styles.btn} ${styles.btnIcon} ${styles.themeButton}`}
                    aria-label={theme === 'light' ? '다크 테마로 전환' : '라이트 테마로 전환'}
                    title={theme === 'light' ? '다크 테마로 전환' : '라이트 테마로 전환'}
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} /></button>
            </div>
        </header>
        <main id="main" tabIndex="-1" className={styles.siteMain}><Outlet /></main>
        <footer className={`${styles.siteFooter} caption1`}><span>메뉴 관리</span><span>Spring Boot REST API · React 연동 과제</span></footer>
    </div>;
}
