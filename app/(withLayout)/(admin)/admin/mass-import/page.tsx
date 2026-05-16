'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
    ArrowRight,
    BadgeInfo,
    BookOpen,
    TriangleAlert,
    Copy,
    Download,
    FolderTree,
    ImagePlus,
    PlayCircle,
    Sparkles,
    TerminalSquare,
    Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const importHighlights = [
    {
        title: 'Category upsert by slug',
        description: 'The script creates or updates categories from the JSON file and keeps their order and visibility flags in sync.',
        icon: FolderTree,
    },
    {
        title: 'Collection upsert by slug',
        description: 'Each collection is attached to its parent category and imported with title, description, order, and hidden state.',
        icon: BookOpen,
    },
    {
        title: 'Photo upload pipeline',
        description: 'Photos are prepared before upload, can be converted to JPEG, resized, and enriched with width and height metadata.',
        icon: ImagePlus,
    },
];

const currentLimits = [
    'The existing script mainly targets the legacy fields used by categories, collections, and photos.',
    'The current admin now exposes extra fields such as category icon, color, allowAll, and password-protection options.',
    'If your PocketBase schema changed, treat this page as a reliable starter and extend the script before a production import.',
];

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

async function copyText(value: string, successMessage: string) {
    try {
        await navigator.clipboard.writeText(value);
        toast.success(successMessage);
    } catch (error) {
        console.error(error);
        toast.error('Copy failed');
    }
}

function downloadTextFile(filename: string, content: string) {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export default function AdminMassImportPage() {
    const [pbUrl, setPbUrl] = useState('http://127.0.0.1:8090');
    const [adminEmail, setAdminEmail] = useState('admin@example.com');
    const [jsonPath, setJsonPath] = useState('scripts/import-data.json');
    const [scriptPath, setScriptPath] = useState('scripts/import-pocketbase.mjs');
    const [categoryTitle, setCategoryTitle] = useState('Portraits');
    const [collectionTitle, setCollectionTitle] = useState('Studio Session');
    const [photoName, setPhotoName] = useState('Hero shot');
    const [photoPath, setPhotoPath] = useState('public/series/studio-session/photo-01.jpg');
    const [includeAdvancedFields, setIncludeAdvancedFields] = useState(true);

    const categorySlug = useMemo(() => slugify(categoryTitle) || 'category-slug', [categoryTitle]);
    const collectionSlug = useMemo(() => slugify(collectionTitle) || 'collection-slug', [collectionTitle]);

    const jsonExample = useMemo(() => {
        const category: Record<string, unknown> = {
            slug: categorySlug,
            title: categoryTitle || 'Portraits',
            order: 1,
            isHidden: false,
        };

        if (includeAdvancedFields) {
            category.color = '#FFFFFF';
            category.icon = 'IconFolderFilled';
            category.allowAll = true;
            category.lockedByPassword = false;
        }

        const collection: Record<string, unknown> = {
            slug: collectionSlug,
            title: collectionTitle || 'Studio Session',
            descriptionHtml: '<p>Describe the collection here.</p>',
            order: 1,
            isHidden: false,
        };

        if (includeAdvancedFields) {
            collection.lockedByPassword = false;
        }

        const photo: Record<string, unknown> = {
            file: photoPath || 'public/series/studio-session/photo-01.jpg',
            name: photoName || 'Hero shot',
            descriptionHtml: '<p>Optional HTML description for the photo.</p>',
            order: 1,
            isHidden: false,
        };

        return JSON.stringify(
            {
                categories: [
                    {
                        ...category,
                        collections: [
                            {
                                ...collection,
                                photos: [photo],
                            },
                        ],
                    },
                ],
            },
            null,
            4,
        );
    }, [categorySlug, categoryTitle, collectionSlug, collectionTitle, includeAdvancedFields, photoName, photoPath]);

    const envBlock = useMemo(
        () =>
            [
                `$env:NEXT_PUBLIC_PB_URL="${pbUrl || 'http://127.0.0.1:8090'}"`,
                `$env:PB_ADMIN_EMAIL="${adminEmail || 'admin@example.com'}"`,
                '$env:PB_ADMIN_PASSWORD="your-password"',
            ].join('\n'),
        [adminEmail, pbUrl],
    );

    const commandBlock = useMemo(
        () =>
            [
                '# Run from the project root',
                envBlock,
                `node ${scriptPath || 'scripts/import-pocketbase.mjs'}`,
                '',
                `# Expected JSON file`,
                `# ${jsonPath || 'scripts/import-data.json'}`,
            ].join('\n'),
        [envBlock, jsonPath, scriptPath],
    );

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Info className="size-6 text-primary" />
                        Important notice
                    </CardTitle>
                    <CardDescription>Future version is planned</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>
                        This script is <span className="underline text-primary">NOT</span> the final version of "mass import".
                        <br />A new easy-to-use import flow is planned for the future, but this page shares the current script knowledge and helps you
                        prepare a safe import in the meantime.
                    </p>
                </CardContent>
            </Card>
            <Card className="overflow-hidden">
                <CardHeader className="gap-4">
                    <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <TerminalSquare className="size-6 text-primary" />
                            Bulk import photos, collections, and categories
                        </CardTitle>
                        <CardDescription className="max-w-3xl text-sm md:text-base">
                            This page explains how the existing PocketBase import script works and helps you prepare a reusable JSON payload,
                            environment variables, and run commands for large imports.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-xl border bg-muted/30 p-5">
                        <div className="flex items-start gap-3">
                            <Sparkles className="mt-0.5 size-5 text-primary" />
                            <div className="space-y-2">
                                <p className="font-medium">Based on `scripts/import-pocketbase.mjs`</p>
                                <p className="text-sm text-muted-foreground">
                                    The script authenticates against PocketBase, upserts categories and collections by slug, then uploads photos from
                                    local files defined in a JSON tree.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-start gap-3">
                            <BadgeInfo className="mt-0.5 size-5 text-primary" />
                            <div className="space-y-2">
                                <p className="font-medium">Important limitation</p>
                                <p className="text-sm text-muted-foreground">
                                    The script is older than the current database schema. The guide below stays accurate for the import flow, but some
                                    new fields may need manual script updates before a final migration.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>How the script behaves</CardTitle>
                            <CardDescription>The current import logic in plain English.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="rounded-xl border p-4 border-destructive/50 bg-destructive/10">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                                        <TriangleAlert className="size-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-destructive">WARNING!</p>
                                        <p className="text-sm text-muted-foreground">
                                            Reimport with the same JSON file or import with existing slugs/categories/collections/photos may cause
                                            unintended updates, duplication, or data loss. Always backup your PocketBase data before a mass import and
                                            validate the script behavior with a small test file first.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {importHighlights.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div key={item.title} className="rounded-xl border p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                                <Icon className="size-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <Alert>
                        <BadgeInfo className="size-4" />
                        <AlertTitle>Current schema notes</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc space-y-1 pl-5">
                                {currentLimits.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recommended workflow</CardTitle>
                            <CardDescription>A safe order for large imports.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>1. Prepare a small JSON file with one category, one collection, and one photo.</p>
                            <p>2. Run the script once in a terminal from the project root.</p>
                            <p>3. Validate the records in the admin and confirm visibility, slugs, and passwords.</p>
                            <p>4. Scale up the JSON file only after the first import matches your current schema.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick actions</CardTitle>
                            <CardDescription>Useful shortcuts while you prepare the import.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Button asChild variant="secondary">
                                <Link href="/admin/help">
                                    Open help page
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>

                            <Button asChild variant="outline">
                                <Link href="/admin/settings">
                                    Open settings
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PlayCircle className="size-5 text-primary" />
                                Import builder
                            </CardTitle>
                            <CardDescription>Fill these fields to generate a starter JSON file and ready-to-run PowerShell commands.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>PocketBase URL</Label>
                                    <Input value={pbUrl} onChange={(e) => setPbUrl(e.target.value)} placeholder="http://127.0.0.1:8090" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Admin email</Label>
                                    <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@example.com" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Script path</Label>
                                    <Input
                                        value={scriptPath}
                                        onChange={(e) => setScriptPath(e.target.value)}
                                        placeholder="scripts/import-pocketbase.mjs"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>JSON path</Label>
                                    <Input value={jsonPath} onChange={(e) => setJsonPath(e.target.value)} placeholder="scripts/import-data.json" />
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Category title</Label>
                                    <Input value={categoryTitle} onChange={(e) => setCategoryTitle(e.target.value)} placeholder="Portraits" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Collection title</Label>
                                    <Input
                                        value={collectionTitle}
                                        onChange={(e) => setCollectionTitle(e.target.value)}
                                        placeholder="Studio Session"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>First photo name</Label>
                                    <Input value={photoName} onChange={(e) => setPhotoName(e.target.value)} placeholder="Hero shot" />
                                </div>

                                <div className="space-y-2">
                                    <Label>First photo file path</Label>
                                    <Input
                                        value={photoPath}
                                        onChange={(e) => setPhotoPath(e.target.value)}
                                        placeholder="public/series/studio-session/photo-01.jpg"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border p-4">
                                <div className="space-y-1">
                                    <p className="font-medium">Include newer schema hints</p>
                                    <p className="text-sm text-muted-foreground">
                                        Adds generic fields like `color`, `icon`, `allowAll`, and password flags to the template.
                                    </p>
                                </div>
                                <Switch checked={includeAdvancedFields} onCheckedChange={setIncludeAdvancedFields} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div className="space-y-1">
                                <CardTitle>Generated JSON template</CardTitle>
                                <CardDescription>Use this as a starting point for `import-data.json`.</CardDescription>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => copyText(jsonExample, 'JSON template copied')}>
                                    <Copy className="size-4" />
                                    Copy
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => downloadTextFile('import-data.json', jsonExample)}>
                                    <Download className="size-4" />
                                    Download
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea value={jsonExample} readOnly className="min-h-[360px] font-mono text-xs leading-5" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div className="space-y-1">
                                <CardTitle>PowerShell command block</CardTitle>
                                <CardDescription>Set the environment variables, then run the import script locally.</CardDescription>
                            </div>

                            <Button variant="outline" size="sm" onClick={() => copyText(commandBlock, 'Command block copied')}>
                                <Copy className="size-4" />
                                Copy
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Textarea value={commandBlock} readOnly className="min-h-[220px] font-mono text-xs leading-5" />
                            <p className="text-sm text-muted-foreground">
                                This page prepares the import but does not execute the Node script from the browser. Run the command in your local
                                terminal from the project root.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
