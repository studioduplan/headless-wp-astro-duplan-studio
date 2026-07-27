import Lenis from 'lenis';
import { loadGsap } from '@/utils/gsap';

let lenisPromise: ReturnType<typeof createLenis> | null = null;

async function createLenis() {
    const { gsap, ScrollTrigger } = await loadGsap();

    const lenis = new Lenis({
        autoRaf: false,
        smoothWheel: true,
        lerp: 0.1,
        duration: 1.2,
        syncTouch: false
    });

    const onScroll = () => {
        ScrollTrigger.update();
    };

    const raf = (time: number) => {
        lenis.raf(time * 1000);
    };

    // Lenis → ScrollTrigger
    lenis.on('scroll', onScroll);

    // GSAP → Lenis
    gsap.ticker.add(raf);

    // Désactive le lissage du deltaTime de GSAP
    gsap.ticker.lagSmoothing(0);

    return {
        lenis,

        destroy() {
            // Lenis → ScrollTrigger
            lenis.off('scroll', onScroll);

            // Retire Lenis du ticker GSAP
            gsap.ticker.remove(raf);

            // Détruit l'instance Lenis
            lenis.destroy();
        }
    };
}

export function getLenis() {
    if (!lenisPromise) {
        lenisPromise = createLenis().catch((error) => {
            // Permet une nouvelle tentative si le chargement échoue
            lenisPromise = null;
            throw error;
        });
    }

    return lenisPromise;
}
