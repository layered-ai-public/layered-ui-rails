import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { NavLink, Link } from "react-router-dom"
import { cn } from "../utilities/cn"
import { useTheme } from "../hooks/useTheme"
import { useMobileNavigation } from "../hooks/useMobileNavigation"
import { IconHamburger, IconClose, IconSun, IconMoon } from "../icons"

/* ------------------------------------------------------------------ */
/*  SkipLink                                                           */
/* ------------------------------------------------------------------ */

export function SkipLink() {
  return (
    <a href="#main-content" className="l-ui-skip-link">
      Skip to main content
    </a>
  )
}

/* ------------------------------------------------------------------ */
/*  LiveRegion                                                         */
/* ------------------------------------------------------------------ */

export function LiveRegion() {
  return (
    <div id="l-ui-live-region" className="l-ui-sr-only" aria-live="polite" />
  )
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

export interface HeaderProps {
  onToggleMobileNav?: () => void
  isMobileNavOpen?: boolean
}

export function Header({ onToggleMobileNav, isMobileNavOpen }: HeaderProps) {
  const { isDark, toggle } = useTheme()

  return (
    <header className="l-ui-container--header">
      <div className="l-ui-header">
        <Link to="/" aria-label="Home">
          <img
            src="/images/icon_light.svg"
            alt=""
            className="l-ui-header__icon l-ui-header__icon--light"
            aria-hidden="true"
          />
          <img
            src="/images/icon_dark.svg"
            alt=""
            className="l-ui-header__icon l-ui-header__icon--dark"
            aria-hidden="true"
          />
          <img
            src="/images/logo_light.svg"
            alt="layered-ui-rails"
            className="l-ui-header__logo l-ui-header__logo--light"
          />
          <img
            src="/images/logo_dark.svg"
            alt="layered-ui-rails"
            className="l-ui-header__logo l-ui-header__logo--dark"
          />
        </Link>

        <nav className="l-ui-header__navigation" aria-label="Header">
          <button
            type="button"
            className="l-ui-button--icon l-ui-theme-toggle"
            onClick={toggle}
            aria-pressed={isDark}
            aria-label="Toggle dark mode"
          >
            <span className="l-ui-theme-toggle__icon--light" aria-hidden="true">
              <IconMoon width={20} height={20} />
            </span>
            <span className="l-ui-theme-toggle__icon--dark" aria-hidden="true">
              <IconSun width={20} height={20} />
            </span>
          </button>

          {onToggleMobileNav && (
            <button
              type="button"
              className="l-ui-button--mobile-navigation"
              onClick={onToggleMobileNav}
              aria-expanded={isMobileNavOpen}
              aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
            >
              {isMobileNavOpen ? (
                <IconClose width={24} height={24} aria-hidden="true" />
              ) : (
                <IconHamburger width={24} height={24} aria-hidden="true" />
              )}
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

export interface NavigationItemDef {
  label: string
  path: string
  children?: NavigationItemDef[]
}

export interface NavigationProps {
  items: NavigationItemDef[]
  isOpen?: boolean
  navigationRef?: React.RefObject<HTMLElement | null>
  user?: { name: string; email: string }
  onLogout?: () => void
}

export function Navigation({
  items,
  isOpen,
  navigationRef,
  user,
  onLogout,
}: NavigationProps) {
  return (
    <>
      <nav
        ref={navigationRef}
        className={cn(
          "l-ui-container--navigation",
          isOpen && "open",
        )}
        aria-label="Main"
      >
        <div className="l-ui-navigation">
          <ul className="l-ui-navigation__links">
            {items.map((item) => (
              <NavigationItem key={item.path} item={item} />
            ))}
          </ul>
          {user && (
            <div className="l-ui-navigation__user">
              <div className="l-ui-navigation__user-name-and-email">
                <span className="l-ui-navigation__user-name">
                  {user.name}
                </span>
                <span className="l-ui-navigation__user-email">
                  {user.email}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  className="l-ui-button--outline l-ui-utility--mt-md"
                  onClick={onLogout}
                >
                  Log out
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className={cn("l-ui-backdrop--navigation", isOpen && "open")} />
    </>
  )
}

function NavigationItem({ item }: { item: NavigationItemDef }) {
  const hasChildren = item.children && item.children.length > 0

  return (
    <li style={{ listStyle: "none" }}>
      <NavLink
        to={item.path}
        end={!hasChildren}
        className={({ isActive }) =>
          isActive
            ? "l-ui-navigation__item--active"
            : "l-ui-navigation__item"
        }
      >
        {item.label}
      </NavLink>
      {hasChildren && (
        <ul className="l-ui-navigation__secondary">
          {item.children!.map((child) => (
            <NavigationItem key={child.path} item={child} />
          ))}
        </ul>
      )}
    </li>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  withNavigation?: boolean
  verticallyCentered?: boolean
  widthConstrained?: boolean
}

export const Page = forwardRef<HTMLDivElement, PageProps>(
  (
    { withNavigation, verticallyCentered, widthConstrained, className, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        withNavigation ? "l-ui-page--with-navigation" : "l-ui-page",
        verticallyCentered && "l-ui-page--vertically-centered",
        widthConstrained && "l-ui-page--width-constrained",
        className,
      )}
      {...props}
    />
  ),
)
Page.displayName = "Page"

/* ------------------------------------------------------------------ */
/*  AppShell                                                           */
/* ------------------------------------------------------------------ */

export interface AppShellProps {
  children: ReactNode
  navigation?: NavigationItemDef[]
  user?: { name: string; email: string }
  onLogout?: () => void
}

export function AppShell({
  children,
  navigation,
  user,
  onLogout,
}: AppShellProps) {
  const mobileNav = useMobileNavigation()
  const hasNav = !!navigation && navigation.length > 0

  return (
    <>
      <SkipLink />
      <LiveRegion />

      <Header
        onToggleMobileNav={hasNav ? mobileNav.toggle : undefined}
        isMobileNavOpen={mobileNav.isOpen}
      />

      {hasNav && (
        <Navigation
          items={navigation}
          isOpen={mobileNav.isOpen}
          navigationRef={mobileNav.navigationRef}
          user={user}
          onLogout={onLogout}
        />
      )}

      <main id="main-content" className="l-ui-main">
        <div className={hasNav ? "l-ui-page--with-navigation" : "l-ui-page"}>
          {children}
        </div>
      </main>
    </>
  )
}
