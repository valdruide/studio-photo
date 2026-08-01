'use client';

import { Button } from '@/components/ui/button';

export function NotFoundBackButton() {
    function goBack() {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        window.location.assign('/');
    }

    return (
        <Button className="mt-6" onClick={goBack}>
            Go Back
        </Button>
    );
}
