import styles from './MenuUi.module.css';

const shapes = {
    menu: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    left: <path d="m15 18-6-6 6-6" />,
    right: <path d="m9 18 6-6-6-6" />,
    back: <path d="m11 5-7 7 7 7M4 12h16" />,
    check: <path d="m5 12 4 4L19 6" />,
    ban: <><circle cx="12" cy="12" r="9" /><path d="m6 6 12 12" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    edit: <><path d="m16 3 5 5M4 20l4-1L21 6l-4-4L4 15v5" /><path d="M12 20h8" /></>,
    trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></>,
    alert: <><path d="m12 3 10 18H2L12 3ZM12 9v5M12 17h.01" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 7a7 7 0 0 1 11-2l3 4M4 15l3 4a7 7 0 0 0 11-2" /></>,
    spinner: <path d="M21 12a9 9 0 1 1-6-8.5" />,
    moon: <path d="M20.5 13A9 9 0 0 1 11 3.5 9 9 0 1 0 20.5 13Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></>,
};

export default function Icon({ name, small = false, large = false, spin = false, className = '' }) {
    return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"
        className={[styles.icon, small && styles.iconSm, large && styles.iconLg, spin && styles.spin, className].filter(Boolean).join(' ')}>
        {shapes[name] || shapes.menu}
    </svg>;
}
