import type Lenis from 'lenis';

export function initSticky(lenis: Lenis) {
    const header = document.querySelector<HTMLElement>('header.site-header');

    if (!header) {
        return;
    }

    /**
     * =====================================================
     * GET DARK SECTIONS
     * =====================================================
     */

    const getDarkSections = () => {
        return [...document.querySelectorAll<HTMLElement>('[data-bg-dark]')];
    };

    /**
     * =====================================================
     * UPDATE
     * =====================================================
     */

    const update = () => {
        const headerHeight = header.offsetHeight;

        /**
         * Sticky
         */
        header.classList.toggle('is-sticky', window.scrollY > headerHeight);

        /**
         * Contrast
         */
        const headerRect = header.getBoundingClientRect();

        const paddingOffset = 200;

        const isContrast = getDarkSections().some((section) => {
            const sectionRect = section.getBoundingClientRect();

            return headerRect.bottom > sectionRect.top + paddingOffset && headerRect.top < sectionRect.bottom - paddingOffset;
        });

        header.classList.toggle('is-contrast', isContrast);
    };

    /**
     * =====================================================
     * LENIS SCROLL
     * =====================================================
     */

    const handleScroll = () => {
        update();
    };

    lenis.on('scroll', handleScroll);

    /**
     * =====================================================
     * RESIZE
     * =====================================================
     */

    const handleResize = () => {
        update();
    };

    window.addEventListener('resize', handleResize);

    /**
     * =====================================================
     * INITIAL UPDATE
     * =====================================================
     */

    update();

    /**
     * =====================================================
     * CLEANUP
     * =====================================================
     */

    return () => {
        lenis.off('scroll', handleScroll);

        window.removeEventListener('resize', handleResize);

        header.classList.remove('is-sticky', 'is-contrast');
    };
}
