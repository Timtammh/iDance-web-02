import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Search, Menu, ArrowUpRight } from "lucide-react";
import { useContent } from "../../hooks/useContent";
import { HomeAudio } from "../../sections/home/HomeAudio";
import { Modal } from "../ui/Modal";
import { savedConsent, setConsent } from "../../lib/analytics";
import { MobileProductsMenu, ProductsMenu } from "./ProductsMenu";
import { pendingProducts } from "../../data/pendingProductLists";
import { productTopics, topicHref } from "../../data/productTopics";

import bottomLogo from "../../pic/bottom.jpg";
import headerLogo from "../../pic/idance-logo.svg";
import instagramIcon from "../../icon/instagram (1).png";
import facebookIcon from "../../icon/facebook.png";
import youtubeIcon from "../../icon/youtube.png";
const socialIcons = [
  { name: "Instagram", icon: instagramIcon, match: /instagram|^ig$/i },
  { name: "Facebook", icon: facebookIcon, match: /facebook|^fb$/i },
  { name: "YouTube", icon: youtubeIcon, match: /youtube|youtu\.be/i },
];
export function Layout() {
  const data = useContent();
  const [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false),
    [query, setQuery] = useState(""),
    [cookies, setCookies] = useState(savedConsent() === null);
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const c = savedConsent();
    if (c) setConsent(c);
  }, []);
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
    } else window.scrollTo(0, 0);
  }, [pathname, hash]);
  const nav = data.settings.navigation?.length
    ? data.settings.navigation
    : [
        { label: "Products", path: "/products" },
        { label: "Find Your Sound", path: "/#find-your-sound" },
        { label: "About", path: "/about" },
        { label: "TV", path: "/tv" },
        { label: "Contact", path: "/contact" },
      ];
  const mainNav = nav.filter(n =>
    !["/#find-your-sound", "#find-your-sound", "/#news", "#news", "/news"].includes(n.path) &&
    !["find your sound", "news"].includes(n.label.trim().toLowerCase()),
  );
  const contactIndex = mainNav.findIndex(n => n.path === "/contact" || n.label.trim().toLowerCase() === "contact");
  mainNav.splice(contactIndex < 0 ? mainNav.length : contactIndex, 0, { label: "News", path: "/#news" });
  // The global search covers the same supplied catalogue as the product pages.
  // Prefer a published product when a pending entry names the same model.
  const modelKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const searchProducts = [
    ...data.products.map(product => ({ name: product.name, href: `/products/${encodeURIComponent(product.slug)}` })),
    ...pendingProducts.map(product => ({ name: product.name, href: `/products/${encodeURIComponent(product.slug)}?topic=${encodeURIComponent(product.topicId)}&category=${encodeURIComponent(product.subcategoryId)}` })),
  ].filter((product, index, all) => all.findIndex(other => modelKey(other.name) === modelKey(product.name)) === index);
  const searchResults = searchProducts.filter(product => modelKey(product.name).includes(modelKey(query)));
  const close = () => {
    setMenu(false);
    setSearch(false);
  };
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="header">
        <Link className="wordmark" to="/" aria-label="iDance home">
          <img src={headerLogo} alt="iDance" width={64} height={78} />
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          {mainNav.map((n) => n.path === "/products" ? (
            <ProductsMenu key={n.path} data={data} label={n.label} />
          ) : (
            <NavLink key={n.path} to={n.path} className={({ isActive }) => (n.path.includes("#") ? pathname + hash === n.path : isActive) ? "active" : undefined}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label="Search products"
            onClick={(e) => { e.currentTarget.focus(); setSearch(true); }}
          >
            <Search size={20} />
          </button>
          <Link className="header-explore" to="/products">
            Explore sound <ArrowUpRight size={16} />
          </Link>
          <button
            className="icon-button menu-toggle"
            aria-label="Open navigation"
            aria-expanded={menu}
            onClick={(e) => { e.currentTarget.focus(); setMenu(true); }}
          >
            <Menu />
          </button>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer-top">
          <div>
            <Link className="wordmark" to="/">
              <img src={bottomLogo} alt="iDance" />
            </Link>
            <p className="footer-company-name">iDance International limited</p>
            <p>{data.settings.brandStatement}</p>
            <div className="footer-socials" aria-label="Social media">
              {socialIcons.map(({ name, icon, match }) => {
                const social = data.settings.socialLinks?.find(link => match.test(link.label) || match.test(link.url));
                const image = <img src={icon} alt={name} width={24} height={24} />;
                return social ? (
                  <a key={name} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`${name} (opens in new tab)`}>{image}</a>
                ) : <span key={name}>{image}</span>;
              })}
            </div>
          </div>
          <div>
            <h3>Discover</h3>
            <Link to="/products">All products</Link>
            {productTopics.map((topic) => (
              <Link key={topic.id} to={topicHref(topic.id)}>
                {topic.label}
              </Link>
            ))}
          </div>
          <div>
            <h3>iDance</h3>
            <Link to="/about">Our story</Link>
            <Link to="/tv">iDance TV</Link>
            <Link to="/news">News</Link>
            <Link to="/contact">Contact us</Link>
            <span className="footer-resource-label">Instruction manual</span>
            <span className="footer-resource-label">Declaration of conformity</span>
          </div>
          <div>
            <h3>Stay connected</h3>
            {data.settings.socialLinks?.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
                {l.label} ↗
              </a>
            ))}
            <Link to="/contact">
              Product enquiries <ArrowUpRight size={14} />
            </Link>
            <p className="footer-note">
              Sound for the moments
              <br />
              that matter.
            </p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} iDance.{" "}
            {data.demo ? "Demo website." : "All rights reserved."}
          </span>
          <div>
            <Link to="/privacy">Privacy · pending</Link>
            <button onClick={() => setCookies(true)}>Cookie settings</button>
          </div>
        </div>
      </footer>
      <HomeAudio />
      {menu && (
        <Modal title="Explore iDance" onClose={close}>
          <nav className="mobile-nav">
            {mainNav.map((n) => n.path === "/products" ? (
              <MobileProductsMenu key={n.path} data={data} label={n.label} onNavigate={close} />
            ) : (
              <Link onClick={close} key={n.path} to={n.path}>
                {n.label}
                <ArrowUpRight />
              </Link>
            ))}
          </nav>
        </Modal>
      )}
      {search && (
        <Modal title="Find your sound" onClose={close}>
          <label className="field">
            Search products
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try karaoke or a product name"
              type="search"
            />
          </label>
          {query.trim() && <div className="search-results" aria-live="polite">
            {searchResults.map((p) => (
                <Link onClick={close} key={modelKey(p.name)} to={p.href}>
                  {p.name}
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            {!searchResults.length && <p>No products found. Try another name.</p>}
          </div>}
        </Modal>
      )}
      {cookies && (
        <aside className="consent" aria-label="Analytics preferences">
          <div>
            <strong>A little choice. Your privacy.</strong>
            <p>
              Allow optional analytics to help us understand how this site is
              used? No analytics loads before you accept.
            </p>
          </div>
          <div className="consent-actions">
            <button
              onClick={() => {
                setConsent("rejected");
                setCookies(false);
              }}
            >
              Reject analytics
            </button>
            <button
              onClick={() => {
                setConsent("accepted");
                setCookies(false);
              }}
            >
              Accept analytics
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
