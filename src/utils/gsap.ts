let gsapPromise: Promise<{
    gsap: typeof import('gsap').default;
    ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
    SplitText: typeof import('gsap/SplitText').SplitText;
}> | null = null;

export function loadGsap() {
    if (!gsapPromise) {
        gsapPromise = Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText')]).then(
            ([gsapModule, scrollTriggerModule, splitTextModule]) => {
                const gsap = gsapModule.default;
                const { ScrollTrigger } = scrollTriggerModule;
                const { SplitText } = splitTextModule;

                gsap.registerPlugin(ScrollTrigger, SplitText);

                return {
                    gsap,
                    ScrollTrigger,
                    SplitText
                };
            }
        );
    }

    return gsapPromise;
}

export function onIdle(callback: () => void) {
    setTimeout(() => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback);
        } else {
            callback();
        }
    }, 1500);
}
