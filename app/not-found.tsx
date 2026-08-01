import { NotFoundBackButton } from '@/components/not-found-back-button';

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="text-center">
                <h1 className="text-[16rem] font-semibold text-primary">404</h1>
                <h2 className="text-2xl font-semibold text-primary">Page Not Found</h2>
                <p className="mt-3 leading-6 text-muted-foreground">The page you are looking for does not exist.</p>
                <NotFoundBackButton />
            </div>
        </main>
    );
}
