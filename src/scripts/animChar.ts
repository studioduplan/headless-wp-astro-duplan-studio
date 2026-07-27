import { loadGsap, onIdle } from '@/utils/gsap';

interface AnimCharInstance {
    splits: SplitText[];
    chars: Element[];
    animation: gsap.core.Tween | gsap.core.Timeline;
}

const instances = new WeakMap<HTMLElement, AnimCharInstance>();

/**
 * =========================================================
 * INIT ANIM CHAR
 * =========================================================
 *
 * data-anim-char
 * └── Animation caractère par caractère
 *
 * data-anim-char + <strong>
 * └── Seuls les <strong> sont animés
 *
 * data-anim-char="hero"
 * └── Animation spécifique Hero
 *
 * data-anim-char="text"
 * └── Animation simple du texte complet
 */

export async function initAnimChar() {
    const elements = document.querySelectorAll<HTMLElement>('[data-anim-char]');

    if (!elements.length) return;

    const { gsap, SplitText } = await loadGsap();

    /**
     * =====================================================
     * ANIMATION
     * =====================================================
     */
    const animate = (element: HTMLElement) => {
        // Évite les doubles initialisations
        if (instances.has(element)) return;

        const variant = element.dataset.animChar;

        /**
         * -------------------------------------------------
         * OPTIONS
         * -------------------------------------------------
         */
        const delay = Number(element.dataset.animDelay ?? 0);

        const stagger = Number(element.dataset.animStagger ?? 0.025);

        const yPercent = Number(element.dataset.animY ?? 100);

        const duration = Number(element.dataset.animDuration ?? 0.8);

        const rotate = Number(element.dataset.animRotate ?? 0);

        const scale = Number(element.dataset.animScale ?? 1);

        /**
         * =================================================
         * ANIMATION TEXTE SIMPLE
         * =================================================
         *
         * <div data-anim-char="text">
         *     Mon texte
         * </div>
         *
         * Le texte entier est animé comme un seul bloc.
         */
        if (variant === 'text') {
            const animation = gsap.fromTo(
                element,
                {
                    y: Number(element.dataset.animY ?? 30),
                    opacity: 0
                },
                {
                    y: 0,
                    opacity: 1,
                    duration,
                    delay,
                    ease: 'power3.out',
                    overwrite: 'auto'
                }
            );

            instances.set(element, {
                splits: [],
                chars: [],
                animation
            });

            return;
        }

        /**
         * =================================================
         * ANIMATION CHARACTER
         * =================================================
         *
         * Si <strong> présents :
         * → uniquement les <strong>
         *
         * Sinon :
         * → tout le texte
         */
        const strongs = Array.from(element.querySelectorAll<HTMLElement>('strong'));

        const targets = strongs.length ? strongs : [element];

        const splits: SplitText[] = [];
        const allChars: Element[] = [];

        /**
         * Split chaque target
         */
        targets.forEach((target) => {
            const split = SplitText.create(target, {
                type: 'chars',
                charsClass: 'char'
            });

            if (!split.chars.length) {
                split.revert();
                return;
            }

            splits.push(split);

            allChars.push(...split.chars);

            // Accessibilité
            target.removeAttribute('aria-label');
        });

        if (!allChars.length) {
            splits.forEach((split) => {
                split.revert();
            });

            return;
        }

        /**
         * =================================================
         * VARIANTE HERO
         * =================================================
         */
        if (variant === 'hero') {
            const tl = gsap.timeline({
                delay
            });

            splits.forEach((split, index) => {
                tl.fromTo(
                    split.chars,
                    {
                        yPercent: 0,
                        rotate: 0,
                        scale: 1
                    },
                    {
                        keyframes: [
                            {
                                yPercent: -25,
                                rotate: -2,
                                scale: 1.04,
                                duration: 0.12,
                                ease: 'sine.out'
                            },
                            {
                                yPercent: 0,
                                rotate: 0,
                                scale: 1,
                                duration: 0.3,
                                ease: 'sine.out(1.2, 0.5)'
                            }
                        ],
                        stagger: {
                            each: stagger,
                            from: 'start'
                        },
                        overwrite: 'auto'
                    },
                    index === 0 ? 0 : '>+0.1'
                );
            });

            instances.set(element, {
                splits,
                chars: allChars,
                animation: tl
            });

            return;
        }

        /**
         * =================================================
         * ANIMATION CHARACTÈRE GÉNÉRIQUE
         * =================================================
         */
        const animation = gsap.fromTo(
            allChars,
            {
                yPercent,
                rotate,
                scale,
                opacity: 0
            },
            {
                yPercent: 0,
                rotate: 0,
                scale: 1,
                opacity: 1,
                duration,
                delay,
                ease: 'power3.out',
                stagger: {
                    each: stagger,
                    from: 'start'
                },
                overwrite: 'auto'
            }
        );

        instances.set(element, {
            splits,
            chars: allChars,
            animation
        });
    };

    /**
     * =====================================================
     * DESTROY
     * =====================================================
     */
    const destroy = (element: HTMLElement) => {
        const instance = instances.get(element);

        if (!instance) return;

        // Stop animation
        instance.animation.kill();

        // Stoppe les tweens sur les chars
        if (instance.chars.length) {
            gsap.killTweensOf(instance.chars);
        }

        // Restaure le DOM original
        instance.splits.forEach((split) => {
            split.revert();
        });

        // Stoppe les animations sur
        // l'élément lui-même
        gsap.killTweensOf(element);

        // Supprime l'instance
        instances.delete(element);
    };

    /**
     * =====================================================
     * INTERSECTION OBSERVER
     * =====================================================
     */
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const element = entry.target as HTMLElement;

                if (entry.isIntersecting) {
                    animate(element);
                } else {
                    destroy(element);
                }
            });
        },
        {
            threshold: 0.1
        }
    );

    /**
     * Observe tous les éléments
     */
    elements.forEach((element) => {
        observer.observe(element);
    });

    /**
     * =====================================================
     * ASTRO VIEW TRANSITIONS CLEANUP
     * =====================================================
     */
    document.addEventListener(
        'astro:before-swap',
        () => {
            elements.forEach((element) => {
                destroy(element);

                observer.unobserve(element);
            });

            observer.disconnect();
        },
        {
            once: true
        }
    );
}

onIdle(initAnimChar);
document.addEventListener('astro:page-load', initAnimChar);
