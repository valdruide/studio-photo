import Link from 'next/link';
import { CircleHelp, Headphones, LifeBuoy, Mail, MessageSquare, Phone, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const faqItems = [
    {
        question: 'Why are my changes not visible right away?',
        answer: 'Most updates appear immediately after saving, but some screens may require a refresh. If you changed content structure, reopen the page in a new tab to confirm the public view.',
    },
    {
        question: 'What should I do if a client cannot access a protected gallery?',
        answer: 'First verify that the category or collection password is correct. Then test the access flow yourself in a private window to rule out an expired session or cached cookie. If the problem persists, you can change the password to reset all access and ask the client to try again with the new one.',
    },
    {
        question: 'How do I keep the admin area organized?',
        answer: 'Use clear category names, hide anything that is not ready yet, and reorder items regularly so the most active sections stay easy to reach.',
    },
    {
        question: 'When should I contact support?',
        answer: 'Reach out when saving fails repeatedly, media is missing, login access is blocked, or the public site behaves differently from the admin preview.',
    },
];

const supportSteps = [
    'Describe what you were trying to do and what happened instead.',
    'Include the page name, category, or collection involved.',
    'Add a screenshot and the exact time of the issue if possible.',
];

const contactItems = [
    {
        title: 'Email support',
        value: 'contact@emerell-boreale.fr',
        hint: 'Best for non-urgent issues, bug reports, and follow-up questions.',
        icon: Mail,
    },
    {
        title: 'WhatsApp support',
        value: '+33 6 82 71 61 89',
        hint: 'Ideal for quick admin questions and workflow guidance.',
        icon: MessageSquare,
    },
];

export default function AdminHelpPage() {
    return (
        <div className="space-y-4">
            <Card className="overflow-hidden">
                <CardHeader>
                    <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <LifeBuoy className="size-6 text-primary" />
                            Help and support for administrators
                        </CardTitle>
                        <CardDescription className="max-w-3xl text-sm md:text-base">
                            This page gives you a quick place to troubleshoot common issues, find the right contact channel, and keep the admin area
                            running smoothly.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="rounded-xl border bg-muted/30 p-5">
                        <div className="flex items-start gap-3">
                            <Sparkles className="mt-0.5 size-5 text-primary" />
                            <div className="space-y-2">
                                <p className="font-medium">Before you contact support</p>
                                <p className="text-sm text-muted-foreground">
                                    Check whether the issue is related to settings, hidden content, or a protected gallery. A quick review often
                                    resolves the most common admin problems.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-start gap-3">
                            <Headphones className="mt-0.5 size-5 text-primary" />
                            <div className="space-y-1">
                                <p className="font-medium">Fastest path to resolution</p>
                                <p className="text-sm text-muted-foreground">
                                    Please provide a screenshot and the name of the page where the issue occurred.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CircleHelp className="size-5 text-primary" />
                                Frequently asked questions
                            </CardTitle>
                            <CardDescription>Short answers to the issues admins run into most often.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {faqItems.map((item, index) => (
                                <div key={item.question} className="rounded-xl border p-4">
                                    <p className="font-medium">{item.question}</p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact information</CardTitle>
                            <CardDescription>Replace these placeholders with your real support details before going live.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {contactItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div key={item.title} className="rounded-xl border p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                                <Icon className="size-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium">{item.title}</p>
                                                <p className="text-sm">{item.value}</p>
                                                <p className="text-sm text-muted-foreground">{item.hint}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <Alert>
                        <LifeBuoy className="size-4" />
                        <AlertTitle>What to include in a support request</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc space-y-1 pl-5">
                                {supportSteps.map((step) => (
                                    <li key={step}>{step}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle>Good admin habits</CardTitle>
                            <CardDescription>Small checks that help prevent support requests later.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>Review category order regularly so your most important sections remain easy to manage.</p>
                            <p>Test protected pages in a private window when updating passwords or access rules.</p>
                            <p>Save changes in smaller batches when updating several settings, so issues are easier to isolate.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
