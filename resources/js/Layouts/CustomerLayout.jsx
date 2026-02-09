import { Link, usePage } from '@inertiajs/react';

const navLinkBase =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-slate-900';
const navLink = navLinkBase + ' text-slate-600 hover:bg-slate-100';
const navLinkActive = navLinkBase + ' text-primary-600 hover:bg-transparent hover:text-primary-700';

function getPathname(url) {
  if (!url) return '';
  try {
    return new URL(url, 'http://localhost').pathname;
  } catch {
    return url.startsWith('/') ? url : '/' + url;
  }
}

export default function CustomerLayout({ children }) {
  const page = usePage();
  const { auth } = page.props;
  const path = getPathname(page.url);

  return (
    <div className="min-h-screen w-full min-w-0 bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="rounded-lg px-2 py-1.5 text-lg font-semibold tracking-tight text-slate-900"
            >
              {auth?.user?.name}
            </Link>
            <nav className="ml-8 flex gap-1">
              <Link
                href="/dashboard"
                className={path === '/dashboard' ? navLinkActive : navLink}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/chatbots"
                className={
                  path.startsWith('/dashboard/chatbots') ? navLinkActive : navLink
                }
              >
                Chatbot
              </Link>
            </nav>
          </div>
          <Link
            href="/logout"
            method="post"
            as="button"
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Esci
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
