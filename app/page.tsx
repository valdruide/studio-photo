import Link from 'next/link';
import { ArrowRight, ImageIcon, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const featuredWorks = [
    {
        title: 'Série 01',
        category: 'Portrait',
        format: 'Placeholder photo',
    },
    {
        title: 'Série 02',
        category: 'Studio',
        format: 'Placeholder photo',
    },
    {
        title: 'Série 03',
        category: 'Éditorial',
        format: 'Placeholder photo',
    },
    {
        title: 'Série 04',
        category: 'Création visuelle',
        format: 'Placeholder photo',
    },
    {
        title: 'Série 05',
        category: 'Texture',
        format: 'Placeholder photo',
    },
    {
        title: 'Série 06',
        category: 'Objet',
        format: 'Placeholder photo',
    },
];

const values = ['Photographie', 'Direction artistique', 'Textures', 'Expérimentations visuelles'];

function PlaceholderVisual({ label }: { label: string }) {
    return (
        <div className="relative overflow-hidden rounded-2xl border bg-muted/40">
            <div className="aspect-4/5 w-full bg-linear-to-br from-muted via-muted/60 to-background" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="rounded-full border border-border bg-background/80 p-3 backdrop-blur-sm">
                    <ImageIcon className="h-5 w-5" />
                </div>
                <p className="text-sm">{label}</p>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <main className="min-h-screen">
            <section>
                <div className="z-0 absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(174,127,255,0.24),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_24%)]" />
                <div className="mx-auto flex flex-col gap-8 md:px-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div className="max-w-2xl space-y-8 z-10">
                        <div className="flex flex-wrap gap-2 pt-2">
                            {values.map((item) => (
                                <Badge variant="outline" key={item} className="px-3 py-1.5 text-sm text-muted-foreground">
                                    {item}
                                </Badge>
                            ))}
                        </div>
                        <div className="space-y-5 ">
                            <p className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                Des images, des matières et des ambiances pensées comme des pièces à part entière
                            </p>
                            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                                J'explore la photographie et la création visuelle à travers des compositions sensibles, texturées et parfois plus
                                expérimentales. Cette page présente un aperçu de mon univers, entre séries, recherches esthétiques et images
                                construites.
                            </p>
                        </div>

                        <Button asChild size="lg" className="rounded-full px-6">
                            <Link href="/about">
                                À propos
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="pt-26">
                            <PlaceholderVisual label="Photo principale" />
                        </div>
                        <div className="space-y-4">
                            <PlaceholderVisual label="Détail / texture" />
                            <PlaceholderVisual label="Création secondaire" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
                <div className="mb-10">
                    <div className="max-w-xl space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4" />
                            Sélection
                        </div>
                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Quelques séries et fragments visuels</h2>
                        <p className="text-muted-foreground">
                            Un aperçu de mon travail à travers une sélection de séries et d’expérimentations visuelles.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {featuredWorks.map((work) => (
                        <Card
                            key={work.title}
                            className="overflow-hidden rounded-2xl border-border bg-card/70 shadow-sm transition-transform duration-300 hover:-translate-y-1"
                        >
                            <CardContent className="space-y-4">
                                <PlaceholderVisual label={work.format} />
                                <div className="space-y-1 px-1">
                                    <p className="text-sm text-muted-foreground">{work.category}</p>
                                    <h3 className="text-lg font-medium">{work.title}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="border-y bg-muted/20 -ml-5 -mr-5">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:px-8 md:py-20 lg:grid-cols-2 lg:items-center">
                    <div className="space-y-4 z-10">
                        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Démarche</p>
                        <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                            Un travail centré sur l’atmosphère, les formes et la sensation.
                        </h2>
                    </div>

                    <div className="space-y-4 text-muted-foreground z-10">
                        <p>
                            Mes créations cherchent un équilibre entre présence, silence et matière. Certaines images relèvent de la photographie
                            pure, d’autres d’une approche plus libre où la composition, la lumière et le traitement participent à construire une
                            émotion visuelle.
                        </p>
                        <p>
                            Cette structure peut ensuite accueillir des galeries, des séries détaillées, des textes d’intention ou encore une
                            présentation de services si tu veux mélanger démarche artistique et activité professionnelle.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24 ">
                <div className="rounded-2xl border border-border bg-card px-6 py-10 sm:px-8 sm:py-12 ">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl space-y-3 z-10">
                            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
                            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Une collaboration, une commande ou simplement l’envie d’échanger ?
                            </h2>
                            <p className="text-muted-foreground">
                                N’hésite pas à me contacter pour toute question, projet ou simplement pour discuter de photographie et de création
                                visuelle. Je suis toujours ouvert à de nouvelles collaborations et échanges d’idées.
                            </p>
                        </div>

                        <Button asChild size="lg" className="rounded-full px-6 z-10">
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
