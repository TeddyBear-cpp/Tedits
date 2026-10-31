export function HeroPortrait(){
  return <><picture className="hero-portrait"><source media="(max-width:760px)" srcSet="./assets/hero-model-480.webp 480w, ./assets/hero-model-960.webp 960w" sizes="100vw"/><img
    className="hero-image"
    src="./assets/hero-monochrome-1536.webp"
    srcSet="./assets/hero-monochrome-960.webp 960w, ./assets/hero-monochrome-1536.webp 1536w"
    sizes="(max-width: 760px) calc(144vh - 480px), (max-aspect-ratio: 3/2) 150vh, 100vw"
    alt="AURA campaign: the original jacket model in shield sunglasses, washed black jeans and a silver chain, beneath the large AURA wordmark. Plain black-and-white campaign photograph."
    width="1536"
    height="1024"
    fetchPriority="high"
    decoding="async"
  /></picture><img className="hero-mobile-wordmark" src="./assets/aura-wordmark.webp" alt="" aria-hidden="true" width="1786" height="506"/> </>;
}
