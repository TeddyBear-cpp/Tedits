export function HeroPortrait(){
  return <img
    className="hero-image"
    src="./assets/hero-monochrome-1536.webp"
    srcSet="./assets/hero-monochrome-960.webp 960w, ./assets/hero-monochrome-1536.webp 1536w"
    sizes="(max-width: 760px) calc(144vh - 480px), (max-aspect-ratio: 3/2) 150vh, 100vw"
    alt="AURA campaign: the original jacket model in shield sunglasses, washed black jeans and a silver chain, beneath the large AURA wordmark. Plain black-and-white campaign photograph."
    width="1536"
    height="1024"
    fetchPriority="high"
    decoding="async"
  />;
}
