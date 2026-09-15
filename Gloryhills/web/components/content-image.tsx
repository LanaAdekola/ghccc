import Image from 'next/image';
export default function ContentImage({path,alt}:{path?:string;alt?:string}){return path?<Image src={`/api/media/${encodeURIComponent(path)}`} alt={alt||''} width={1200} height={800} unoptimized style={{width:'100%',height:'auto'}}/>:null;}
