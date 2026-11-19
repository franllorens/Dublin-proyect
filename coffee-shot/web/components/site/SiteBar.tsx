import s from "./SiteBar.module.css";

/** The thin bar on the sub-pages (full menu, club card): the café's seal and the way back to the home page. */
export function SiteBar({ back = "Back to the café" }: { back?: string }) {
  return (
    <header className={s.bar}>
      <div className={s.inner}>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is a static file (public/index.html) */}
        <a className={s.home} href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo-96.png" width={32} height={32} alt="" />
          <span>The Coffee Shot</span>
        </a>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className={s.back} href="/">
          {back}
        </a>
      </div>
    </header>
  );
}
