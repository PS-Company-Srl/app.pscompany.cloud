import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Laravel + Inertia + React
                </h1>
                <p className="text-gray-600">
                    Setup completato. Puoi iniziare a sviluppare.
                </p>
            </div>
        </>
    );
}
