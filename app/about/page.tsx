'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Camera, Flower2, Layers3, Sparkles, WandSparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import tristan from '@/public/assets/images/tristan.png';

const pillars = [
    {
        title: 'Sensibilité',
        description: 'Chaque série commence par une intention: une émotion, un silence à faire exister',
        icon: Flower2,
        color: 'bg-purple-800 text-purple-50',
    },
    {
        title: 'Construction visuelle',
        description: 'La lumière et le cadre sont travaillés comme des éléments narratifs à part entière',
        icon: Layers3,
        color: 'bg-purple-900 text-purple-100',
    },
    {
        title: 'Expérimentation',
        description: 'Textures, flous et superpositions nourrissent une esthétique plus organique',
        icon: WandSparkles,
        color: 'bg-purple-950 text-purple-200',
    },
];

function EditorialFrame({ label, tone }: { label: string; tone: string }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60">
            <Image src={tristan} alt="Tristan" quality={100} />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 py-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Triste Fleur</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
                </div>
                <div className="rounded-full border border-white/15 bg-background/70 p-2 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>
        </div>
    );
}

export default function AboutPage() {
    return (
        <main className="min-h-screen px-6 md:px-8">
            <section>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(174,127,255,0.24),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_24%)] z-0" />
                <div className="relative flex flex-col-reverse lg:flex-row gap-10 lg:items-center justify-between">
                    <div className="max-w-3xl space-y-8 w-full lg:w-2/3">
                        <div className="space-y-5">
                            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Triste Fleur</p>
                            <p className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                Créateur de de mélancolie et d'atmosphères à travers la photographie
                            </p>
                            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                Triste Fleur est un projet de création visuelle qui explore les émotions, les textures et les ambiances à travers la
                                photographie. Avec une approche sensible et expérimentale, Je cherche à capturer des émotions, des détails et des
                                compositions qui invitent à la contemplation.
                            </p>
                        </div>

                        <Button asChild size="lg" className="rounded-full px-6">
                            <a href="#contact">
                                Parler d'un projet
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>

                    <div className="w-full lg:w-1/3">
                        <div className="pt-8">
                            <EditorialFrame label="Auto portrait" tone="bg-linear-to-br from-zinc-700 via-zinc-800 to-zinc-950" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 py-16 md:py-20 xl:grid-cols-[0.9fr_1.1fr]">
                <Card className="rounded-2xl border-border/70 bg-card/70">
                    <CardContent className="space-y-5 p-6 md:p-8">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4" />
                            Démarche
                        </div>
                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            Des images qui privilégient l'ambiance plutôt que l'effet.
                        </h2>
                        <p className="leading-7 text-muted-foreground">
                            Le résultat peut prendre la forme d’un portrait ou d’une série studio avec une direction éditoriale. L’objectif reste le
                            même : produire des images qui suscitent des émotions et invitent à la contemplation.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-3">
                    {pillars.map((pillar) => {
                        const Icon = pillar.icon;
                        return (
                            <Card key={pillar.title} className={`rounded-2xl ${pillar.color}`}>
                                <CardContent className="space-y-4 p-6 flex justify-center items-center flex-col h-full">
                                    <div className="flex mx-auto size-16 items-center justify-center rounded-xl bg-background/60">
                                        <Icon className="size-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-medium">{pillar.title}</h3>
                                        <p className="text-sm leading-6">{pillar.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>

            <section className="-mx-13 border-y border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(255,107,050,0.24),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(255,127,255,0.08),transparent_80%)] xl:px-44 py-16 md:py-20">
                <div className="max-w-3xl">
                    <div className="space-y-4">
                        <p className="text-sm uppercase tracking-[0.24em] text-orange-400">-18 🔥 </p>
                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">L'Art du nu</h2>
                        <p className="leading-7 text-muted-foreground">
                            <span className="font-semibold text-lg text-foreground">
                                La nudité est un thème encore trop souvent associé au porno. Encore plus chez les hommes
                            </span>
                            <br />
                            <br />
                            Je cherche à réconcilier le nu masculin et féminin avec une approche artistique, pour démontrer qu'un corps, même
                            "stimulé", peut être traité avec sensibilité et poésie tout en offrant de beaux clichés sensuels et érotiques.
                        </p>
                        <p className="leading-7 text-muted-foreground">
                            Je travail aussi sur des "focus" plus intimes, des détails du corps, des textures de peau, des jeux de lumière sur les
                            formes, pour créer une esthétique plus organique et moins "lisse" que ce que l'on voit habituellement dans la photographie
                            de nu.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24" id="contact">
                <div className="rounded-2xl border border-border bg-card px-6 py-10 sm:px-8 sm:py-12">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl space-y-3  z-10">
                            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
                            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Une collaboration, une commande ou simplement l’envie d’échanger ?
                            </h2>
                            <p className="text-muted-foreground">
                                N’hésite pas à me contacter pour toute question, projet ou simplement pour discuter de photographie et de création
                                visuelle. Je suis toujours ouvert à de nouvelles collaborations et échanges d’idées.
                            </p>
                        </div>

                        <Button asChild size="lg" className="rounded-full px-6 cursor-pointer z-10">
                            <Link href="mailto:contact.tristefleur@gmail.com">
                                Me contacter
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}
