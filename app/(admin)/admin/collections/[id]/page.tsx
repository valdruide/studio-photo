// import { getPBAdmin } from '@/lib/pb/adminServer';
// import UploadPhotoForm from './upload-form';
// import PhotoRow from './photo-row';

// export default async function CollectionAdminPage({ params }: { params: { id: string } }) {
//     const pb = await getPBAdmin();
//     const col = await pb.collection('photo_collections').getOne(params.id);

//     const photos = await pb.collection('photos').getFullList({
//         filter: `collection="${col.id}"`,
//         sort: 'order',
//     });

//     return (
//         <div className="space-y-6">
//             <div className="border rounded-lg p-4 space-y-1">
//                 <div className="text-2xl font-semibold">{(col as any).title}</div>
//                 <div className="text-sm opacity-70">slug: {(col as any).slug}</div>
//                 <div className="text-sm opacity-70">id: {col.id}</div>
//             </div>

//             <UploadPhotoForm collectionId={col.id} />

//             <div className="border rounded-lg">
//                 <div className="p-3 border-b font-medium">Photos ({photos.length})</div>
//                 <div className="divide-y">
//                     {photos.map((p: any) => (
//                         <PhotoRow key={p.id} photo={p} />
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// }
