import type Lenis from 'lenis';

export function initAnchors(lenis: Lenis) {
    /**
     * =====================================================
     * DOM
     * =====================================================
     */

    const getLinks = () => {
        return [...document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')];
    };

    const getSections = () => {
        return [...document.querySelectorAll<HTMLElement>('main section[id]')];
    };

    const getHeader = () => {
        return document.querySelector<HTMLElement>('[data-header]');
    };

    /**
     * =====================================================
     * HEADER HEIGHT
     * =====================================================
     */

    const getHeaderHeight = () => {
        return getHeader()?.getBoundingClientRect().height ?? 0;
    };

    /**
     * =====================================================
     * ACTIVE LINK
     * =====================================================
     */

    const setActiveLink = (activeLink: HTMLAnchorElement) => {
        const links = getLinks();

        links.forEach((link) => {
            link.classList.remove('is-active');
        });

        activeLink.classList.add('is-active');
    };

    /**
     * =====================================================
     * REMOVE ACTIVE LINKS
     * =====================================================
     */

    const removeActiveLinks = () => {
        const links = getLinks();

        links.forEach((link) => {
            link.classList.remove('is-active');
        });
    };

    /**
     * =====================================================
     * GET LINK FOR SECTION
     * =====================================================
     */

    const getLinkForSection = (id: string) => {
        const links = getLinks();

        return links.find((link) => {
            const href = link.getAttribute('href');

            if (!href) {
                return false;
            }

            const url = new URL(href, window.location.href);

            return url.hash === `#${id}`;
        });
    };

    /**
     * =====================================================
     * HANDLE ANCHOR CLICK
     * =====================================================
     */

    const handleClick = (event: MouseEvent) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        const link = target.closest<HTMLAnchorElement>('a[href*="#"]');

        if (!link) {
            return;
        }

        const href = link.getAttribute('href');

        if (!href || href === '#') {
            return;
        }

        const url = new URL(href, window.location.href);

        /**
         * Uniquement les ancres
         * de la page courante
         */
        if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) {
            return;
        }

        const id = decodeURIComponent(url.hash.slice(1));

        const targetElement = document.getElementById(id);

        if (!targetElement) {
            return;
        }

        event.preventDefault();

        const headerHeight = getHeaderHeight() + 40;

        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

        /**
         * Mise à jour URL
         */
        history.pushState(null, '', url.hash);

        /**
         * Scroll Lenis
         */
        lenis.scrollTo(targetPosition, {
            duration: 1.5
        });

        /**
         * Active immédiatement
         */
        setActiveLink(link);
    };

    document.addEventListener('click', handleClick);

    /**
     * =====================================================
     * ACTIVE SECTION
     * =====================================================
     */

    let ticking = false;

    const updateActiveSection = () => {
        const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')];

        if (!sections.length) {
            removeActiveLinks();
            return;
        }

        const headerHeight = getHeaderHeight() + 64;

        /**
         * IMPORTANT :
         * Utilise getBoundingClientRect()
         * plutôt que offsetTop.
         *
         * Cela fonctionne mieux avec Lenis
         * et les transitions Astro.
         */
        const activeSection = sections.reduce<HTMLElement | null>((current, section) => {
            const top = section.getBoundingClientRect().top;

            if (top <= headerHeight) {
                return section;
            }

            return current;
        }, null);

        if (!activeSection) {
            removeActiveLinks();
            return;
        }

        const id = activeSection.getAttribute('id');

        if (!id) {
            removeActiveLinks();
            return;
        }

        const activeLink = getLinkForSection(id);

        if (!activeLink) {
            removeActiveLinks();
            return;
        }

        setActiveLink(activeLink);
    };

    /**
     * =====================================================
     * LENIS
     * =====================================================
     */

    const handleScroll = () => {
        if (ticking) {
            return;
        }

        ticking = true;

        requestAnimationFrame(() => {
            updateActiveSection();

            ticking = false;
        });
    };

    lenis.on('scroll', handleScroll);

    /**
     * =====================================================
     * INITIAL UPDATE
     * =====================================================
     */

    requestAnimationFrame(() => {
        updateActiveSection();
    });

    /**
     * =====================================================
     * RESIZE
     * =====================================================
     */

    const resizeObserver = new ResizeObserver(() => {
        updateActiveSection();
    });

    const observeHeader = getHeader();

    if (observeHeader) {
        resizeObserver.observe(observeHeader);
    }

    /**
     * =====================================================
     * ASTRO PAGE LOAD
     * =====================================================
     *
     * Après une transition ClientRouter,
     * le DOM vient d'être remplacé.
     *
     * On recalcule les sections.
     */

    const handlePageLoad = () => {
        requestAnimationFrame(() => {
            updateActiveSection();
        });
    };

    document.addEventListener('astro:page-load', handlePageLoad);

    /**
     * =====================================================
     * CLEANUP
     * =====================================================
     */

    return () => {
        document.removeEventListener('click', handleClick);

        document.removeEventListener('astro:page-load', handlePageLoad);

        lenis.off('scroll', handleScroll);

        resizeObserver.disconnect();

        removeActiveLinks();
    };
}
