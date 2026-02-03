import { Fragment, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    BookOpenIcon,
    Cog6ToothIcon,
    CodeBracketIcon,
    UsersIcon,
    ArrowRightOnRectangleIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { PageProps, User, Tenant } from '@/types';

interface ClientLayoutProps {
    children: React.ReactNode;
    title?: string;
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function ClientLayout({ children, title }: ClientLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { auth, flash, impersonating, tenant } = usePage<PageProps & {
        auth: { user: User };
        tenant?: { name: string; plan: string };
        impersonating?: boolean;
    }>().props;
    const currentPath = window.location.pathname;
    const user = auth.user;

    const navigation = [
        { name: 'Dashboard', href: '/', icon: HomeIcon, show: true },
        { name: 'Conversazioni', href: '/conversations', icon: ChatBubbleLeftRightIcon, show: true },
        { name: 'Lead', href: '/leads', icon: UserGroupIcon, show: true },
        { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpenIcon, show: user?.role !== 'viewer' },
        { name: 'Impostazioni', href: '/settings/bot', icon: Cog6ToothIcon, show: user?.role !== 'viewer' },
        { name: 'Utenti', href: '/users', icon: UsersIcon, show: user?.role === 'owner' },
        { name: 'Codice Embed', href: '/embed', icon: CodeBracketIcon, show: true },
    ].filter(item => item.show);

    const settingsSubnav = [
        { name: 'Bot', href: '/settings/bot' },
        { name: 'Widget', href: '/settings/widget' },
    ];

    return (
        <div>
            {/* Impersonation banner */}
            {impersonating && (
                <div className="bg-yellow-500 text-yellow-900 text-center py-2 text-sm font-medium">
                    Stai visualizzando come {user?.name}.{' '}
                    <Link
                        href="/stop-impersonation"
                        method="post"
                        as="button"
                        className="underline hover:no-underline"
                    >
                        Termina impersonazione
                    </Link>
                </div>
            )}

            {/* Mobile sidebar */}
            <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                                            <span className="sr-only">Chiudi sidebar</span>
                                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>

                                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                                    <div className="flex h-16 shrink-0 items-center">
                                        <span className="text-xl font-bold text-primary-600">{tenant?.name || 'Chatbot'}</span>
                                    </div>
                                    <nav className="flex flex-1 flex-col">
                                        <ul className="flex flex-1 flex-col gap-y-7">
                                            <li>
                                                <ul className="-mx-2 space-y-1">
                                                    {navigation.map((item) => (
                                                        <li key={item.name}>
                                                            <Link
                                                                href={item.href}
                                                                className={classNames(
                                                                    currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))
                                                                        ? 'bg-primary-50 text-primary-600'
                                                                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                                                )}
                                                                onClick={() => setSidebarOpen(false)}
                                                            >
                                                                <item.icon
                                                                    className={classNames(
                                                                        currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))
                                                                            ? 'text-primary-600'
                                                                            : 'text-gray-400 group-hover:text-primary-600',
                                                                        'h-6 w-6 shrink-0'
                                                                    )}
                                                                    aria-hidden="true"
                                                                />
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                        <span className="text-xl font-bold text-primary-600">{tenant?.name || 'Chatbot'}</span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul className="-mx-2 space-y-1">
                                    {navigation.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={classNames(
                                                    currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))
                                                        ? 'bg-primary-50 text-primary-600'
                                                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                                )}
                                            >
                                                <item.icon
                                                    className={classNames(
                                                        currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))
                                                            ? 'text-primary-600'
                                                            : 'text-gray-400 group-hover:text-primary-600',
                                                        'h-6 w-6 shrink-0'
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li className="mt-auto">
                                <div className="flex items-center gap-x-4 py-3 text-sm font-semibold leading-6 text-gray-900">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                                        <span className="text-sm font-medium text-primary-600">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </span>
                                    <span className="flex-1 truncate">{user?.name}</span>
                                </div>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary-600 w-full"
                                >
                                    <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600" aria-hidden="true" />
                                    Logout
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top bar */}
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Apri sidebar</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex flex-1 items-center">
                            {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
                        </div>
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            {tenant?.plan && (
                                <span className="hidden sm:inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                                    {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Flash messages */}
                        {flash?.success && (
                            <div className="mb-4 rounded-md bg-green-50 p-4">
                                <p className="text-sm font-medium text-green-800">{flash.success}</p>
                            </div>
                        )}
                        {flash?.error && (
                            <div className="mb-4 rounded-md bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">{flash.error}</p>
                            </div>
                        )}
                        {flash?.info && (
                            <div className="mb-4 rounded-md bg-blue-50 p-4">
                                <p className="text-sm font-medium text-blue-800">{flash.info}</p>
                            </div>
                        )}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
